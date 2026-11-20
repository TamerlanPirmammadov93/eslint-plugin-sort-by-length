const { RuleTester } = require('eslint');
const { describe, it } = require('node:test');

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

function createRuleTester() {
  return new RuleTester({
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  });
}

module.exports = { createRuleTester };
