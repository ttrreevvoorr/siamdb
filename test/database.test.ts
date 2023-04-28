import { expect, assert } from "chai"
import { describe } from "mocha"
import { createDatabase, SiamDatabase } from "../src/main"
import { Options, Schema, ResponseDoc, IdTypeOptions } from "../src/types"

const options: Options = { generateIds: IdTypeOptions.AUTOINC }
const schema: Schema = {
  users: { name: "string", age: "number", bio: "object" },
}
const db = createDatabase(options, schema)
const db2 = createDatabase()

describe("SiamDatabase", () => {
  describe("createDatabase", () => {
    it("should create a new instance with default options when called without arguments", () => {
      const defaultDb = createDatabase()
      expect(defaultDb).to.be.an.instanceOf(SiamDatabase)
    })

    it("should create a new instance with the provided options when called with arguments", () => {
      const customDb = createDatabase(options, schema)
      expect(customDb).to.be.an.instanceOf(SiamDatabase)
    })
  })

  describe("Collection", () => {
    describe('.collection("...")', () => {
      it("should throw an error when called with an invalid collection name", () => {
        expect(() => db.collection("")).to.throw(
          "Can not represent an empty collection"
        )
      })
    })

    describe(".create(...) with schema", () => {
      it("should return a Collection object", () => {
        const collection = db.collection("users")
        expect(collection).to.be.an("object")
        expect(collection).to.have.property("create")
        expect(collection).to.have.property("find")
        expect(collection).to.have.property("update")
        expect(collection).to.have.property("delete")
      })

      it("should have two successful .create({...})", () => {
        const collection = db.collection("users")
        expect(
          collection.create({
            name: "Beavis",
            age: 20,
            bio: {
              english: "Lorem ipsum dolar",
              spanish: "Lorem ipsum dolar",
            },
          })
        )
          .to.be.an("string")
          .and.to.equal("1")

        expect(
          collection.create({
            name: "Butthead",
            age: 18,
            bio: {
              english: "Ipsum lorem dolar",
              spanish: "Ipsum lorem dolar",
            },
          })
        )
          .to.be.an("string")
          .and.to.equal("2")
      })

      it("should throw errors when appropriate on .create({...})", () => {
        const collection = db.collection("users")
        expect(() =>
          collection.create({ name: "John", age: "thirty" })
        ).to.throw("Content key age is not of type number")
        expect(() => collection.create({})).to.throw(
          "Can not create or update with an empty object"
        )
      })
    })

    describe(".create(...) without a schema", () => {
      const collection = db.collection("foo")
      it("should return a Collection object", () => {
        expect(collection).to.be.an("object")
        expect(collection).to.have.property("create")
        expect(collection).to.have.property("find")
        expect(collection).to.have.property("update")
        expect(collection).to.have.property("delete")
      })

      it("should have two successful .create({...})", () => {
        expect(
          collection.create({
            just: "about",
            anything: 20,
            that: {
              i: "feel like",
              putting: "here",
            },
          })
        )
          .to.be.an("string")
          .and.to.equal("1")

        expect(
          collection.create({
            something: 100,
            completely: true,
            different: [1, 2, 3],
          })
        )
          .to.be.an("string")
          .and.to.equal("2")
      })

      it("should throw errors when appropriate on .create({...})", () => {
        const collection = db.collection("users")
        expect(() =>
          collection.create({ name: "John", age: "thirty" })
        ).to.throw("Content key age is not of type number")
        expect(() => collection.create({})).to.throw(
          "Can not create or update with an empty object"
        )
      })
    })

    describe(".find(...)", () => {
      const collection = db.collection("users")

      it("should return all documents when called with an empty object", () => {
        const allDocs = db.collection("users").find({})
        expect(allDocs).to.be.an("array")
        expect(allDocs.length).to.equal(2) // Assuming there are 2 documents in the collection
      })

      it("should have a successful .find({id: '1'}) and return all values", () => {
        const user1 = collection.find({ id: "1" })[0] as ResponseDoc
        expect(user1).to.have.property("content")
        expect(user1).to.have.property("version")
        expect(user1.content).to.have.property("name")
        expect(user1.content).to.have.property("age")
        expect(user1.content).to.have.property("bio")
        expect(user1.content.bio).to.have.property("english")
        expect(user1.content.bio).to.have.property("spanish")
      })

      it("should have a successful .find({id: '2'}) and return all values", () => {
        const user2 = collection.find({ id: "2" })[0] as ResponseDoc
        expect(user2).to.have.property("content")
        expect(user2).to.have.property("version")
        expect(user2.content).to.have.property("name")
        expect(user2.content).to.have.property("age")
        expect(user2.content).to.have.property("bio")
        expect(user2.content.name).to.equal("Butthead")
        expect(user2.content.bio).to.have.property("english")
        expect(user2.content.bio).to.have.property("spanish")
      })

      it("should have a successful .find({name: ...}) and return an array with all values", () => {
        const user1 = collection.find({ name: "Beavis" })
        expect(user1).to.be.an("array")
        expect(user1[0]).to.have.property("content")
        expect(user1[0]).to.have.property("version")
        expect(user1[0].content).to.have.property("name")
        expect(user1[0].content).to.have.property("age")
        expect(user1[0].content).to.have.property("bio")
        expect(user1[0].content.bio).to.have.property("english")
        expect(user1[0].content.bio).to.have.property("spanish")
      })

      it("should have a successful .find({&gt, &lt, $exists}) and return an array with all values", () => {
        const collection = db2.collection("user")
        collection.create({
          name: "John Doe",
          age: 25,
          email: "john.doe@example.com",
          status: "active",
          score: 75,
          favoriteColors: ["red", "blue"],
          city: "New York",
          active: true,
          verified: true,
          createdAt: new Date("2023-02-15"),
        })

        let user = collection.find({
          age: { $gte: 0, $lte: 30 },
          email: { $exists: true },
          status: { $ne: "inactive" },
          score: { $gt: 0, $lt: 100 },
          favoriteColors: { $in: ["red", "blue"], $nin: ["green", "yellow"] },
          $or: [{ city: "New York" }, { city: "San Francisco" }],
          $and: [
            { active: true },
            { verified: true },
            {
              createdAt: {
                $gte: new Date("2023-01-01"),
                $lt: new Date("2023-04-01"),
              },
            },
          ],
        })
        user = collection.find({
          age: { $gte: 0, $lte: 30 },
        })
        expect(user).to.be.an("array")

        expect(user[0]).to.have.property("content")
        expect(user[0]).to.have.property("version")
        expect(user[0].content).to.have.property("name")
        expect(user[0].content).to.have.property("age")
        expect(user[0].content).to.have.property("active")
        expect(user[0].content).to.have.property("verified")
        expect(user[0].content).to.have.property("city")
      })

      it("should return empty array when .find(...) returns no values", () => {
        const bogusFind = collection.find({ id: "abc" })
        expect(Array.isArray(bogusFind)).to.equal(true)
        expect(bogusFind.length).to.equal(0)
      })
    })

    describe(".update({...},{...})", () => {
      it("should have a successful .update({id: '1'}, ...) and return all values", () => {
        const collection = db.collection("users")
        expect(
          collection.update(
            { id: "1" },
            {
              name: "Butthead",
              age: 21,
            }
          )
        ).to.be.an("array")
        const user1 = collection.find({ id: "1" })[0]
        expect(user1).to.have.property("content")
        expect(user1).to.have.property("version")
        expect(user1.version).to.equal(2)
        expect(user1.content).to.have.property("name")
        expect(user1.content.name).to.equal("Butthead")
        expect(user1.content).to.have.property("age")
        expect(user1.content.age).to.equal(21)
        expect(user1.content).to.have.property("bio")
        expect(user1.content.bio).to.have.property("english")
        expect(user1.content.bio).to.have.property("spanish")
      })

      it("should have a successful .update({name: 'string'}, ...) and return all updated records", () => {
        const collection = db.collection("users")
        expect(collection.update({ name: "Butthead" }, { age: 23 })).to.be.an(
          "array"
        )
        const user1 = collection.find({ id: "1" })[0]
        expect(user1).to.have.property("content")
        expect(user1).to.have.property("version")
        expect(user1.version).to.equal(3)
        expect(user1.content).to.have.property("name")
        expect(user1.content.name).to.equal("Butthead")
        expect(user1.content).to.have.property("age")
        expect(user1.content.age).to.equal(23)
        expect(user1.content).to.have.property("bio")
        expect(user1.content.bio).to.have.property("english")
        expect(user1.content.bio).to.have.property("spanish")
      })

      it("should throw errors when appropriate on .update({...})", () => {
        const collection = db.collection("users")
        expect(() =>
          collection.update({ id: "1" }, { name: "John", age: "thirty" })
        ).to.throw("Content key age is not of type number")
        expect(() => collection.update({}, {})).to.throw(
          "'where' is a required field of 'update'"
        )
        expect(() => collection.update({ id: "abc" }, { age: 23 })).to.throw(
          "Could not find the document to be updated"
        )
        expect(() =>
          collection.update({ name: "Geronimo" }, { age: 23 })
        ).to.throw("Could not find the document to be updated")
      })
    })

    describe(".delete({...})", () => {
      it("should delete a document by id", () => {
        const collection = db.collection("users")
        const id = collection.create({
          name: "John",
          email: "john@example.com",
          age: 25,
        })
        collection.delete({ id })
        expect(collection.find({ id })).to.be.an("array").that.is.empty
      })

      it("should delete documents that match a query", () => {
        const collection = db.collection("users")
        collection.create({ name: "John", age: 25 })
        collection.create({ name: "Jane", age: 30 })
        collection.delete({ age: 25 })
        const john = collection.find({ name: "John" })
        const jane = collection.find({ name: "Jane" })
        expect(john).to.be.an("array").that.is.empty
        expect(jane).to.be.an("array").that.is.not.empty
      })

      it("should throw an error when appropriate on .delete({...})", () => {
        const collection = db.collection("users")
        expect(() => collection.delete({})).to.throw(
          "'where' is a required field of 'delete'"
        )
        expect(() => collection.delete({ id: "abc" })).to.throw(
          "Could not find the document to be deleted"
        )
        expect(() => collection.delete({ name: "Geronimo" })).to.throw(
          "Could not find the document to be deleted"
        )
      })
    })
  })
})
