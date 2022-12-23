import { Architecture, ILayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";

import {
  BundlingOptions,
  NodejsFunction,
  NodejsFunctionProps,
  OutputFormat,
} from "aws-cdk-lib/aws-lambda-nodejs";

import { Construct } from "constructs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Duration } from "aws-cdk-lib";
import {combineLayerDependencies, LambdaLayer} from "./lambda-layer";

type FunctionPropsWithoutCode = Omit<NodejsFunctionProps, "runtime">;

export type LambdaTypeScriptFunctionProps = {
  runtime?: Runtime;
} & FunctionPropsWithoutCode;

export class LambdaFunctionTypescript extends NodejsFunction {
  constructor(
    scope: Construct,
    id: string,
    props: LambdaTypeScriptFunctionProps,
    outputFormat: OutputFormat = OutputFormat.ESM
  ) {
    const runtime = props.runtime ? props.runtime : Runtime.NODEJS_14_X;

    const isLambdaLayer = (
      layer: ILayerVersion | undefined
    ): layer is LambdaLayer => {
      return !!layer;
    };

    const layers = [...new Set(props.layers)];

    const packageLayers: LambdaLayer[] = layers.filter(isLambdaLayer) ?? [];

    const externalModulesFromPackages = combineLayerDependencies(packageLayers);

    const bundling: BundlingOptions = {
      target: "esnext",
      format: outputFormat,
      ...props.bundling,
      // The aws-sdk v3 is bundled from version 18+
      externalModules: [
          ...(props.runtime === Runtime.NODEJS_18_X ? ["@aws-sdk"] : ["aws-sdk"]),
        ...externalModulesFromPackages,
      ],
    };

    const lambdaProps: NodejsFunctionProps = {
      ...props,
      runtime,
      architecture: Architecture.ARM_64,
      layers: layers,
      logRetention: RetentionDays.ONE_WEEK,
      initialPolicy: [
        ...(props.initialPolicy ?? [])
      ],
      memorySize: props.memorySize ?? 256,
      timeout: props.timeout ?? Duration.seconds(6),
      bundling,
    };

    super(scope, id, lambdaProps);
  }
}
