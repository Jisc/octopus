import 'dotenv/config';
import * as client from '../src/lib/client';
import * as Helpers from 'lib/helpers';
import * as crypto from 'crypto';

const deleteUser = async (
    userId: string,
    dryRun: boolean
): Promise<void> => {
    const id = userId;
    const user = await client.prisma.user.findUnique({ where: { id } });

    if (!user) {
        throw new Error(`User with ID ${id} not found.`);
    }

    const userFullName = `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`;
    console.log(`Found user: ${userFullName} (${user.email})`);

    const anonymizedData = {
        orcid: null,
        orcidAccessToken: null,
        email: null,
        locked: true,
        deleted: true,
        apiKey: crypto.randomUUID(),
        ror: null,
        url: null,
        employment: [],
        works: [],
        education: [],
        defaultTopicId: null,
    };

    if (dryRun) {
        console.log(`[Dry Run] Anonymizing user with ID: ${id}`);
        console.log(`[Dry Run] Would set: ${JSON.stringify(anonymizedData, null, 2)}`);
    } else {
        await client.prisma.user.update({
            where: { id },
            data: anonymizedData
        });
        console.log(`Anonymized user with ID: ${id}`);
    }
};

const parseArguments = (): { dryRun: boolean, userId: string} => {
    const args = Helpers.parseNpmScriptArgs();

    const usage = 'Usage: npm run deleteUser -- dryRun=false userId=12345';

    const dryRunArg = args.dryRun;

    const userIdArg = args.userId;

    if (!userIdArg) {
        throw new Error('userId is required.\n' + usage);
    }

    return {
        dryRun: dryRunArg === 'false' ? false : true,
        userId: userIdArg
    };
};

const runScript = async (): Promise<void> => {
    const { userId, dryRun } = parseArguments();

    if (process.env.STAGE !== 'prod' && process.env.STAGE !== 'int' && process.env.STAGE !== 'local') {
        throw new Error('This script can only be run in the local, int, or prod environments. Set the STAGE environment variable accordingly.');
    }

    await deleteUser(userId, dryRun);

    console.log(
        dryRun
            ? 'Dry run complete.'
            : 'Real run complete. Anonymized user ' + userId
    );
};

void runScript();