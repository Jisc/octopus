import { GetParameterCommand, SSMClient, SSMClientConfig } from '@aws-sdk/client-ssm';
import * as Helpers from 'lib/helpers';

const stage = process.env.STAGE;

const config: SSMClientConfig = {
    region: 'eu-west-1',
    ...(stage === 'local'
        ? {
              credentials: {
                  accessKeyId: 'dummy',
                  secretAccessKey: 'dummy'
              },
              endpoint: Helpers.checkEnvVariable('LOCALSTACK_SERVER')
          }
        : {})
};

const client = new SSMClient(config);

type CacheEntry = { value: string; timestamp: number };
const memoryCache = new Map<string, CacheEntry>();
const memoryCacheTTL = 0.5 * 60 * 1000;

export async function getParameter(ssmParameterName: string, useCache = false): Promise<string> {
    const now = Date.now();
    const key = `${ssmParameterName}_${stage}_octopus`;

    if (useCache && memoryCache.has(key)) {
        const cached = memoryCache.get(key) as CacheEntry;

        if (now - cached.timestamp < memoryCacheTTL) {
            return cached.value;
        }
    }

    const input = { Name: key, WithDecryption: true };
    const command = new GetParameterCommand(input);
    const result = await client.send(command);
    const value = result.Parameter?.Value || '';

    if (useCache) {
        memoryCache.set(key, { value, timestamp: now });
    }

    return value;
}
