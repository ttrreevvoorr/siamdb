const { randomUUID } = require("crypto")
import { EventEmitter } from "events"
import {
  Options,
  Schema,
  CollectionType,
  IdTypeOptions,
  Document,
  ResponseDoc,
} from "./types"

const defaultOptions = {
  generateIds: IdTypeOptions.AUTOINC,
}

export class SiamDatabase {
  private events: EventEmitter = new EventEmitter()
  private options: Options = defaultOptions
  private schema: Schema
  collections: { [key: string]: CollectionType }

  constructor({
    options = {},
    schema = {},
  }: {
    options?: Options
    schema?: Schema
  }) {
    this.options = {
      generateIds: options.generateIds || defaultOptions.generateIds,
    }
    this.schema = schema || []
    this.collections = {}
    if (!Object.keys(this.schema).length) {
      this.collections = {}
    } else {
      for (const collectionName in schema) {
        this.collections[collectionName] = new Collection({
          schema: schema[collectionName],
          options: this.options,
        })
      }
    }
  }

  collection(collection: string): CollectionType {
    if (!this.collections[collection]) {
      this.collections[collection] = new Collection({
        options: this.options,
      })
    }
    return this.collections[collection]
  }
}

class Collection implements CollectionType {
  private schema: Schema
  private options: Options
  private documents: any

  constructor({ schema = {}, options }: { schema?: Schema; options: Options }) {
    this.schema = schema || {}
    this.options = options
    this.documents = {}
  }

  /**
   * Find an array of documents matching the query
   * @param where: the id and/or any key:val pairs for an OR lookup
   * @returns:array The documents stored in the collection that match the query
   **/
  find(where: { id?: string; [key: string]: any } = {}): ResponseDoc[] {
    if (where.id) {
      if (!this.documents[where.id]) {
        return []
        //throw new Error("Could not find any documents matching this query")
      }
      return [
        {
          id: where.id,
          ...this.documents[where.id],
        },
      ]
    }
    const response = [] as ResponseDoc[]
    for (const key in this.documents as Document) {
      for (const query in where) {
        if (
          this.documents[key].content[query] &&
          this.documents[key].content[query] === where[query]
        ) {
          response.push({
            id: key,
            ...this.documents[key],
          })
        }
      }
      if (!response.length) {
        //throw new Error("Could not find any documents matching this query")
      }
    }
    return response as ResponseDoc[]
  }

  /**
   * Creates a document within a collection
   * @param content: the content to created under this collection
   * @returns id:string
   **/
  create(content: any): string {
    this._validateTypes(content, this.schema)

    const id =
      this.options.generateIds === "autoinc"
        ? (Object.keys(this.documents).length + 1).toString()
        : randomUUID()

    const document: Document = {
      content,
      version: 1,
    }

    this.documents[id] = document
    return id
  }

  /**
   * Update: Updates one or many documents, always returns an array
   * @param id?: id
   * @return ResponseDoc[]
   **/
  update(
    where: { id?: string; [key: string]: any },
    content: object
  ): ResponseDoc[] | Error {
    if (!where || !Object.keys(where).length) {
      throw new Error("'where' is a required field of 'update'")
    }
    this._validateTypes(content, this.schema)

    if (where?.id) {
      const id = where.id
      if (!this.documents[id]) {
        throw new Error("Could not find the document to be updated")
      }

      this.documents[id] = {
        content: {
          ...this.documents[id].content,
          ...content,
        },
        version: this.documents[id].version + 1,
      }
      return [
        {
          id,
          content: this.documents[id].content,
          version: this.documents[id].version,
        },
      ]
    } else {
      const response = [] as ResponseDoc[]
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
            }
            response.push({
              id: key,
              content: this.documents[key].content,
              version: this.documents[key].version,
            })
          }
        }
      }
      if (!response.length) {
        throw new Error("Could not find the document to be updated")
      }
      return response as ResponseDoc[]
    }
    throw new Error("Could not find the document to be updated")
  }

  /**
   * validateTypes
   * @param content
   * @returns error or null
   **/
  private _validateTypes(
    content: { [key: string]: any },
    schema?: Schema
  ): Error | true {
    if (!schema || !Object.keys(schema).length) {
      return true
    }

    if (!content || !Object.keys(content).length) {
      throw new Error(
        "Can not create or update with an empty object. Please see the .delete() method if applicable"
      )
    }

    Object.keys(content).forEach((key) => {
      if (schema[key] && typeof content[key] !== schema[key]) {
        throw new Error(`Content key ${key} is not of type ${schema[key]}`)
      }
    })

    return true
  }
}

export const createDatabase = ({
  options = {},
  schema = {},
}: {
  options?: Options
  schema?: Schema
}) => {
  return new SiamDatabase({ options, schema })
}
