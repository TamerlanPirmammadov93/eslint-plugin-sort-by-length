const EFFECT_TYPES = new Set([
  'CallExpression',
  'NewExpression',
  'AwaitExpression',
  'YieldExpression',
  'UpdateExpression',
  'AssignmentExpression',
  'ImportExpression',
  'TaggedTemplateExpression',
]);

const FUNCTION_TYPES = new Set([
  'FunctionExpression',
  'ArrowFunctionExpression',
  'FunctionDeclaration',
]);

function hasSideEffects(node, visitorKeys) {
  function visit(current) {
    if (!current || typeof current.type !== 'string') return false;
    if (EFFECT_TYPES.has(current.type)) return true;
    if (FUNCTION_TYPES.has(current.type)) return false;
    const keys = visitorKeys[current.type] || [];
    return keys.some((key) => {
      const child = current[key];
      return Array.isArray(child) ? child.some(visit) : visit(child);
    });
  }
  return visit(node);
}

module.exports = { hasSideEffects };
