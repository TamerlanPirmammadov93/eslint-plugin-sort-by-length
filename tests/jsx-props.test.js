const rule = require('../src/rules/jsx-props');
const { createRuleTester } = require('./ruleTester');

createRuleTester().run('jsx-props', rule, {
  valid: [
    '<A />',
    '<A a="1" />',
    '<A a="1" bb="22" />',
    '<A icon={x} value="12" />',
    '<A bb="22" {...p} a="1" />',
    '<A disabled isRequired />',
  ],
  invalid: [
    {
      code: '<A longProp="xxxxxxxx" a="1" />',
      output: '<A a="1" longProp="xxxxxxxx" />',
      errors: [{ messageId: 'unsortedProps' }],
    },
    {
      code: '<A {...p} bb="22" a="1" />',
      output: '<A {...p} a="1" bb="22" />',
      errors: [{ messageId: 'unsortedProps' }],
    },
    {
      code: '<A isRequired disabled />',
      output: '<A disabled isRequired />',
      errors: [{ messageId: 'unsortedProps' }],
    },
    {
      code: '<A\n  label="a very long label"\n  value="1"\n/>',
      output: '<A\n  value="1"\n  label="a very long label"\n/>',
      errors: [{ messageId: 'unsortedProps' }],
    },
    {
      code: '<A bb="22" /* keep */ a="1" />',
      output: null,
      errors: [{ messageId: 'unsortedProps' }],
    },
  ],
});
