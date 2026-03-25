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

export async function getParameter(ssmParameterName: string): Promise<string> {
    const key = `${ssmParameterName}_${stage}_octopus`;

    const input = { Name: key, WithDecryption: true };
    const command = new GetParameterCommand(input);
    const result = await client.send(command);
    const value = result.Parameter?.Value || '';

    return value;
}
