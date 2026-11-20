const { getSourceCode } = require('../lib/getSourceCode');
const { reportUnsortedItems } = require('../lib/sortItems');

function isLiteralInitializer(node) {
  if (!node) return false;
  if (node.type === 'Literal') return true;
  if (node.type === 'TemplateLiteral') return node.expressions.length === 0;
  return node.type === 'UnaryExpression' && node.argument.type === 'Literal';
}

module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Sort enum members by member name length, shortest first',
    },
    schema: [],
    messages: {
      unsortedMembers: 'Enum members must be sorted by name length, shortest first.',
    },
  },
  create(context) {
    const sourceCode = getSourceCode(context);

    return {
      TSEnumDeclaration(node) {
        const members = (node.body && node.body.members) || node.members;
        if (!members || members.length < 2) return;
        if (!members.every((member) => isLiteralInitializer(member.initializer))) return;

        reportUnsortedItems({
          context,
          items: members,
          messageId: 'unsortedMembers',
          reportNode: node.id,
          options: { getLength: (member) => sourceCode.getText(member.id).length },
        });
      },
    };
  },
};
