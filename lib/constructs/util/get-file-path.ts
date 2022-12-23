import {fileURLToPath} from "url";
import {dirname, join} from "path";

/**
 * This function returns a file path for a given file from an import file perspective
 * Used for creating a path to a typescript file for aws-lambda bundling
 * Only esm use, do not use for now
 * https://github.com/nodejs/help/issues/2907
 * @param url import.meta.url
 * @param paths file paths
 */
export const getFilePath = (url: string, ...paths: string[]) => {
    const ___filename = fileURLToPath(url);
    const ___dirname = dirname(___filename);
    return join(___dirname, ...paths);
};
