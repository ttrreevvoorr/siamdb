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

const DEFAULT_OPTIONS: Options = {
  generateIds: IdTypeOptions.AUTOINC,
}

export class SiamDatabase {
  private readonly events: EventEmitter = new EventEmitter()
  private readonly options: Options
  private readonly schema: Schema
  private readonly collections: Record<string, CollectionType>

  constructor({
    options = {},
    schema = {},
  }: {
    options?: Options
    schema?: Schema
  }) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    }
    this.schema = schema
    this.collections = {}

    for (const collectionName in schema) {
      this.collections[collectionName] = new Collection({
        schema: schema[collectionName],
        options: this.options,
      })
    }
  }

  public collection(collection: string): CollectionType {
    if (!collection) {
      throw new Error("Can not represent an empty collection")
    }
    if (!this.collections[collection]) {
      this.collections[collection] = new Collection({
        options: this.options,
      })
    }
    return this.collections[collection]
  }
}

class Collection implements CollectionType {
  private readonly schema: Schema
  private readonly options: Options
  private readonly documents: any

  constructor({ schema = {}, options }: { schema?: Schema; options: Options }) {
    this.schema = schema || {}
    this.options = options
    this.documents = {}
  }

  /**
   * Find an array of documents matching the query
   * @param {object} where: the id and/or any key:val pairs for an OR lookup
   * @returns {array} The documents stored inThe `update()` method returns lection that match the query
   **/
  public find(where: { id?: string; [key: string]: any } = {}): ResponseDoc[] {
    const results: ResponseDoc[] = []

    const isOperator = (op: string): boolean => {
      return op.charAt(0) === "$"
    }

    const _evaluateOperator = (
      op: string,
      fieldValue: any,
      queryValue: any
    ): boolean => {
      switch (op) {
        case "$gt":
          return fieldValue > queryValue
        case "$lt":
          return fieldValue < queryValue
        case "$exists":
          return queryValue
            ? fieldValue !== undefined
            : fieldValue === undefined
        case "$in":
          return Array.isArray(queryValue) && queryValue.includes(fieldValue)
        case "$nin":
          return Array.isArray(queryValue) && !queryValue.includes(fieldValue)
        case "$ne":
          return fieldValue !== queryValue
        case "$gte":
          return fieldValue >= queryValue
        case "$lte":
          return fieldValue <= queryValue
        default:
          return false
      }
    }

    const _evaluateCondition = (fieldValue: any, queryValue: any): boolean => {
      if (typeof queryValue === "object" && !Array.isArray(queryValue)) {
        for (const operator in queryValue) {
          if (
            isOperator(operator) &&
            !_evaluateOperator(operator, fieldValue, queryValue[operator])
          ) {
            return false
          }
        }

        return true
      } else {
        return fieldValue === queryValue
      }
    }

    if (where.id) {
      const document = this.documents[where.id]

      if (document) {
        results.push({
          id: where.id,
          ...document,
        })
      }
    } else {
      for (const key in this.documents as Document) {
        const document = this.documents[key]
        const orConditions = where.$or || ([where] as { [key: string]: any }[])
        const andConditions = where.$and || []

        let docFound = orConditions.some(
          (orCondition: { [key: string]: any }) => {
            for (const query in orCondition) {
              if (
                !_evaluateCondition(document.content[query], orCondition[query])
              ) {
                return false
              }
            }
            return true
          }
        )

        if (docFound) {
          for (const andCondition of andConditions) {
            for (const query in andCondition) {
              if (
                !_evaluateCondition(
                  document.content[query],
                  andCondition[query]
                )
              ) {
                docFound = false
                break
              }
            }
            if (!docFound) {
              break
            }
          }
        }

        if (docFound) {
          results.push({
            id: key,
            ...document,
          })
        }
      }
    }
    return results
  }

  /**
   * Creates a document within a collection
   * @param{any} content: the content to created under this collection
   * @returns{string} The id of the inserted collection
   **/
  public create(content: any): string {
    this._validateTypes(content, this.schema)

    const id =
      this.options.generateIds === IdTypeOptions.AUTOINC
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
   * @param{object} id?: id
   * @return{array} ResponseDoc[]
   **/
  public update(
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
   * Delete: Deletes one or many documents in the collection, always returns an array
   * @param {object} If contains an id field, it deletes the document with that ID. Otherwise, it deletes all documents that match the query.
   * @return {array} An array of strings containing the deleted ids
   **/
  public delete(where: { id?: string; [key: string]: any }): string[] | Error {
    if (!where || !Object.keys(where).length) {
      throw new Error("'where' is a required field of 'delete'")
    }

    if (where.id) {
      if (!this.documents[where.id]) {
        throw new Error("Could not find the document to be deleted")
      }
      delete this.documents[where.id]
      return [where.id]
    } else {
      const response = [] as string[]
      for (const key in this.documents as Document) {
        for (const query in where) {
          if (
            this.documents[key].content[query] &&
            this.documents[key].content[query] === where[query]
          ) {
            delete this.documents[key]
            response.push(key)
          }
        }
      }
      if (!response.length) {
        throw new Error("Could not find the document to be deleted")
      }
      return response as string[]
    }
  }

  /**
   * validateTypes
   * @param{object} content
   * @param{object} schema, optional
   * @returns{true|boolean} error or null
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

    const contentKeys = Object.keys(content)
    for (let i = 0; i < contentKeys.length; i++) {
      const key = contentKeys[i]
      const schemaType = schema[key]
      const contentType = typeof content[key]

      if (Object.keys(schema).includes(key) && contentType !== schemaType) {
        throw new Error(`Content key ${key} is not of type ${schemaType}`)
      }
    }

    return true
  }
}

export const createDatabase = (options?: Options, schema?: Schema) => {
  return new SiamDatabase({ options, schema })
}
