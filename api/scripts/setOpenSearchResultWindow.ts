import * as dotenv from 'dotenv';

// Important to do this so that environment variables are treated the same as in deployed code.
dotenv.config();

import * as client from 'lib/client';
import * as Helpers from 'lib/helpers';

const parseArguments = (): { index: string; maxResultWindow: number } => {
    const args = Helpers.parseNpmScriptArgs();

    for (const arg of Object.keys(args)) {
        if (!['index', 'maxResultWindow'].includes(arg)) {
            throw new Error(`Unexpected argument: ${arg}`);
        }
    }

    const indexArg = args.index;
    const maxResultWindowArg = args.maxResultWindow;

    if (!maxResultWindowArg) {
        throw new Error('"maxResultWindow" is required, e.g. maxResultWindow=50000');
    }

    const maxResultWindow = Number(maxResultWindowArg);

    if (!Number.isInteger(maxResultWindow) || maxResultWindow < 1) {
        throw new Error('"maxResultWindow" must be a positive integer');
    }

    return {
        index: indexArg || 'publications',
        maxResultWindow
    };
};

const setOpenSearchResultWindow = async (): Promise<string> => {
    const { index, maxResultWindow } = parseArguments();

    const doesIndexExist = await client.search.indices.exists({
        index
    });

    if (!doesIndexExist.body) {
        return `Index "${index}" does not exist.`;
    }

    await client.search.indices.putSettings({
        index,
        body: {
            index: {
                max_result_window: maxResultWindow
            }
        }
    });

    return `Updated index.max_result_window for "${index}" to ${maxResultWindow}.`;
};

setOpenSearchResultWindow()
    .then((message) => console.log(message))
    .catch((err) => console.log(err));
