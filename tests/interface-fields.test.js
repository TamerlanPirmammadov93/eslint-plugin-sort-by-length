const rule = require('../src/rules/interface-fields');
const { createRuleTester } = require('./ruleTester');

createRuleTester().run('interface-fields', rule, {
  valid: [
    'interface A { id: number; name: string; }',
    'interface A {\n  id: number;\n  name: string;\n  uiKeys: PermissionItem[];\n}',
    'type T = { a: number, bb: string };',
    'interface A { only: string }',
  ],
  invalid: [
    {
      code: 'interface A {\n  name: string;\n  id: number;\n}',
      output: 'interface A {\n  id: number;\n  name: string;\n}',
      errors: [{ messageId: 'unsortedFields' }],
    },
    {
      code: 'interface A {\n  name: string;\n  id: number\n}',
      output: 'interface A {\n  id: number;\n  name: string\n}',
      errors: [{ messageId: 'unsortedFields' }],
    },
    {
      code: 'type T = { bb: string, a: number };',
      output: 'type T = { a: number, bb: string };',
      errors: [{ messageId: 'unsortedFields' }],
    },
    {
      code: 'interface A {\n  name: string;\n  // keep\n  id: number;\n}',
      output: null,
      errors: [{ messageId: 'unsortedFields' }],
    },
    {
      code: 'interface A {\n  f(a: string): void;\n  f(): void;\n}',
      output: null,
      errors: [{ messageId: 'unsortedFields' }],
    },
  ],
});
