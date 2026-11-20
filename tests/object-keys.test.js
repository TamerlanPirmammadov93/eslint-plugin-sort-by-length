const rule = require('../src/rules/object-keys');
const { createRuleTester } = require('./ruleTester');

createRuleTester().run('object-keys', rule, {
  valid: [
    'const o = { a: 1, bb: 2 };',
    'const o = { bb: 1, ...x, a: 2 };',
    'const o = { [k]: 1, a: 2, bb: 3 };',
    'const o = { only: 1 };',
  ],
  invalid: [
    {
      code: 'const o = { longKey: 1, a: 2 };',
      output: 'const o = { a: 2, longKey: 1 };',
      errors: [{ messageId: 'unsortedKeys' }],
    },
    {
      code: 'const o = { bb, a };',
      output: 'const o = { a, bb };',
      errors: [{ messageId: 'unsortedKeys' }],
    },
    {
      code: 'const o = { longKey: f(), a: 2 };',
      output: null,
      errors: [{ messageId: 'unsortedKeys' }],
    },
    {
      code: 'const o = { longKey: f(), a: 2 };',
      output: 'const o = { a: 2, longKey: f() };',
      options: [{ unsafeFix: true }],
      errors: [{ messageId: 'unsortedKeys' }],
    },
    {
      code: 'const o = { longKey: () => f(), a: 2 };',
      output: 'const o = { a: 2, longKey: () => f() };',
      errors: [{ messageId: 'unsortedKeys' }],
    },
  ],
});
