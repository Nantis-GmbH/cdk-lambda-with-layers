import {Architecture, Code, LayerVersion, Runtime} from "aws-cdk-lib/aws-lambda";
import {join} from "path";
import {Construct} from "constructs";
import { readFileSync, existsSync } from 'node:fs'

import {RemovalPolicy, SymlinkFollowMode} from "aws-cdk-lib";

export type LambdaDependency = string

export interface LambdaLayerProps {
    // Path to the folder of the package.json file
    path: string,
    // You might need to exclude files in the output (e.g. large binaries not necessary, Prisma I am looking at you)
    exclude?: string[]
}

export class LambdaLayer extends LayerVersion {

    public readonly dependencies: LambdaDependency[] = [];

    constructor(scope: Construct, id: string, props: LambdaLayerProps) {
        super(scope, id, {
            code: Code.fromAsset(props.path, {
                followSymlinks: SymlinkFollowMode.ALWAYS,
                bundling: {
                    image: Runtime.NODEJS_18_X.bundlingImage,
                    command: [
                        'bash', '-xc', [
                            'export npm_config_update_notifier=false',  // Disable npm upgrade check
                            'export npm_config_cache=$(mktemp -d)',  // Change npm default cache folder
                            'cd $(mktemp -d)',
                            'cp -v /asset-input/package*.json .',
                            'npm i --only=prod',
                            'mkdir -p /asset-output/nodejs/',
                            'cp -au node_modules /asset-output/nodejs/',
                        ].join('&&'),
                    ],
                },
                exclude: props.exclude
            }),
            compatibleArchitectures: [Architecture.ARM_64],
            compatibleRuntimes: [Runtime.NODEJS_18_X],
            removalPolicy: RemovalPolicy.DESTROY,
        });


        const packageFilePath = join(props.path, "package.json");

        if (existsSync(packageFilePath)) {
            const data = readFileSync(packageFilePath);
            const pack = JSON.parse(data.toString("utf-8"));
            this.dependencies = pack.dependencies ? Object.keys(pack.dependencies) : [];
        }
    }
}

export const combineLayerDependencies = (layers: LambdaLayer[]): LambdaDependency[] => {
    return layers.reduce<LambdaDependency[]>((dependencies, layer) => {
        return [...dependencies, ...layer.dependencies];
    }, []);
};
