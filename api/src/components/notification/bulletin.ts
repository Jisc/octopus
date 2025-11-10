import * as I from 'interface';
import * as email from 'lib/email';
import * as Helpers from 'lib/helpers';
import * as notificationService from 'notification/service';
import * as userService from 'user/service';

// Use 6 days + 23 hours instead of exactly 7 days to ensure the condition passes on weekly cron runs
const BULLETIN_DIGEST_DELTA_TIME = 6.9 * 24 * 60 * 60 * 1000;
const BULLETIN_USERS_PER_BATCH = 10;

type BulletinNotifications = Awaited<ReturnType<typeof notificationService.getBulletin>>;

const NOTIFICATION_SETTINGS_MAP: Record<I.NotificationActionTypeEnum, keyof NonNullable<I.User['settings']>> = {
    [I.NotificationActionTypeEnum.PUBLICATION_BOOKMARK_VERSION_CREATED]: 'enableBookmarkVersionNotifications',
    [I.NotificationActionTypeEnum.PUBLICATION_BOOKMARK_RED_FLAG_RAISED]: 'enableBookmarkFlagNotifications',
    [I.NotificationActionTypeEnum.PUBLICATION_BOOKMARK_RED_FLAG_RESOLVED]: 'enableBookmarkFlagNotifications',
    [I.NotificationActionTypeEnum.PUBLICATION_BOOKMARK_RED_FLAG_COMMENTED]: 'enableBookmarkFlagNotifications',
    [I.NotificationActionTypeEnum.PUBLICATION_VERSION_RED_FLAG_RAISED]: 'enableVersionFlagNotifications',
    [I.NotificationActionTypeEnum.PUBLICATION_VERSION_PEER_REVIEWED]: 'enablePeerReviewNotifications',
    [I.NotificationActionTypeEnum.PUBLICATION_VERSION_LINKED_PREDECESSOR]: 'enableLinkedNotifications',
    [I.NotificationActionTypeEnum.PUBLICATION_VERSION_LINKED_SUCCESSOR]: 'enableLinkedNotifications'
};

async function sendSingle(
    userId: string,
    userNotifications: BulletinNotifications,
    digestDeltaTime: number,
    force: boolean
): Promise<I.NotificationSendSingleResponse> {
    const response: I.NotificationSendSingleResponse = { error: null, skipped: false };

    if (userNotifications.length === 0) {
        return response;
    }

    const user = await userService.get(userId, true);

    if (!user || !user.email) {
        response.error = new Error(`User with ID ${userId} does not exist or has no email.`);

        return response;
    }

    // skip if the user has already received a bulletin notification within the specified time frame
    if (!force && user.lastBulletinSentAt && user.lastBulletinSentAt.getTime() > Date.now() - digestDeltaTime) {
        response.skipped = true;

        return response;
    }

    const notificationsToBeDeleted: string[] = [];
    const notificationsByActionType: Map<I.NotificationActionTypeEnum, BulletinNotifications> = new Map();

    // Construct the notifications by action type and user settings
    for (const notification of userNotifications) {
        if (!notificationsByActionType.has(notification.actionType)) {
            notificationsByActionType.set(notification.actionType, []);
        }

        const currentActionNotifications = notificationsByActionType.get(notification.actionType) || [];

        // Filter out notifications that are for the same entity and action type, keeping only the most recent one
        const notificationSameEntityIdIndex = currentActionNotifications.findIndex(
            (n) => n.entityId === notification.entityId
        );

        if (notificationSameEntityIdIndex !== -1) {
            const notificationSameEntity = currentActionNotifications[notificationSameEntityIdIndex];

            if (notification.createdAt > notificationSameEntity.createdAt) {
                // This notification is more recent than the one we already have for this entity and action type, so replace it
                currentActionNotifications.splice(notificationSameEntityIdIndex, 1);
            } else {
                // This notification is older than the one we already have for this entity and action type, so skip it
                continue;
            }
        }

        const settingField = NOTIFICATION_SETTINGS_MAP[notification.actionType];

        // user.settings?.[field] should be checked against false specifically as any
        // other value (undefined, null, etc) should be considered true (it's opt-out)
        if (settingField && user.settings?.[settingField] === false) {
            notificationsToBeDeleted.push(notification.id);
        } else {
            currentActionNotifications.push(notification);
        }
    }

    if (notificationsToBeDeleted.length > 0) {
        try {
            await notificationService.removeMany(notificationsToBeDeleted);
        } catch (error) {
            response.error =
                error instanceof Error ? error : new Error('Unknown error occurred while clearing notifications');
            console.error(`Failed to clear notifications for user ${userId}:`, response.error);

            return response;
        }
    }

    try {
        await email.notifyBulletin({ recipientEmail: user.email, notificationsByActionType });
    } catch (error) {
        response.error = error instanceof Error ? error : new Error('Unknown error occurred while sending email');
        console.error(`Failed to send bulletin notification to user ${userId}:`, response.error);

        return response;
    }

    try {
        await userService.updateUser(userId, { lastBulletinSentAt: new Date() });
    } catch (error) {
        response.error = error instanceof Error ? error : new Error('Unknown error occurred while updating user');
        console.error(`Failed to update lastBulletinSentAt for user ${userId}:`, response.error);

        return response;
    }

    return response;
}

