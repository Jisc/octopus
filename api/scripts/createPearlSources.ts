import 'dotenv/config';
import * as pearlService from '../src/components/pearl/service';
import * as I from 'interface';
import * as fs from 'fs';
import * as Helpers from 'lib/helpers';

type InputData = I.CreatePearlSourceRequestBody[];

const createPearlSources = async (data: InputData, dryRun: boolean): Promise<string[]> => {
    const response: string[] = [];

    for (const item of data) {
        if (dryRun) {
            console.log(`Dry run: would create pearl source from data:`, JSON.stringify(item, null, 2));
            response.push(item.identifier);
            continue;
        }

        try {
            const pearlSource = await pearlService.createSource(item);
            console.log(`Created pearl source with ID ${pearlSource.id} for identifier ${item.identifier}`);
            response.push(pearlSource.id);
        } catch (error) {
            console.error(`Error creating pearl source for identifier ${item.identifier}:`, error);
            response.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    return response;
};

const readDataFromFile = (inputFileName: string): { data: InputData | null; error?: string } => {
    if (!fs.existsSync(inputFileName)) {
        return {
            data: null,
            error: `Input file "${inputFileName}" not found.`
        };
    }

    const fileData = JSON.parse(fs.readFileSync(inputFileName, 'utf8'));

    return {
        data: fileData
    };
};

const parseArguments = (): { dryRun: boolean } => {
    const args = Helpers.parseNpmScriptArgs();

    const dryRunArg = args.dryRun;

    if (dryRunArg && !(dryRunArg === 'true' || dryRunArg === 'false')) {
        throw new Error('dryRun must be one of "true" or "false"');
    }

    return {
        dryRun: dryRunArg === 'false' ? false : true
    };
};

const validateData = (data: InputData): { valid: boolean; messages: string[] } => {
    let valid = true;
    const messages: string[] = [];

    if (!data || !data.length) {
        return { valid: false, messages: ['Input data is invalid or missing required fields.'] };
    }

    function requiredString(value: any): boolean {
        return typeof value === 'string' && value.trim().length > 0;
    }

    function optionalString(value: any): boolean {
        return value === undefined || (typeof value === 'string' && value.trim().length > 0);
    }

    for (const [index, item] of data.entries()) {
       if (!requiredString(item.name)) {
            valid = false;
            messages.push(`Item at index ${index} is missing a valid "name" field.`);
        }

        if (!requiredString(item.language)) {
            valid = false;
            messages.push(`Item at index ${index} is missing a valid "language" field.`);
        }

        if (!optionalString(item.licenceType)) {
            valid = false;
            messages.push(`Item at index ${index} has an invalid "licenceType" field.`);
        }

        if (!optionalString(item.defaultTopicId)) {
            valid = false;
            messages.push(`Item at index ${index} has an invalid "defaultTopicId" field.`);
        }

        if (!requiredString(item.identifier)) {
            valid = false;
            messages.push(`Item at index ${index} is missing a valid "identifier" field.`);
        }

        if (!requiredString(item.identifierType)) {
            valid = false;
            messages.push(`Item at index ${index} is missing a valid "identifierType" field.`);
        }
    }

    return { valid, messages };
};

const inputFileName = 'scripts/pearlSources.json';

const runScript = async (): Promise<void> => {
    const fileContents = readDataFromFile(inputFileName);

    if (fileContents.error) {
        console.log('Read file error: ', fileContents.error);

        return;
    }

    if (!fileContents.data) {
        console.log('No data found in the input file.');

        return;
    }

    const { dryRun } = parseArguments();

    const result = validateData(fileContents.data);

    if (result.valid) {
        const createdMappings = await createPearlSources(fileContents.data, dryRun);
        console.log(
            dryRun ? 'Dry run complete.' : 'Real run complete.' + ` Created funder rors: ${createdMappings.join(', ')}`
        );
        console.log(createdMappings);
    } else {
        console.log('Failed validation.', result);
    }
};

void runScript();
