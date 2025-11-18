import 'dotenv/config';
import * as client from '../src/lib/client';
import * as eventService from '../src/components/event/service';
import * as Helpers from 'lib/helpers';
import * as s3 from 'lib/s3';
import * as doi from 'lib/doi';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

const hideDOI = async (doiId: string): Promise<void> => {
    await doi.updateDOI(doiId, { data: { type: 'dois', attributes: { event: 'hide' } } });
};

const deletePublication = async (
    publicationId: string,
    dryRun: boolean
): Promise<void> => {
    const id = publicationId;
    const publication = await client.prisma.publication.findUnique({ where: { id } });

    if (!publication) {
        throw new Error(`Publication with ID ${id} not found.`);
    }

    const publicationVersions = await client.prisma.publicationVersion.findMany({ where: { publication: { id } } });
    console.log(`Found ${publicationVersions.length} publication versions for publication ID: ${id}`);

    // 1. delete all pending request control events for each publication version
    for (const publicationVersion of publicationVersions) {
        if (dryRun) {
            console.log(`[Dry Run] Deleting pending REQUEST_CONTROL events for publication version ID: ${publicationVersion.id}`);
        } else {
            await eventService.deleteMany({ type: 'REQUEST_CONTROL', data: { path: ['publicationVersion', 'id'], equals: publicationVersion.id } });
            console.log(`Deleted pending REQUEST_CONTROL events for publication version ID: ${publicationVersion.id}`);
        }
    }

    // 2. delete s3 files associated with the publication
    for (const publicationVersion of publicationVersions) {
        if (dryRun) {
            console.log(`[Dry Run] Deleting S3 file for publication version ID: ${publicationVersion.id}`);
        } else {
            await s3.client.send(new DeleteObjectCommand({ Bucket: s3.buckets.pdfs, Key: `${publicationVersion.versionOf}.pdf` }));
            console.log(`Deleted S3 file for publication version ID: ${publicationVersion.id}`);
        }
    }

    // 3. delete indexes from Elasticsearch
    if (dryRun) {
        console.log(`[Dry Run] Deleting Elasticsearch index for publication version ID: ${id}`);
    } else {
        try {
            await client.search.delete({ index: 'publications', id: id });
            console.log(`Deleted Elasticsearch index for publication version ID: ${id}`);
        } catch (error) {
            console.log(`Elasticsearch index for publication version ID: ${id} not found or already deleted.`);
        }
    }

    // 4. update DOIS for publication and publicationVersions from "findable" to "registered"
    if (dryRun) {
        console.log(`[Dry Run] Hiding DOI for publication: ${publication.doi}`);

        for (const publicationVersion of publicationVersions) {
            if (!publicationVersion.doi) {
                continue;
            }

            console.log(`[Dry Run] Hiding DOI for publication version: ${publicationVersion.doi}`);
        }
    } else {
        await hideDOI(publication.doi);

        for (const publicationVersion of publicationVersions) {
            if (!publicationVersion.doi) {
                continue;
            }

            await hideDOI(publicationVersion.doi);
        }
    }

    // 5. finally, delete the publication record from the database
    if (dryRun) {
        console.log(`[Dry Run] Deleting publication with ID: ${id}`);
    } else {
        await client.prisma.publication.delete({ where: { id } });
        console.log(`Deleted publication with ID: ${id}`);
    }
};

const parseArguments = (): { dryRun: boolean, publicationId: string } => {
    const args = Helpers.parseNpmScriptArgs();

    const usage = 'Usage: npm run deletePublication -- dryRun=false publicationId=12345';

    const dryRunArg = args.dryRun;

    const publicationIdArg = args.publicationId;

    if (!publicationIdArg) {
        throw new Error('publicationId is required.\n' + usage);
    }

    return {
        dryRun: dryRunArg === 'false' ? false : true,
        publicationId: publicationIdArg
    };
};

const runScript = async (): Promise<void> => {
    const { publicationId, dryRun } = parseArguments();

    if (process.env.STAGE !== 'prod' && process.env.STAGE !== 'int' && process.env.STAGE !== 'local') {
        throw new Error('This script can only be run in the local, int, or prod environments. Set the STAGE environment variable accordingly.');
    }

    await deletePublication(publicationId, dryRun);

    console.log(
        dryRun
            ? 'Dry run complete.'
            : 'Real run complete.' +
            ` Deleted publication ${publicationId}`
    );
};

void runScript();