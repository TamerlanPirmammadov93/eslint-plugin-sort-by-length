const rule = require('../src/rules/enum-members');
const { createRuleTester } = require('./ruleTester');

createRuleTester().run('enum-members', rule, {
  valid: [
    "enum E { ERROR = 'error', PURPLE = 'purple', SUCCESS = 'success' }",
    'enum E { Bbbb, A }',
    "enum E { Bbbb = 1, A }",
    "enum E { Only = 'only' }",
  ],
  invalid: [
    {
      code: "enum E {\n  SUCCESS = 's',\n  ERROR = 'e',\n}",
      output: "enum E {\n  ERROR = 'e',\n  SUCCESS = 's',\n}",
      errors: [{ messageId: 'unsortedMembers' }],
    },
    {
      code: 'enum E { Bbbb = 2, A = 1 }',
      output: 'enum E { A = 1, Bbbb = 2 }',
      errors: [{ messageId: 'unsortedMembers' }],
    },
    {
      code: "enum E {\n  Long = 'l',\n  // keep\n  A = 'a',\n}",
      output: null,
      errors: [{ messageId: 'unsortedMembers' }],
    },
  ],
});
