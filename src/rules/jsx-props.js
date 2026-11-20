const { reportUnsortedItems } = require('../lib/sortItems');

module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Sort JSX props by the total length of each prop, shortest first',
    },
    schema: [],
    messages: {
      unsortedProps: 'JSX props must be sorted by total length, shortest first.',
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.attributes.length < 2) return;
        reportUnsortedItems({
          context,
          items: node.attributes,
          messageId: 'unsortedProps',
          reportNode: node.name,
          options: { isBoundary: (attribute) => attribute.type === 'JSXSpreadAttribute' },
        });
      },
    };
  },
};
