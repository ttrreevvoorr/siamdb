# Siam DB

## Install

```
$ npm i siamdb 
```


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
