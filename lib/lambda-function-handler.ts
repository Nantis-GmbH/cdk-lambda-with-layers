import { GetParametersByPathCommand, SSMClient } from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient({});

const config = await ssmClient.send(
    new GetParametersByPathCommand({
        Path: '/param',
    })
);

export const handler = async (event: any = {}): Promise<any> => {

    return {
        statusCode: 200,
        body: JSON.stringify({
            config
        }),
    };
}