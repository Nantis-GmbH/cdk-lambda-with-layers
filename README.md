# CDK TypeScript Projects showing Layers and Lambda Functions with ESM

# Layers with their own package.json

1. Layers define their own dependencies in a `package.json` file in a separate directory, additional files can be put there as well (when changing the copy command a bit)
2. The layers will then be bundled by using Docker and a bundling command which will install the production dependencies given in the layer's `package.json`. The installed dependencies will then be put into a `nodejs/node_modules` directory to be able to be picked up by the NodeJS runtime later (`NODE_PATH`).
3. The layer will provide the installed dependencies as an array (no version included tough) which the lambda can use to declare modules as external which will then not be bundled (also not aws-sdk / @aws-sdk in V18). Dependencies not in the layer are normally bundled in. They can be normally be put into the dependencies of the root `package.json`.

# Changes to the default CDK setup

1. replace `ts-node` with `tsx` in the `cdk.json` file (issue with the file extension)
2. Added `esbuild`
3. Changed the `tsconfig.json` the `ESNext`

# Problems

You won't have proper autocomplete / typechecking in you function handler code unless you install them in your root / project. You can install them there as dev dependencies, but you need to sure to match versions in that case.
Docker bundling might not be ideal in terms of performance. It is also possible to run `npm install` locally and use the output directly, but you will always have to fear that additional things are bundled (dev-dependencies) and also that OS dependent libraries are not bundled correctly.

# Deployment
Just follow the normal `npm install` && `npm run synth` && `npm run deploy` flow

# Destroy
`npm run synth`

