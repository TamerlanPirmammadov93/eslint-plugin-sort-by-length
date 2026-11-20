const pkg = require('../package.json');

const rules = {
  'jsx-props': require('./rules/jsx-props'),
  'imports': require('./rules/imports'),
  'object-keys': require('./rules/object-keys'),
  'enum-members': require('./rules/enum-members'),
  'destructuring': require('./rules/destructuring'),
  'interface-fields': require('./rules/interface-fields'),
  'const-declarations': require('./rules/const-declarations'),
};

const RECOMMENDED_RULE_NAMES = [
  'jsx-props',
  'imports',
  'enum-members',
  'interface-fields',
];

function buildRules(ruleNames) {
  return Object.fromEntries(ruleNames.map((name) => [`sort-by-length/${name}`, 'warn']));
}

const recommendedRules = buildRules(RECOMMENDED_RULE_NAMES);
const allRules = buildRules(Object.keys(rules));

const plugin = {
  meta: { name: pkg.name, version: pkg.version },
  rules,
  configs: {},
};

plugin.configs = {
  recommended: { plugins: ['sort-by-length'], rules: recommendedRules },
  all: { plugins: ['sort-by-length'], rules: allRules },
  'flat/recommended': { plugins: { 'sort-by-length': plugin }, rules: recommendedRules },
  'flat/all': { plugins: { 'sort-by-length': plugin }, rules: allRules },
};

module.exports = plugin;
