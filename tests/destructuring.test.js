const rule = require('../src/rules/destructuring');
const { createRuleTester } = require('./ruleTester');

createRuleTester().run('destructuring', rule, {
  valid: [
    'const { a, bb } = x;',
    'const { a, ...restLong } = x;',
    'const { only } = x;',
    'const { [k]: z, a, bb } = x;',
  ],
  invalid: [
    {
      code: 'const { longName, a } = x;',
      output: 'const { a, longName } = x;',
      errors: [{ messageId: 'unsortedDestructuring' }],
    },
    {
      code: 'const { bb, a, ...rest } = x;',
      output: 'const { a, bb, ...rest } = x;',
      errors: [{ messageId: 'unsortedDestructuring' }],
    },
    {
      code: 'function f({ longName, a }: P) {}',
      output: 'function f({ a, longName }: P) {}',
      errors: [{ messageId: 'unsortedDestructuring' }],
    },
    {
      code: 'const { bbb = a, a } = x;',
      output: null,
      errors: [{ messageId: 'unsortedDestructuring' }],
    },
    {
      code: 'const { bbb = f(), a } = x;',
      output: null,
      errors: [{ messageId: 'unsortedDestructuring' }],
    },
    {
      code: 'const { bbb = f(), a } = x;',
      output: 'const { a, bbb = f() } = x;',
      options: [{ unsafeFix: true }],
      errors: [{ messageId: 'unsortedDestructuring' }],
    },
  ],
});
