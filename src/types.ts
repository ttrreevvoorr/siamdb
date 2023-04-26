
//type IdTypeOptions = "autoinc" | "uuid";
export enum IdTypeOptions {
  AUTOINC = "autoinc",
  UUID = "uuid"
};

export interface Options {
    generateIds?: IdTypeOptions.AUTOINC | IdTypeOptions.UUID | undefined;
}

export interface Schema {
    [key:string]: any
}

export interface Document {
  content?: any;
  version?: number;
}

export interface ResponseDoc extends Document {
  id: string;
}

export interface CollectionType {
  find(where: { id?: string, [key:string]: any }): ResponseDoc[];
  update(where: { id?: string, [key:string]: any }, content:any): ResponseDoc[] | Error;
  create(content:any): string;
  delete(where: { id?: string, [key:string]: any }): string[] | Error;
}
