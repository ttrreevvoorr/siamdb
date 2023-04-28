
<p style="text-align: center;"><img alt="siam db"style="width:600px" src="https://user-images.githubusercontent.com/53444861/235057433-91f622fa-05e8-4a69-a5a2-5cb7e3082f96.png"/></p>

--- 
**S**erverside **I**n-**A**pp **M**emory **DB**

Siam DB is a simple, lightweight in-app memory database for Node.js that provides support for multiple collections of documents. It's designed to be easy to use and to provide a basic set of features for storing and retrieving data, without requiring a lot of configuration or setup.

**IMPORTANT**: Siam DB does not currently include any persistence mechanism to store data beyond the lifecycle of the application. **Therefore, when the application is restarted, all the data in the database will be lost.**


## Key Features

- Ideal for quickly storing and retrieving data during the testing and prototyping phase of development, without the need for a full database.
 - Efficient caching for frequently accessed data in memory for quick access.
 - Suitable for storing chat messages in a real-time application, where the persistence of the message history is trivial.


## Table of Contents

- [Installation](#installation)
- [Quick Start Example](#quick-start-example)
- [Usage](#usage)
  - [Create database](#create-database)
- [Collections](#collections)
  - [Advanced queries](#advanced-queries)
  - [Responses](#responses)
- [Database Parameters](#database-parameters)
  - [Options](#options)
  - [Schema](#schema)
 - [ToDo](#todo)

## Installation

```
npm install siamdb
```

## Quick Start Example

Create a file in your project called `siamdb.js` or `siam.ts` if you're using Typescript

```typescript
import { createDatabase } from "siamdb"
// or
const { createDatabase } = require("siamdb")

const options = {
  generateIds: "uuid"
};

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
};

const siamdb = createDatabase(options, schema);

module.exports = siamdb;
// or
export default siamdb;
```

Import the `siamdb.js` file into your project for use:

```typescript
const siamdb = require("./siamdb_instance")

const users = siamdb.collection("users")

// Create a document inside of the users collection
let newUserId = users.create({ name:"Beavis", age:19 }) // creates a documents returns a string

// Find the new document by id
let foundUser = users.find({id:newUserId}) // returns array of found documents

// Update the age of Beavis to 20
let updatedUser =  users.update({ id: newUserId }, { age:20 }) // returns array of updated documents

console.log(JSON.stringify({ newUserId, foundUser, updatedUser }))
//{
//  "newUserId": "3517261c-e793-4e6d-89e4-b3976292c71f",
//  "foundUser": [
//    {
//      "id": "3517261c-e793-4e6d-89e4-b3976292c71f",
//      "content": {
//        "name": "Beavis",
//        "age": 19
//      },
//      "version": 1
//    }
//  ],
//  "updatedUser": [
//    {
//      "id": "3517261c-e793-4e6d-89e4-b3976292c71f",
//      "content": {
//        "name": "Beavis",
//        "age": 20
//      },
//      "version": 2
//    }
//  ]
//}


users.delete({id:newUserId})
```

## Usage

### Create database

You can import the createDatabase function from the package:

```typescript
import { createDatabase } from "siamdb"
// or
const { createDatabase } = require("siamdb")
```

Then, create a new instance of the database by calling createDatabase and passing in an options object and a schema object:

```typescript
const options = {
  generateIds: "autoinc"
};

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
};

const database = createDatabase(options, schema);
```

Or you may omit `options` and `schema` entirely, opting for uuids for ids, and no limitations to the collections you can create and key value types you can use within:

```typescript
const database = createDatabase()
```

## Collections

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

### Advanced queries

| Operator  | Definition                        | Input Data Type | Description                                             | Example                                             |
|-----------|-----------------------------------|-----------------|---------------------------------------------------------|-----------------------------------------------------|
| `$exists` | Does this exist or not            | `boolean`       | Check if a field exists in the document                 | `.find({age: { $exists: true }})`                   |
| `$gte`    | Greater than or equal to          | `number`        | Check if a field is greater than or equal to a value    | `.find({age: { $gte: 18 }})`                         |
| `$gt`     | Greater than                      | `number`        | Check if a field is greater than a value                | `.find({age: { $gt: 18 }})`                          |
| `$lte`    | Less than or equal to             | `number`        | Check if a field is less than or equal to a value       | `.find({age: { $lte: 24 }})`                         |
| `$lt`     | Less than                         | `number`        | Check if a field is less than a value                   | `.find({age: { $lt: 24 }})`                          |
| `$in`     | Matches any value in an array     | `array`         | Check if a field's value matches any value in an array  | `.find({favoriteColors: { $in: ["red", "blue"] }})`  |
| `$nin`    | Matches none of the values in an array. | `array`    | Check if a field's value does not match any value in an array | `.find({favoriteColors: { $nin: ["green", "yellow"] }})`|
| `$ne`     | Not equal to                      | `any`           | Check if a field's value is not equal to a specified value | `.find({status: { $ne: "inactive" }})`           |
| `$or`     | Logical OR                        | `array`         | Check if any of the conditions in the array are true    | `.find({$or: [{ city: "New York" }, { city: "San Francisco" }]})` |
| `$and`    | Logical AND                       | `array`         | Check if all conditions in the array are true           | `.find({ $and: [{ active: true },{ verified: true }]})`         |


The following is an example utilizing all available operators:
```typescript
db.collection("user").find({
   age: { $gte: 18, $lte: 24 },
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
```

### Responses

#### find()

The `find()` method returns an array of documents

```typescript
[
  ...,
  {
    id: 1,
    content: { ... }, // the document content
    version: 1
  }
  ...
]
```

#### update()

The `update()` method returns an array of updated documents

```typescript
[
  ...,
  {
    id: 1,
    content: { ... }, // the updated document content
    version: 2
  }
  ...
]
```

#### create()

The `create()` method returns a `string` of new document's id

```typescript
"1"
//or
"3f9b4392-5257-4cb2-9cad-6bb5dad95424"
```

#### delete()

The `delete()` method returns an `array` of the deleted document ids

```typescript
["1"]
//or
["3f9b4392-5257-4cb2-9cad-6bb5dad95424"]
```

## Database Parameters

The `createDatabase` function accepts an optional `options` object as the first parameter and an optional `schema` object as the second parameter:
```typescript
const database = createDatabase(options, schema)
```

### Options

The `options` object contains:

 - `generateIds` (optional): Specifies how to generate document IDs. Can be set to `"autoinc"` to generate IDs automatically as integers starting from 1, or `"uuid"` to generate UUIDs using the `crypto.randomUUID` method.

Example:
```typescript
const database = createDatabase({
  generateIds: "autoinc"
}, ...)
```

#### Schema

The optional schema object passed to `createDatabase` should be an object where each key represents a collection name, and each value represents the schema for that collection. The schema for each collection should be an object where each key represents a field name, and each value represents the data type for that field. The supported data types are that of Javascript's [typeof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof):

- `string`
- `number`
- `boolean`
- `object`
- `function`


Example:
```typescript
const database = createDatabase(..., {
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
  })
```


## ToDo:

- Implement some type of `ttl` on collections and/or documents.
- Allow file saves/backups as an optional