async function processBatch(
    userBatch: Array<{ userId: string; notifications: BulletinNotifications }>,
    digestDeltaTime: number,
    sent: BulletinNotifications,
    failed: BulletinNotifications,
    skipped: BulletinNotifications,
    failedUserIds: Set<string>,
    force: boolean
): Promise<{ errors: Error[] }> {
    const errors: Error[] = [];
    // Send notifications to all users in the batch concurrently
    const batchPromises = userBatch.map(async ({ userId, notifications }) => {
        const result = await sendSingle(userId, notifications, digestDeltaTime, force);

        return { userId, notifications, result };
    });

    const results = await Promise.allSettled(batchPromises);

    for (const settlementResult of results) {
        if (settlementResult.status === 'rejected') {
            errors.push(new Error(`Batch processing failed: ${settlementResult.reason}`));
            continue;
        }

        const { userId, notifications, result } = settlementResult.value;

        if (result.error) {
            failedUserIds.add(userId);
            errors.push(result.error);
            failed.push(...notifications);
        } else if (result.skipped) {
            skipped.push(...notifications);
        } else {
            sent.push(...notifications);
        }
    }

    return { errors };
}

export async function sendAll(
    force: boolean,
    digestDeltaTime = BULLETIN_DIGEST_DELTA_TIME
): Promise<I.NotificationSendBulkResponse> {
    const response: I.NotificationSendBulkResponse = { errors: [], totalSent: 0, totalFailed: 0, totalSkipped: 0 };

    const pendingNotifications = await notificationService.getBulletin(I.NotificationStatusEnum.PENDING);

    if (pendingNotifications.length === 0) {
        return response;
    }

    let userNotifications: BulletinNotifications = [];
    const sent: BulletinNotifications = [];
    const failed: BulletinNotifications = [];
    const skipped: BulletinNotifications = [];

    const failedUserIds = new Set<string>();
    const userBatch: Array<{ userId: string; notifications: BulletinNotifications }> = [];

    let userId: string = pendingNotifications[0].userId;

    for (const notification of pendingNotifications) {
        // If a notification has already been sent to this user and failed, skip all subsequent notifications for this user
        if (failedUserIds.has(userId)) {
            continue;
        }

        if (notification.userId !== userId) {
            userBatch.push({ userId, notifications: [...userNotifications] });

            if (userBatch.length >= BULLETIN_USERS_PER_BATCH) {
                const { errors } = await processBatch(
                    userBatch,
                    digestDeltaTime,
                    sent,
                    failed,
                    skipped,
                    failedUserIds,
                    force
                );
                response.errors = response.errors.concat(errors);
                userBatch.length = 0;
            }

            userId = notification.userId;
            userNotifications = [];
        }

        userNotifications.push(notification);
    }

    // Process the last user
    userBatch.push({ userId, notifications: [...userNotifications] });
    const { errors } = await processBatch(userBatch, digestDeltaTime, sent, failed, skipped, failedUserIds, force);
    response.errors = response.errors.concat(errors);

    // Remove sent notifications
    const sentResponse = await Promise.allSettled(sent.map((n) => notificationService.remove(n.id)));

    if (sentResponse.some((res) => res.status === 'rejected')) {
        console.error('Some notifications failed to be removed:', response, sentResponse);
        response.errors.push(new Error('Some notifications failed to be removed'));
    }

    // Update failed notifications to FAILED status
    const failedResponse = await Promise.allSettled(
        failed.map((n) => notificationService.update(n.id, { status: I.NotificationStatusEnum.FAILED }))
    );

    if (failedResponse.some((res) => res.status === 'rejected')) {
        console.error('Some notifications failed to be updated:', response, failedResponse);
        response.errors.push(new Error('Some notifications failed to be updated'));
    }

    response.totalSent = sent.length;
    response.totalFailed = failed.length;
    response.totalSkipped = skipped.length;

    return response;
}

