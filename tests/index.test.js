const assert = require('node:assert');
const { describe, it } = require('node:test');
const { Linter } = require('eslint');

const plugin = require('../src');

describe('eslint-plugin-sort-by-length', () => {
  it('exposes 7 rules with docs and a schema', () => {
    const ruleNames = Object.keys(plugin.rules);
    assert.strictEqual(ruleNames.length, 7);
    ruleNames.forEach((name) => {
      assert.ok(plugin.rules[name].meta.docs.description, `${name} has a description`);
      assert.ok(plugin.rules[name].meta.schema, `${name} has a schema`);
    });
  });

  it('references only existing rules in every config', () => {
    ['recommended', 'all', 'flat/recommended', 'flat/all'].forEach((configName) => {
      Object.keys(plugin.configs[configName].rules).forEach((ruleId) => {
        assert.ok(plugin.rules[ruleId.replace('sort-by-length/', '')], `${ruleId} exists`);
      });
    });
  });

  it('enables every rule in the all config', () => {
    assert.strictEqual(
      Object.keys(plugin.configs['flat/all'].rules).length,
      Object.keys(plugin.rules).length,
    );
  });

  it('works with a flat config and fixes unsorted code', () => {
    const linter = new Linter({ configType: 'flat' });
    const config = [
      {
        ...plugin.configs['flat/recommended'],
        languageOptions: { parser: require('@typescript-eslint/parser') },
      },
    ];
    const result = linter.verifyAndFix(
      "import { useState } from 'react';\nimport { z } from 'zod';\n",
      config,
      { filename: 'a.js' },
    );
    assert.strictEqual(
      result.output,
      "import { z } from 'zod';\nimport { useState } from 'react';\n",
    );
  });
});
