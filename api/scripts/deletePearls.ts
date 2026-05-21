// @ts-nocheck -- This script will be deleted once we remove all pearls from the system

import 'dotenv/config';
import * as client from '../src/lib/client';
import * as Helpers from 'lib/helpers';

const deletePearls = async (dryRun: boolean): Promise<void> => {
    const [pearlCount, subPearlCount, topicCount] = await Promise.all([
        client.prisma.pearl.count(),
        client.prisma.subPearl.count(),
        client.prisma.topic.count()
    ]);

    console.log(`Current counts -> pearls: ${pearlCount}, sub-pearls: ${subPearlCount}, topics: ${topicCount}`);

    if (dryRun) {
        console.log('[Dry Run] Would delete all pearls and sub-pearls.');
        console.log('[Dry Run] Topics would be kept and left disconnected from deleted pearls.');

        return;
    }

    const [deletedSubPearls, deletedPearls] = await client.prisma.$transaction([
        client.prisma.subPearl.deleteMany(),
        client.prisma.pearl.deleteMany()
    ]);

    const topicCountAfter = await client.prisma.topic.count();

    console.log(`Deleted sub-pearls: ${deletedSubPearls.count}`);
    console.log(`Deleted pearls: ${deletedPearls.count}`);
    console.log(`Topics kept: ${topicCountAfter}`);
};

const parseArguments = (): { dryRun: boolean } => {
    const args = Helpers.parseNpmScriptArgs();

    for (const arg of Object.keys(args)) {
        if (!['dryRun'].includes(arg)) {
            throw new Error(`Unexpected argument: ${arg}`);
        }
    }

    const dryRunArg = args.dryRun;
    Helpers.checkBooleanArgValue(dryRunArg);

    return {
        // Safe default is dry-run unless explicitly disabled.
        dryRun: dryRunArg === 'false' ? false : true
    };
};

const runScript = async (): Promise<void> => {
    const { dryRun } = parseArguments();

    if (process.env.STAGE !== 'prod' && process.env.STAGE !== 'int' && process.env.STAGE !== 'local') {
        throw new Error(
            'This script can only be run in the local, int, or prod environments. Set the STAGE environment variable accordingly.'
        );
    }

    await deletePearls(dryRun);

    console.log(dryRun ? 'Dry run complete.' : 'Real run complete. All pearls and sub-pearls deleted.');
};

void runScript();