# Siam DB
Server side in-app memory database for node


---

**⚠️ This is not production-ready software. This project is in active development. ⚠️**

---

## Install


## Usage

### Instantiate database
```
import { createDatabase } from "siamdb"

const options = { generateIds: "autoinc" };
const schema = [
  {
    name: "users",
    properties: {
      name: "string",
      age: "number",
      address: "object",
      active: "boolean",
    }
  }
]
const db = createDatabase(options, schema)
```

#### Create

```
const collection = db.users;

collection.create({
  name: "Emerald",
  age: 18,
  bio: {
    english: "Ipsum lorem dolar",
    spanish: "Ipsum lorem dolar",
  },
  and: "any",
  other: "key",
  value: "pairs",
  you: "want"
}
```


#### Get

```
const collection = db.users;
...
const user1 = collection.get({ id: "1" })[0];
```

or

```
const collection = db.users;
...
const user1 = collection.get({ name: "Emerald" })[0];
```


#### Update

```
const collection = db.users;
...
collection.update({ name: "Emerald" }, { age: 23 });
```

## Options

Defaults:

```
{
  generateIds: "uuid",
  backUp: {
    files: false,
    interval: (30 * 60) * 1000, // 30 minutes
    filePerCollections: false;
  }
}
```
