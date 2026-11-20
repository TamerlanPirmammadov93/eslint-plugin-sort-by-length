const { getSourceCode } = require('../lib/getSourceCode');
const { hasSideEffects } = require('../lib/hasSideEffects');
const { reportUnsortedItems } = require('../lib/sortItems');

function collectBoundNames(pattern, names = new Set()) {
  if (!pattern) return names;
  if (pattern.type === 'Identifier') names.add(pattern.name);
  else if (pattern.type === 'AssignmentPattern') collectBoundNames(pattern.left, names);
  else if (pattern.type === 'RestElement') collectBoundNames(pattern.argument, names);
  else if (pattern.type === 'ArrayPattern') {
    pattern.elements.forEach((element) => collectBoundNames(element, names));
  } else if (pattern.type === 'ObjectPattern') {
    pattern.properties.forEach((property) =>
      collectBoundNames(property.type === 'Property' ? property.value : property, names),
    );
  }
  return names;
}

function isBoundary(property) {
  return property.type === 'RestElement' || property.computed === true;
}

module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Sort object destructuring by the total length of each entry, shortest first',
    },
    schema: [
      {
        type: 'object',
        properties: { unsafeFix: { type: 'boolean' } },
        additionalProperties: false,
      },
    ],
    messages: {
      unsortedDestructuring: 'Destructured entries must be sorted by total length, shortest first.',
    },
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    const isUnsafeFix = Boolean((context.options[0] || {}).unsafeFix);

    function getDefaultExpressions(property) {
      return property.type === 'Property' && property.value.type === 'AssignmentPattern'
        ? [property.value.right]
        : [];
    }

    function isRunFixable({ run, boundNames }) {
      const defaults = run.flatMap(getDefaultExpressions);
      const isDependent = defaults.some((expression) =>
        sourceCode
          .getTokens(expression)
          .some((token) => token.type === 'Identifier' && boundNames.has(token.value)),
      );
      if (isDependent) return false;
      if (isUnsafeFix) return true;
      return !defaults.some((expression) => hasSideEffects(expression, sourceCode.visitorKeys));
    }

    return {
      ObjectPattern(node) {
        if (node.properties.length < 2) return;
        const boundNames = collectBoundNames(node);
        reportUnsortedItems({
          context,
          items: node.properties,
          messageId: 'unsortedDestructuring',
          reportNode: node,
          options: { isBoundary, isRunFixable: (run) => isRunFixable({ run, boundNames }) },
        });
      },
    };
  },
};
