import {Construct} from 'constructs';
import {LambdaLayer} from "./constructs/lambda-layer";
import {FunctionUrlAuthType, HttpMethod, Runtime} from "aws-cdk-lib/aws-lambda";
import {getFilePath} from "./constructs/util/get-file-path";
import {Duration, Stack, StackProps} from "aws-cdk-lib";
import {LambdaFunctionTypescript} from "./constructs/lambda-function-typescript";
import {StringParameter} from "aws-cdk-lib/aws-ssm";

export class CdktestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // We create an SSM param to be retrieved by our function
    const param = new StringParameter(this, 'Param', {
      parameterName: '/test/helloworld',
      stringValue: 'Hello World!',
      description: 'An SSM parameter which will be returned from a lambda handler with top level await',
    });

    // We do want a lambda layer that packages frequently used packages into a layer
    const baseLayer = new LambdaLayer(this, "BaseLayer", {
      path: getFilePath(import.meta.url, "constructs", "layers", "base")
    })

    const lambdaFunction = new LambdaFunctionTypescript(this, "Handler", {
      entry: getFilePath(
          import.meta.url,
          "constructs",
          "lambda-handler-function.ts"
      ),
      runtime: Runtime.NODEJS_18_X,
      memorySize: 256,
      timeout: Duration.seconds(5),
      // Dependencies present in the layers will be declared as external when bundling (thus not bundled)
      layers: [
        baseLayer
      ]
    })

    param.grantRead(lambdaFunction)

    this.exportValue(lambdaFunction.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
      cors: {
        allowedMethods: [HttpMethod.ALL],
        allowedOrigins: ["*"],
      },
    }).url)
  }
}
