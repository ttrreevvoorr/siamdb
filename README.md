# Siam DB
Server side in-app memory database for node


---

**⚠️ This is not production-ready software. This project is in active development. ⚠️**

---

## Install


## Usage
```
const options = {};
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