type BulletinPublishedVersion = Pick<I.PublicationVersion, 'id' | 'title' | 'versionOf' | 'publishedDate'>;

export const createBulletin = async (
    actionType: I.NotificationActionTypeEnum,
    currentPublishedVersion: BulletinPublishedVersion,
    previousPublishedVersion: BulletinPublishedVersion | null,
    metadata?: {
        excludedUserIds?: string[];
        flagId?: string;
    }
): Promise<void> => {
    const type = I.NotificationTypeEnum.BULLETIN;

    let entries: { userId: string; entityId: string; payload: I.NotificationPayload }[] = [];

    switch (actionType) {
        case I.NotificationActionTypeEnum.PUBLICATION_BOOKMARK_VERSION_CREATED: {
            const usersToBeNotified = await userService.getBookmarkedUsers(currentPublishedVersion.versionOf);
            const entityId = currentPublishedVersion.versionOf;
            const payload = {
                title: currentPublishedVersion.title ?? '',
                url: Helpers.getPublicationUrl(currentPublishedVersion.versionOf)
            };

            entries = usersToBeNotified.map((user) => ({ userId: user.id, entityId, payload }));
            break;
        }

        case I.NotificationActionTypeEnum.PUBLICATION_BOOKMARK_RED_FLAG_RAISED: {
            const usersToBeNotified = await userService.getBookmarkedUsers(currentPublishedVersion.versionOf);
            const entityId = currentPublishedVersion.versionOf;
            const payload = {
                title: currentPublishedVersion.title ?? '',
                url: `${Helpers.getPublicationUrl(currentPublishedVersion.versionOf)}${
                    metadata?.flagId ? `/flag/${metadata.flagId}` : ''
                }`
            };

            entries = usersToBeNotified.map((user) => ({ userId: user.id, entityId, payload }));
            break;
        }

        case I.NotificationActionTypeEnum.PUBLICATION_BOOKMARK_RED_FLAG_RESOLVED: {
            const usersToBeNotified = await userService.getBookmarkedUsers(currentPublishedVersion.versionOf);
            const entityId = currentPublishedVersion.versionOf;
            const payload = {
                title: currentPublishedVersion.title ?? '',
                url: `${Helpers.getPublicationUrl(currentPublishedVersion.versionOf)}${
                    metadata?.flagId ? `/flag/${metadata.flagId}` : ''
                }`
            };

            entries = usersToBeNotified.map((user) => ({ userId: user.id, entityId, payload }));
            break;
        }

        case I.NotificationActionTypeEnum.PUBLICATION_BOOKMARK_RED_FLAG_COMMENTED: {
            const usersToBeNotified = await userService.getBookmarkedUsers(currentPublishedVersion.versionOf);
            const entityId = currentPublishedVersion.versionOf;
            const payload = {
                title: currentPublishedVersion.title ?? '',
                url: `${Helpers.getPublicationUrl(currentPublishedVersion.versionOf)}${
                    metadata?.flagId ? `/flag/${metadata.flagId}` : ''
                }`
            };

            entries = usersToBeNotified.map((user) => ({ userId: user.id, entityId, payload }));
            break;
        }

        case I.NotificationActionTypeEnum.PUBLICATION_VERSION_RED_FLAG_RAISED: {
            // We use the previous version because this is the one with the flag
            if (!previousPublishedVersion || !previousPublishedVersion.publishedDate) {
                break;
            }

            const usersToBeNotified = await userService.getUsersWithOutstandingFlagsInTimeInterval(
                currentPublishedVersion.versionOf,
                previousPublishedVersion.publishedDate,
                currentPublishedVersion.publishedDate || new Date()
            );

            const entityId = currentPublishedVersion.versionOf;

            const payload = {
                title: currentPublishedVersion.title ?? '',
                url: Helpers.getPublicationUrl(currentPublishedVersion.versionOf)
            };

            entries = usersToBeNotified.map((user) => ({ userId: user.id, entityId, payload }));
            break;
        }

        case I.NotificationActionTypeEnum.PUBLICATION_VERSION_PEER_REVIEWED: {
            // We use the previous version because this is the one with the link
            if (!previousPublishedVersion) {
                break;
            }

            const usersToBeNotified = await userService.getUsersWithDirectLinkToVersion(
                previousPublishedVersion.versionOf,
                'PEER_REVIEW',
                'include'
            );

            const entityId = currentPublishedVersion.versionOf;

            const payload = {
                title: previousPublishedVersion.title ?? '',
                url: Helpers.getPublicationUrl(currentPublishedVersion.versionOf)
            };

            entries = usersToBeNotified.map((user) => ({ userId: user.id, entityId, payload }));
            break;
        }

        case I.NotificationActionTypeEnum.PUBLICATION_VERSION_LINKED_PREDECESSOR: {
            const usersToBeNotified = await userService.getUsersWithDirectLinkFromVersion(currentPublishedVersion.id);

            entries = usersToBeNotified.map((user) => ({
                userId: user.id,
                entityId: currentPublishedVersion.versionOf,
                payload: {
                    title: (previousPublishedVersion?.title || currentPublishedVersion.title) ?? '',
                    url: Helpers.getPublicationUrl(currentPublishedVersion.versionOf),
                    first: !previousPublishedVersion
                }
            }));
            break;
        }

        case I.NotificationActionTypeEnum.PUBLICATION_VERSION_LINKED_SUCCESSOR: {
            // We use the previous version because this is the one with the link
            if (!previousPublishedVersion) {
                break;
            }

            // Exclude peer review as that case is handled above in PUBLICATION_VERSION_PEER_REVIEWED
            const usersToBeNotified = await userService.getUsersWithDirectLinkToVersion(
                previousPublishedVersion.versionOf,
                'PEER_REVIEW',
                'exclude'
            );

            entries = usersToBeNotified.map((user) => ({
                userId: user.id,
                entityId: currentPublishedVersion.versionOf,
                payload: {
                    title: previousPublishedVersion.title ?? '',
                    url: Helpers.getPublicationUrl(currentPublishedVersion.versionOf)
                }
            }));
            break;
        }
    }

    const excludedUserIds = metadata?.excludedUserIds || [];

    if (excludedUserIds) {
        entries = entries.filter(({ userId }) => !excludedUserIds.includes(userId));
    }

    await notificationService.createMany(
        entries.map(({ userId, entityId, payload }) => ({ type, actionType, userId, entityId, payload }))
    );
};
