"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDatabase = exports.SiamDatabase = void 0;
const { randomUUID } = require("crypto");
const events_1 = require("events");
const types_1 = require("./types");
const DEFAULT_OPTIONS = {
    generateIds: types_1.IdTypeOptions.AUTOINC,
};
class SiamDatabase {
    constructor({ options = {}, schema = {}, }) {
        this.events = new events_1.EventEmitter();
        this.options = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);
        this.schema = schema;
        this.collections = {};
        for (const collectionName in schema) {
            this.collections[collectionName] = new Collection({
                schema: schema[collectionName],
                options: this.options,
            });
        }
    }
    collection(collection) {
        if (!this.collections[collection]) {
            this.collections[collection] = new Collection({
                options: this.options,
            });
        }
        return this.collections[collection];
    }
}
exports.SiamDatabase = SiamDatabase;
class Collection {
    constructor({ schema = {}, options }) {
        this.schema = schema || {};
        this.options = options;
        this.documents = {};
    }
    /**
     * Find an array of documents matching the query
     * @param {object} where: the id and/or any key:val pairs for an OR lookup
     * @returns {array} The documents stored in the collection that match the query
     **/
    find(where = {}) {
        const results = [];
        if (where.id) {
            const document = this.documents[where.id];
            if (document) {
                results.push(Object.assign({ id: where.id }, document));
            }
        }
        else {
            for (const key in this.documents) {
                const document = this.documents[key];
                let docFound = true;
                for (const query in where) {
                    if (document.content[query] !== where[query]) {
                        docFound = false;
                        break;
                    }
                }
                if (docFound) {
                    results.push(Object.assign({ id: key }, document));
                }
            }
        }
        return results;
    }
    /**
     * Creates a document within a collection
     * @param{any} content: the content to created under this collection
     * @returns{string} The id of the inserted collection
     **/
    create(content) {
        this._validateTypes(content, this.schema);
        const id = this.options.generateIds === types_1.IdTypeOptions.AUTOINC
            ? (Object.keys(this.documents).length + 1).toString()
            : randomUUID();
        const document = {
            content,
            version: 1,
        };
        this.documents[id] = document;
        return id;
    }
    /**
     * Update: Updates one or many documents, always returns an array
     * @param{object} id?: id
     * @return{array} ResponseDoc[]
     **/
    update(where, content) {
        if (!where || !Object.keys(where).length) {
            throw new Error("'where' is a required field of 'update'");
        }
        this._validateTypes(content, this.schema);
        if (where === null || where === void 0 ? void 0 : where.id) {
            const id = where.id;
            if (!this.documents[id]) {
                throw new Error("Could not find the document to be updated");
            }
            this.documents[id] = {
                content: Object.assign(Object.assign({}, this.documents[id].content), content),
                version: this.documents[id].version + 1,
            };
            return [
                {
                    id,
                    content: this.documents[id].content,
                    version: this.documents[id].version,
                },
            ];
        }
        else {
            const response = [];
            for (const key in this.documents) {
                for (const query in where) {
                    if (this.documents[key].content[query] &&
                        this.documents[key].content[query] === where[query]) {
                        this.documents[key] = {
                            content: Object.assign(Object.assign({}, this.documents[key].content), content),
                            version: this.documents[key].version + 1,
                        };
                        response.push({
                            id: key,
                            content: this.documents[key].content,
                            version: this.documents[key].version,
                        });
                    }
                }
            }
            if (!response.length) {
                throw new Error("Could not find the document to be updated");
            }
            return response;
        }
        throw new Error("Could not find the document to be updated");
    }
    /**
     * Delete: Deletes one or many documents in the collection, always returns an array
     * @param {object} If contains an id field, it deletes the document with that ID. Otherwise, it deletes all documents that match the query.
     * @return {array} An array of strings containing the deleted ids
     **/
    delete(where) {
        if (!where || !Object.keys(where).length) {
            throw new Error("'where' is a required field of 'delete'");
        }
        if (where.id) {
            if (!this.documents[where.id]) {
                throw new Error("Could not find the document to be deleted");
            }
            delete this.documents[where.id];
            return [where.id];
        }
        else {
            const response = [];
            for (const key in this.documents) {
                for (const query in where) {
                    if (this.documents[key].content[query] &&
                        this.documents[key].content[query] === where[query]) {
                        delete this.documents[key];
                        response.push(key);
                    }
                }
            }
            if (!response.length) {
                throw new Error("Could not find the document to be deleted");
            }
            return response;
        }
    }
    /**
     * validateTypes
     * @param{object} content
     * @param{object} schema, optional
     * @returns{true|boolean} error or null
     **/
    _validateTypes(content, schema) {
        if (!schema || !Object.keys(schema).length) {
            return true;
        }
        if (!content || !Object.keys(content).length) {
            throw new Error("Can not create or update with an empty object. Please see the .delete() method if applicable");
        }
        const contentKeys = Object.keys(content);
        for (let i = 0; i < contentKeys.length; i++) {
            const key = contentKeys[i];
            const schemaType = schema[key];
            const contentType = typeof content[key];
            if (Object.keys(schema).includes(key) && contentType !== schemaType) {
                throw new Error(`Content key ${key} is not of type ${schemaType}`);
            }
        }
        return true;
    }
}
const createDatabase = ({ options = {}, schema = {}, }) => {
    return new SiamDatabase({ options, schema });
};
exports.createDatabase = createDatabase;
//# sourceMappingURL=main.js.map