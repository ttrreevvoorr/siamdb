const { randomUUID } = require("crypto");
import { EventEmitter } from "events";
import { Options, Schema, Document } from "./types";

type IdTypeOptions = "autoinc" | "uuid";

const defaultOptions = {
  generateIds: "uuid",
};

export class SiamDatabase {
  private events: EventEmitter = new EventEmitter();
  private options: Options;
  private schema: Schema[];
  //public database: any = {};
  [key: string]: any; // add this index signature

  constructor({
    options = {},
    schema = [],
  }: {
    options?: Options;
    schema?: Schema[];
  }) {
    this.options = {
      generateIds: options.generateIds || defaultOptions.generateIds,
    };
    this.schema = schema;

    this.configureSchema(this.schema);
  }

  configureSchema(schema: Schema[]) {
    if (!schema.length) {
      throw new Error("SiamDB schema has not been defined");
    }

    schema.map((collection) => {
      this[collection.name] = new Collection({
        collection,
        options: this.options,
      });

      //this.database[collection.name] = new Collection({
      //  collection,
      //  options: this.options,
      //});
    });
  }
}

// import { siam } from siamdb
// const db = siam.createDatabase(options, schema)

class Collection {
  //private documents: Document = {};
  private schema: Schema;
  private options: Options;
  private documents: any;

  constructor({
    collection,
    options,
  }: {
    collection: Schema;
    options: Options;
  }) {
    this.schema = collection;
    this.options = options;
    this.documents = {};
  }

  // Get collection item by ID
  get(where: {
    id?: string;
    [key: string]: any;
  }): Document | Document[] | Error {
    if (where.id) {
      if(!this.documents[where.id]){
        throw new Error("Could not find any documents matching this query")
      }
      return this.documents[where.id];
    } else {
      const response = [] as Document[];
      for (const key in this.documents as Document) {
        for (const query in where) {
          if (
            this.documents[key].content[query] &&
            this.documents[key].content[query] === where[query]
          ) {
            response.push(this.documents[key]);
          }
        }
      }
      if(!response.length){
        throw new Error("Could not find any documents matching this query")
      }
      return response as Document[];
    }
    return this.documents;
  }

  // Create new document in the collection
  create(content: any): string {
    // Validate keys
    this._validateTypes(content);

    const id =
      this.options.generateIds === "autoinc"
        ? (Object.keys(this.documents).length + 1).toString()
        : randomUUID();

    const document: Document = {
      //id,
      content,
      version: 1,
    };

    this.documents[id] = document;
    return id;
  }

  // Update
  update(
    where: { id?: string; [key: string]: any },
    content: object
  ): Document | Document[] | Error {
    if (!where || !Object.keys(where).length) {
      throw new Error("'where' is a required field of 'update'");
    }
    this._validateTypes(content);

    if (where?.id) {
      const id = where.id;
      if (!this.documents[id]) {
        throw new Error("Could not find the document to be updated");
      }
      this.documents[id] = {
        content: {
          ...this.documents[id].content,
          ...content,
        },
        version: this.documents[id].version + 1,
      };
      return this.documents[id];
    } else {
      //Object.keys(this.documents)
      const response = [] as Document[];
      for (const key in this.documents as Document) {
        for (const query in where) {
          if (
            this.documents[key].content[query] &&
            this.documents[key].content[query] === where[query]
          ) {
            this.documents[key] = {
              content: {
                ...this.documents[key].content,
                ...content,
              },
              version: this.documents[key].version + 1,
            };
            response.push(this.documents[key]);
          }
        }
      }
      if (!response.length) {
        throw new Error("Could not find the document to be updated");
      }
      return response as Document[];
    }
    throw new Error("Could not find the document to be updated");
  }

  private _validateTypes(content: { [key: string]: any }) {
    if (!content || !Object.keys(content)) {
      throw new Error("Can not create or update with an empty object");
    }
    Object.keys(content).map((key) => {
      if (
        this.schema.properties[key] !== "any" &&
        typeof content[key] !== this.schema.properties[key]
      ) {
        throw new Error(
          `Content key ${key} is not of type ${this.schema.properties[key]}`
        );
      }
    });
  }
}

export const createDatabase = ({
  options,
  schema,
}: {
  options?: Options;
  schema: Schema[];
}) => {
  return new SiamDatabase({ options, schema });
};
