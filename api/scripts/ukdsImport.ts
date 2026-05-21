import * as dotenv from 'dotenv';

// Important to do this so that environment variables are treated the same as in deployed code.
dotenv.config();

import * as Helpers from 'lib/helpers';
import * as I from 'interface';
import * as integrationService from 'integration/service';

/**
 * Can take the following arguments:
 *  - dryRun: If "true", the script will not actually create or update any publications,
 *    and instead report on what it would have done.
 *    - Default: false
 *  - forceUpdate: If "true", the script will update all publications that are in the UKDS feed, even if they have not changed since the last ingest.
 *  - limit: If provided, only this many studies will be handled.
 *  - reportFormat: Controls how the output of the job is reported. Can be "email" or "file". Emails
 *    are sent to the addresses listed in the INGEST_REPORT_RECIPIENTS environment variable. Files are
 *    written to "ari-import-report.txt".
 *    - Default: "file"
 *
 * e.g.:
 * npm run ukdsImport -- dryRun=true limit=1 reportFormat=email
 */
const parseArguments = (): {
    dryRun: boolean;
    forceUpdate: boolean;
    limit?: number;
    reportFormat: I.IngestReportFormat;
} => {
    const args = Helpers.parseNpmScriptArgs();

    for (const arg of Object.keys(args)) {
        if (!['dryRun', 'forceUpdate', 'limit', 'reportFormat'].includes(arg)) {
            throw new Error(`Unexpected argument: ${arg}`);
        }
    }

    const { dryRun: dryRunArg, forceUpdate: forceUpdateArg, limit: limitArg, reportFormat: reportFormatArg } = args;

    for (const arg of [dryRunArg, forceUpdateArg]) {
        Helpers.checkBooleanArgValue(arg);
    }

    if (reportFormatArg && !(reportFormatArg === 'email' || reportFormatArg === 'file')) {
        throw new Error(`"reportFormat" must be "email" or "file"`);
    }

    if (limitArg && (!Number.isInteger(Number(limitArg)) || Number(limitArg) < 1)) {
        throw new Error('"limit" must be a positive integer');
    }

    return {
        dryRun: dryRunArg === 'true',
        forceUpdate: forceUpdateArg === 'true',
        limit: limitArg ? Number(limitArg) : undefined,
        reportFormat: reportFormatArg ? (reportFormatArg as I.IngestReportFormat) : 'file'
    };
};

const { dryRun, forceUpdate, limit, reportFormat } = parseArguments();

integrationService.incrementalUKDSIngest(dryRun, forceUpdate, reportFormat, limit)
    .then((message) => console.log(message))
    .catch((err) => console.log(err));
