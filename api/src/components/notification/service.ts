import * as client from 'lib/client';
import * as I from 'interface';

export const create = (
    userId: string,
    entityId: string,
    type: I.NotificationTypeEnum,
    actionType: I.NotificationActionTypeEnum,
    payload?: I.NotificationPayload
) =>
    client.prisma.notification.create({
        data: { userId, entityId, type, actionType, payload },
        select: { status: true, createdAt: true }
    });

export const createMany = (
    notifications: {
        userId: string;
        entityId: string;
        type: I.NotificationTypeEnum;
        actionType: I.NotificationActionTypeEnum;
        payload?: I.NotificationPayload;
    }[]
) =>
    client.prisma.notification.createMany({
        data: notifications,
        skipDuplicates: true
    });

export const getAll = () =>
    client.prisma.notification.findMany({
        orderBy: { userId: 'asc' },
        select: {
            id: true,
            userId: true,
            type: true,
            actionType: true,
            payload: true,
            status: true,
            createdAt: true,
            updatedAt: true
        }
    });

export const getBulletin = (status?: I.NotificationStatusEnum) =>
    client.prisma.notification.findMany({
        where: { type: I.NotificationTypeEnum.BULLETIN, status },
        orderBy: { userId: 'asc' },
        select: { id: true, userId: true, entityId: true, actionType: true, payload: true, createdAt: true }
    });

export const update = (id: string, data: Pick<I.Notification, 'status'>) =>
    client.prisma.notification.update({ where: { id }, data });

export const remove = (id: string) => client.prisma.notification.delete({ where: { id } });

export const removeMany = (ids: string[]) =>
    client.prisma.notification.deleteMany({
        where: { id: { in: ids } }
    });

export const clearFailedNotifications = () =>
    client.prisma.notification.deleteMany({
        where: { status: I.NotificationStatusEnum.FAILED }
    });
