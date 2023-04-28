import { Options, Schema, CollectionType } from "./types";
export declare class SiamDatabase {
    private readonly events;
    private readonly options;
    private readonly schema;
    private readonly collections;
    constructor({ options, schema, }: {
        options?: Options;
        schema?: Schema;
    });
    collection(collection: string): CollectionType;
}
export declare const createDatabase: (options?: Options, schema?: Schema) => SiamDatabase;
