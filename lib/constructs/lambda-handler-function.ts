// @aws-cdk will be provided by the runtime
import { GetParametersByPathCommand, SSMClient } from "@aws-sdk/client-ssm";
// zod is present in the base library and will be resolved from the layer
import { z } from "zod";
// Any other import here will be bundled

const ssmClient = new SSMClient({});

// Top level await
const config = await ssmClient.send(
    new GetParametersByPathCommand({
        Path: '/test',
    })
);

// Normal handler code
export const handler = async (): Promise<any> => {

   const validationSchema = z.string().startsWith("Hello World");

    const value = config.Parameters?.length ? config.Parameters[0].Value : 'No value'
    const valid = validationSchema.safeParse(value).success;

    return {
        statusCode: 200,
        body: {
            value,
            "valid": valid
        },
    };
}