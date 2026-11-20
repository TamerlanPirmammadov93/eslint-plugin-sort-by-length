const { getSourceCode } = require('../lib/getSourceCode');

const DEFAULT_GROUPS = ['external', ['^[~@]/'], 'relative'];

function createKindResolver(groups) {
  const compiledGroups = groups.map((group) =>
    typeof group === 'string' ? group : group.map((pattern) => new RegExp(pattern)),
  );
  const externalIndex = Math.max(compiledGroups.indexOf('external'), 0);

  return (source) => {
    const index = compiledGroups.findIndex((group) => {
      if (group === 'external') return false;
      if (group === 'relative') return source.startsWith('.');
      return group.some((regex) => regex.test(source));
    });
    return index === -1 ? externalIndex : index;
  };
}

function getLeadingImports(program) {
  const imports = [];
  for (const statement of program.body) {
    if (statement.type !== 'ImportDeclaration') break;
    imports.push(statement);
  }
  return imports;
}

function hasUnsupportedShape(node) {
  const hasAttributes = Boolean(node.attributes && node.attributes.length);
  return node.specifiers.length === 0 || hasAttributes;
}

module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Group imports and sort each group by statement length, shortest first',
    },
    schema: [
      {
        type: 'object',
        properties: {
          groups: {
            type: 'array',
            items: {
              oneOf: [
                { enum: ['external', 'relative'] },
                { type: 'array', items: { type: 'string' } },
              ],
            },
          },
          lastPatterns: { type: 'array', items: { type: 'string' } },
          separateTypeImports: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unsortedImports: 'Imports must be grouped and sorted by statement length, shortest first.',
    },
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    const options = context.options[0] || {};
    const groups = options.groups || DEFAULT_GROUPS;
    const lastRegexes = (options.lastPatterns || []).map((pattern) => new RegExp(pattern));
    const isTypeSeparated = options.separateTypeImports !== false;
    const getKind = createKindResolver(groups);
    const groupCount = groups.length;

    function getBucket(node) {
      const source = node.source.value;
      const kind = getKind(source);
      if (node.importKind === 'type') return isTypeSeparated ? groupCount + kind : kind;
      if (lastRegexes.some((regex) => regex.test(source))) {
        return isTypeSeparated ? groupCount * 2 : groupCount;
      }
      return kind;
    }

    function getNamedTexts(node) {
      return node.specifiers
        .filter((specifier) => specifier.type === 'ImportSpecifier')
        .map((specifier) => sourceCode.getText(specifier));
    }

    function buildCanonicalText(node, namedTexts) {
      const parts = [];
      node.specifiers.forEach((specifier) => {
        if (specifier.type !== 'ImportSpecifier') parts.push(sourceCode.getText(specifier));
      });
      if (namedTexts.length) parts.push(`{ ${namedTexts.join(', ')} }`);
      const typeKeyword = node.importKind === 'type' ? 'type ' : '';
      return `import ${typeKeyword}${parts.join(', ')} from ${sourceCode.getText(node.source)};`;
    }

    function buildEntry(node) {
      const namedTexts = getNamedTexts(node);
      const sortedNamedTexts = [...namedTexts].sort((a, b) => a.length - b.length);
      const isSpecifierOrderChanged = sortedNamedTexts.some(
        (text, index) => text !== namedTexts[index],
      );
      const canonicalText = buildCanonicalText(node, sortedNamedTexts);
      return {
        bucket: getBucket(node),
        length: canonicalText.length,
        text: isSpecifierOrderChanged ? canonicalText : sourceCode.getText(node),
      };
    }

    return {
      Program(program) {
        const imports = getLeadingImports(program);
        if (!imports.length) return;
        if (imports.some(hasUnsupportedShape)) return;

        const entries = imports.map(buildEntry);
        entries.sort((a, b) => a.bucket - b.bucket || a.length - b.length);

        const eol = sourceCode.text.includes('\r\n') ? '\r\n' : '\n';
        const sortedText = entries
          .map((entry, index) => {
            if (index === 0) return entry.text;
            const separator = entry.bucket === entries[index - 1].bucket ? eol : eol + eol;
            return separator + entry.text;
          })
          .join('');

        const rangeStart = imports[0].range[0];
        const rangeEnd = imports[imports.length - 1].range[1];
        if (sourceCode.text.slice(rangeStart, rangeEnd) === sortedText) return;

        const hasComments = sourceCode
          .getAllComments()
          .some((comment) => comment.range[0] >= rangeStart && comment.range[1] <= rangeEnd);

        context.report({
          node: imports[0],
          messageId: 'unsortedImports',
          fix: hasComments
            ? null
            : (fixer) => fixer.replaceTextRange([rangeStart, rangeEnd], sortedText),
        });
      },
    };
  },
};
