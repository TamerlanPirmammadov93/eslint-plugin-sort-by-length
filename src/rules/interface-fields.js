const { getSourceCode } = require('../lib/getSourceCode');
const { collapseText } = require('../lib/collapseText');
const { reportUnsortedItems } = require('../lib/sortItems');

const SEPARATOR = /[;,]$/;
const OVERLOADABLE_TYPES = new Set([
  'TSMethodSignature',
  'TSCallSignatureDeclaration',
  'TSConstructSignatureDeclaration',
]);

module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Sort interface and type literal members by the total length of each member, shortest first',
    },
    schema: [],
    messages: {
      unsortedFields: 'Interface fields must be sorted by total length, shortest first.',
    },
  },
  create(context) {
    const sourceCode = getSourceCode(context);

    function getRange(member) {
      const text = sourceCode.getText(member);
      return [member.range[0], member.range[1] - (SEPARATOR.test(text) ? 1 : 0)];
    }

    function getLength(member) {
      const [start, end] = getRange(member);
      return collapseText(sourceCode.text.slice(start, end)).length;
    }

    function hasOverloads(members) {
      const overloadable = members.filter((member) => OVERLOADABLE_TYPES.has(member.type));
      const keys = overloadable.map((member) =>
        member.key ? sourceCode.getText(member.key) : member.type,
      );
      return new Set(keys).size !== keys.length;
    }

    function check(members, reportNode) {
      if (members.length < 2) return;
      reportUnsortedItems({
        context,
        items: members,
        messageId: 'unsortedFields',
        reportNode,
        options: { getRange, getLength, isRunFixable: () => !hasOverloads(members) },
      });
    }

    return {
      TSInterfaceBody(node) {
        check(node.body, node.parent.id || node);
      },
      TSTypeLiteral(node) {
        check(node.members, node);
      },
    };
  },
};
