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
 *  - reportFormat: Controls how the output of the job is reported. Can be "email" or "file". Emails
 *    are sent to the addresses listed in the INGEST_REPORT_RECIPIENTS environment variable. Files are
 *    written to "ari-import-report.txt".
 *    - Default: "file"
 *
 * e.g.:
 * npm run ukdsImport -- dryRun=true reportFormat=email
 */
const parseArguments = (): {
    dryRun: boolean;
    reportFormat: I.IngestReportFormat;
} => {
    const args = Helpers.parseNpmScriptArgs();

    for (const arg of Object.keys(args)) {
        if (!['dryRun', 'full', 'reportFormat'].includes(arg)) {
            throw new Error(`Unexpected argument: ${arg}`);
        }
    }

    const { dryRun: dryRunArg, full: fullArg, reportFormat: reportFormatArg } = args;

    for (const arg of [dryRunArg, fullArg]) {
        Helpers.checkBooleanArgValue(arg);
    }

    if (reportFormatArg && !(reportFormatArg === 'email' || reportFormatArg === 'file')) {
        throw new Error(`"reportFormat" must be "email" or "file"`);
    }

    return {
        dryRun: dryRunArg === 'true',
        reportFormat: reportFormatArg ? (reportFormatArg as I.IngestReportFormat) : 'file'
    };
};

const { dryRun, reportFormat } = parseArguments();

integrationService.incrementalUKDSIngest(dryRun, reportFormat)
    .then((message) => console.log(message))
    .catch((err) => console.log(err));
