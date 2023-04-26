# Siam DB
Server side in-app memory database for node


---

**⚠️ This is not production-ready software. This project is in active development. ⚠️**

---

## Install


## Usage

### Instantiate database

Schema is an optional paramater; When schema is passed through, creates and updates will adhere to the keys and types you provided, otherwise anything goes. Schema is one level deep, so no nested object key types.

generateIds may be `autoinc` or `uuid`

```
import { createDatabase } from "siamdb"

const options = { generateIds: "autoinc" };
const schema = { 
  "users": {
    name: "string",
    age: "number",
    address: "object",
    active: "boolean",
  }
}
const db = createDatabase({options, schema})
```

#### Create

Creating a document in a collection where the schema is defined
```
const collection = db.collection('users');

collection.create({
  name: "Emerald",
  age: 18,
  address: {
    street: "1234 Street st.",
    zipcode: "123456",
  },
  active: true
})
```

Creating a new collection with no schema, and inserting an object
```
const collection = db.collection('foo');

collection.create({
  just: "about",
  anything: 20,
  that: {
    you: "feel like",
    putting: "here",
  }
})
```




#### Find

```
const collection = db.collection('users');
...
const user1 = collection.get({ id: "1" })[0];
```

or

```
const collection = db.collection('users');
...
const user1 = collection.get({ name: "Emerald" })[0];
```


#### Update

```
const collection = db.collection('users');
...
collection.update({ name: "Emerald" }, { age: 23 });
```

## Options

Defaults:

```
{
  generateIds: "uuid",
}
```
