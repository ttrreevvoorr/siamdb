# Siam DB
**S**erverside **I**n-**A**pp **M**emory **DB** for node that provides a simple and lightweight database with support for multiple collections of documents.

---

**⚠️ This is not production-ready software. This project is in active development. ⚠️**

---

## Installation

```
npm install siam-database
```

## Usage

### Instantiate database

Schema is an optional paramater; When schema is passed through, creates and updates will adhere to the keys and types you provided, otherwise anything goes. Schema is one level deep, so no nested object key types.

generateIds may be `autoinc` or `uuid`

```typescript
import { createDatabase } from "siamdb"
// or
const { createDatabase } = require("siam-database")
```

Then, create a new instance of the database by calling createDatabase and passing in an options object and a schema object:
```typescript
const options = {
  generateIds: "autoinc"
}

const schema = {
  users: {
    name: "string",
    email: "string",
    age: "number"
  },
  posts: {
    title: "string",
    content: "string",
    authorId: "string"
  }
}

const database = createDatabase({ options, schema })
```

Once you have a SiamDatabase instance, you can access the collections by calling the collection method:

```typescript
const users = database.collection("users")
const posts = database.collection("posts")
```

Each collection has methods for finding, creating, updating, and deleting documents:

```typescript
// Create a new document
const userId = users.create({ name: "John", email: "john@example.com", age: 25 })

// Update documents that match a query
users.update({ id: userId }, { age: 26 })

// Delete documents that match a query
users.delete({ id: userId })
```

## Options

The createDatabase function accepts an options object with the following properties:

 - `generateIds` (optional): Specifies how to generate document IDs. Can be set to `"autoinc"` to generate IDs automatically as integers starting from 1, or `"uuid"` to generate UUIDs using the `crypto.randomUUID` method.

## Schema

The schema object passed to createDatabase should be an object where each key represents a collection name, and each value represents the schema for that collection. The schema for each collection should be an object where each key represents a field name, and each value represents the data type for that field. The supported data types are that of `typeof`.
