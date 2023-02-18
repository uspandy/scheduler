import * as fs from 'fs';

export function readFileWithError(path: string, name: string): Buffer {
    if (!fs.existsSync(path)) {
        throw new Error(`Can't read '${path}' file (${name}). Check the file exists`);
    }

    return fs.readFileSync(path);
}
