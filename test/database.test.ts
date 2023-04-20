import { expect, assert } from "chai";

import { describe } from "mocha";

import { createDatabase, SiamDatabase } from "../src/index";
import { Options, Schema, Document } from "../src/types";

const options: Options = { generateIds: "autoinc" };
const schema: Schema[] = [
  {
    name: "users",
    properties: { name: "string", age: "number", bio: "object" },
  },
  {
    name: "products",
    properties: { name: "string", price: "number", description: "string" },
  },
];
const db = createDatabase({ options, schema });

describe("SiamDatabase", () => {
  describe("constructor", () => {
    it("should create a new instance with a schema and options", () => {
      expect(db).to.be.an.instanceOf(SiamDatabase);
    });

    it("should throw an error if no schema is provided", () => {
      expect(() => createDatabase({ options, schema: [] })).to.throw(
        "SiamDB schema has not been defined"
      );
    });
  });

  describe("Collection", () => {
    describe(".create(...)", () => {
      it("should return a Collection object", () => {
        const collection = db.users;
        expect(collection).to.be.an("object");
        expect(collection).to.have.property("create");
        expect(collection).to.have.property("get");
        expect(collection).to.have.property("update");
        // expect(collection).to.have.property("delete");
      });

      it("should have a successful .create({...})", () => {
        const collection = db.users;
        expect(
          collection.create({
            name: "Beavis",
            age: 20,
            bio: {
              english: "Lorem ipsum dolar",
              spanish: "Lorem ipsum dolar",
            },
          })
        ).to.be.an("string");
      });

      it("should throw errors when appropriate on .create({...})", () => {
        const collection = db.users;
        expect(() =>
          collection.create({ name: "John", age: "thirty" })
        ).to.throw("Content key age is not of type number");
        expect(() => collection.create()).to.throw(
          "Can not create or update with an empty object"
        );
      });

      it("should return undefined if specified collection was not created", () => {
        const collection = db.foo;
        expect(collection).to.be.an("undefined");
      });
    });

    describe(".get(...)", () => {
        const collection = db.users;

      it("should have a successful .get({id: '1'}) and return all values", () => {
        const user1 = collection.get({ id: "1" });
        expect(user1).to.have.property("content");
        expect(user1).to.have.property("version");
        expect(user1.content).to.have.property("name");
        expect(user1.content).to.have.property("age");
        expect(user1.content).to.have.property("bio");
        expect(user1.content.bio).to.have.property("english");
        expect(user1.content.bio).to.have.property("spanish");
      });
      it("should have a successful .get({name: ...}) and return an array with all values", () => {
        const user1 = collection.get({ name: "Beavis" });
        expect(user1).to.be.an("array");
        expect(user1[0]).to.have.property("content");
        expect(user1[0]).to.have.property("version");
        expect(user1[0].content).to.have.property("name");
        expect(user1[0].content).to.have.property("age");
        expect(user1[0].content).to.have.property("bio");
        expect(user1[0].content.bio).to.have.property("english");
        expect(user1[0].content.bio).to.have.property("spanish");
      }); 

      it("should throw errors when .get(...) returns no values", () => {
        expect(() => collection.get({id:"abc"})).to.throw(
          "Could not find any documents matching this query"
        );
        expect(() => collection.get({name:"Geronimo"})).to.throw(
            "Could not find any documents matching this query"
          );
        
      });
    });

    describe(".update({...},{...})", () => {
      it("should have a successful .update({id: '1'}, ...) and return all values", () => {
        const collection = db.users;

        expect(
          collection.update(
            { id: "1" },
            {
              name: "Butthead",
              age: 21,
            }
          )
        ).to.be.an("object");
        const user1 = collection.get({ id: "1" });
        expect(user1).to.have.property("content");
        expect(user1).to.have.property("version");
        expect(user1.version).to.equal(2);
        expect(user1.content).to.have.property("name");
        expect(user1.content.name).to.equal("Butthead");
        expect(user1.content).to.have.property("age");
        expect(user1.content.age).to.equal(21);
        expect(user1.content).to.have.property("bio");
        expect(user1.content.bio).to.have.property("english");
        expect(user1.content.bio).to.have.property("spanish");
      });

      it("should have a successful .update({name: 'string'}, ...) and return all updated records", () => {
        const collection = db.users;
        expect(collection.update({ name: "Butthead" }, { age: 23 })).to.be.an(
          "array"
        );
        const user1 = collection.get({ id: "1" });
        expect(user1).to.have.property("content");
        expect(user1).to.have.property("version");
        expect(user1.version).to.equal(3);
        expect(user1.content).to.have.property("name");
        expect(user1.content.name).to.equal("Butthead");
        expect(user1.content).to.have.property("age");
        expect(user1.content.age).to.equal(23);
        expect(user1.content).to.have.property("bio");
        expect(user1.content.bio).to.have.property("english");
        expect(user1.content.bio).to.have.property("spanish");
      });

      it("should throw errors when appropriate on .update({...})", () => {
        const collection = db.users;
        expect(() =>
          collection.update({ id: "1" }, { name: "John", age: "thirty" })
        ).to.throw("Content key age is not of type number");
        expect(() => collection.update()).to.throw(
          "'where' is a required field of 'update'"
        );
        expect(() => collection.update({ id: "1" })).to.throw(
          "Can not create or update with an empty object"
        );
        expect(() => collection.update({ id: "2" }, { age: 23 })).to.throw(
          "Could not find the document to be updated"
        );
        expect(() =>
          collection.update({ name: "Geronimo" }, { age: 23 })
        ).to.throw("Could not find the document to be updated");
      });
    });
  });
});
