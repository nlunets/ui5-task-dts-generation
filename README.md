# UI5 Tooling task to generate the typescript types

Task for [ui5-builder](https://github.com/SAP/ui5-builder), enabling type generation for your libraries.

## Install

```bash
npm install ui5-task-dts-generation --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- validateFile: true|false
  
whether or not to validate the generate file

- strictMode: true|false

in strict mode a validation error will result in a build failure 

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
{
  "devDependencies": {
    "ui5-task-dts-generation": "^1.0.0"
  },
  "ui5": {
    "dependencies": [
      "ui5-task-dts-generation"
    ]
  }
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

2. configure it in `$yourapp/ui5.yaml`:

```yaml
builder:
  customTasks:
  - name: ui5-task-dts-generation
    afterTask: executeJsdocSdkTransformation
```

## How it works

The task uses the [@ui5/dts-generator](https://github.com/SAP/ui5-typescript), 

## License

This file is licensed under the Apache Software License, v. 2 except as noted otherwise in the LICENSE file.