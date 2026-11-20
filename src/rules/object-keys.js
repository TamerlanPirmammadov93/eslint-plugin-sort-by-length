const { getSourceCode } = require('../lib/getSourceCode');
const { hasSideEffects } = require('../lib/hasSideEffects');
const { reportUnsortedItems } = require('../lib/sortItems');

function isBoundary(property) {
  return property.type === 'SpreadElement' || property.computed === true;
}

module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Sort object literal properties by the total length of each property, shortest first',
    },
    schema: [
      {
        type: 'object',
        properties: { unsafeFix: { type: 'boolean' } },
        additionalProperties: false,
      },
    ],
    messages: {
      unsortedKeys: 'Object properties must be sorted by total length, shortest first.',
    },
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    const isUnsafeFix = Boolean((context.options[0] || {}).unsafeFix);

    function isRunFixable(run) {
      if (isUnsafeFix) return true;
      return !run.some((property) => hasSideEffects(property, sourceCode.visitorKeys));
    }

    return {
      ObjectExpression(node) {
        if (node.properties.length < 2) return;
        reportUnsortedItems({
          context,
          items: node.properties,
          messageId: 'unsortedKeys',
          reportNode: node,
          options: { isBoundary, isRunFixable },
        });
      },
    };
  },
};
