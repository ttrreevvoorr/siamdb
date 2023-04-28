<p style="text-align: center;"><img alt="siam db"style="width:600px" src="https://user-images.githubusercontent.com/53444861/235057433-91f622fa-05e8-4a69-a5a2-5cb7e3082f96.png"/></p>

--- 
**S**erverside **I**n-**A**pp **M**emory **DB**

Siam DB is a simple, lightweight in-app memory database for Node.js that provides support for multiple collections of documents. It's designed to be easy to use and to provide a basic set of features for storing and retrieving data, without requiring a lot of configuration or setup.

It is important to understand that Siam DB does not currently include any persistence mechanism to store data beyond the lifecycle of the application. **Therefore, when the application is restarted, all the data in the database will be lost**.

- Great for quickly storing and retrieving data during the testing and prototyping phase of development, without the need for a full database.
- Satisfies caching frequently accessed data in memory for quick access
- Suitable for storing chat messages in a real time application, where the persistence of the message history is trivial. 


## Installation

```
npm install siamdb
```

## Usage

### Create database

Schema is an optional paramater; When schema is passed through, creates and updates will adhere to the keys and types you provided, otherwise anything goes. Schema is one level deep, so no nested object key types.

generateIds may be `autoinc` or `uuid`

```typescript
import { createDatabase } from "siamdb"
// or
const { createDatabase } = require("siamdb")
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
    age: "number",
    active: "boolean",
    children: "object"
  },
  posts: {
    title: "string",
    content: "string",
    authorId: "string"
  }
}

const database = createDatabase(options, schema)
```

Or you may omit `options` and `schema` entirely, opting for uuids for ids, and no limitations to the collections you can create and key value types you can use within.

```typescript
const database = createDatabase()
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

// Find an array of documents
const activeUser = users.find({ name: "John" })

// Update documents that match a query
users.update({ id: userId }, { age: 26 })

// Delete documents that match a query
users.delete({ id: userId })
```

### Options

The createDatabase function accepts an optional `options` object and an optional `schema` object:

The `options` object contains:

 - `generateIds` (optional): Specifies how to generate document IDs. Can be set to `"autoinc"` to generate IDs automatically as integers starting from 1, or `"uuid"` to generate UUIDs using the `crypto.randomUUID` method.

### Schema

The optional schema object passed to createDatabase should be an object where each key represents a collection name, and each value represents the schema for that collection. The schema for each collection should be an object where each key represents a field name, and each value represents the data type for that field. The supported data types are that of Javascript's [typeof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof):

- `string`
- `number`
- `boolean`
- `object`
- `function`
