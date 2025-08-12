import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

export const ANY_DOCS_JSON: SchemaObject = {
  nullable: true,
  oneOf: [
    { type: 'object', title: 'Object', description: 'Any JSON', additionalProperties: true },
    { type: 'array', items: {}, title: 'Array', description: 'Any array' },
    { type: 'string', title: 'String', description: 'Any string' },
    { type: 'number', title: 'Number', description: 'Any number' },
    { type: 'boolean', title: 'String', description: 'True or false' },
  ],
}
