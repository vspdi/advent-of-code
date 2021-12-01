import { readFile } from 'fs-extra';
import path from 'path';

export const toAbsolutePath = ( filePath: string ) => {
    if ( path.isAbsolute( filePath ) ) {
        return filePath;
    }
    return path.resolve( filePath );
}

export const getData = async ( filePath: string ): Promise<string> => {
    return await readFile( toAbsolutePath( filePath ), { encoding: 'utf-8' } );
}

export const getDataAsLines = async ( filePath: string ): Promise<string[]> => {
    const data = await getData( filePath );

    return data.split( '\n' );
}