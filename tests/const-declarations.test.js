const rule = require('../src/rules/const-declarations');
const { createRuleTester } = require('./ruleTester');

const DEPENDENT_RUN = [
  'const currentVehicles = prisonerSocialInfoData?.vehicles;',
  "const isVehiclesChanged = !!versionSocialInfoData && isFieldChanged(['vehicles']);",
  'const comparedVehicles = isVehiclesChanged ? (currentVehicles ?? []) : undefined;',
  'const shownVehicles = versionSocialInfoData ? versionSocialInfoData.vehicles : currentVehicles;',
].join('\n');

createRuleTester().run('const-declarations', rule, {
  valid: [
    'const a = 1;\nconst bb = 2;',
    DEPENDENT_RUN,
    'const bbbbbbbb = 1;\n\nconst a = 2;',
    'const bb = 1, a = 2;',
    'let bbbbbbbb = 1;\nlet a = 2;',
    'const bbbbbbbb = 1;\nfoo();\nconst a = 2;',
  ],
  invalid: [
    {
      code: 'const bbbbbbbb = 1;\nconst a = 2;',
      output: 'const a = 2;\nconst bbbbbbbb = 1;',
      errors: [{ messageId: 'unsortedConsts' }],
    },
    {
      code: 'const bb = 1;\nconst cccccccc = bb;\nconst a = 2;',
      output: 'const a = 2;\nconst bb = 1;\nconst cccccccc = bb;',
      errors: [{ messageId: 'unsortedConsts' }],
    },
    {
      code: 'const bbbbbbbb = 1;\n\nconst a = 2;',
      output: 'const a = 2;\n\nconst bbbbbbbb = 1;',
      options: [{ isBlankLineBoundary: false }],
      errors: [{ messageId: 'unsortedConsts' }],
    },
    {
      code: 'function f() {\n  const bbbbbbbb = 1;\n  const a = 2;\n}',
      output: 'function f() {\n  const a = 2;\n  const bbbbbbbb = 1;\n}',
      errors: [{ messageId: 'unsortedConsts' }],
    },
    {
      code: 'const bbbbbbbb = f();\nconst a = g();',
      output: null,
      errors: [{ messageId: 'unsortedConsts' }],
    },
    {
      code: 'const bbbbbbbb = f();\nconst a = g();',
      output: 'const a = g();\nconst bbbbbbbb = f();',
      options: [{ unsafeFix: true }],
      errors: [{ messageId: 'unsortedConsts' }],
    },
    {
      code: 'const bbbbbbbb = 1;\n// keep\nconst a = 2;',
      output: null,
      errors: [{ messageId: 'unsortedConsts' }],
    },
  ],
});
