
export interface Options {
  generateIds?: IdTypeOptions;
  //backup?: {
  //  files?: boolean;
  //  interval?: number;
  //  filePerCollection?: boolean;
  //};
}

export interface Schema {
  name: string;
  properties: any;
}

export interface Document {
  //id: string | number;
  content?: any;
  version?: number;
}
