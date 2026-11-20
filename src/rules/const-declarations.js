const { getSourceCode } = require('../lib/getSourceCode');
const { collapseText } = require('../lib/collapseText');
const { hasSideEffects } = require('../lib/hasSideEffects');
const { reportUnsortedItems } = require('../lib/sortItems');

const BLANK_LINE = /\r?\n[ \t]*\r?\n/;

function isSingleConst(statement) {
  return (
    statement.type === 'VariableDeclaration' &&
    statement.kind === 'const' &&
    statement.declarations.length === 1
  );
}

function collectDeclaredNames(pattern, names = new Set()) {
  if (!pattern) return names;
  if (pattern.type === 'Identifier') names.add(pattern.name);
  else if (pattern.type === 'AssignmentPattern') collectDeclaredNames(pattern.left, names);
  else if (pattern.type === 'RestElement') collectDeclaredNames(pattern.argument, names);
  else if (pattern.type === 'ArrayPattern') {
    pattern.elements.forEach((element) => collectDeclaredNames(element, names));
  } else if (pattern.type === 'ObjectPattern') {
    pattern.properties.forEach((property) =>
      collectDeclaredNames(property.type === 'Property' ? property.value : property, names),
    );
  }
  return names;
}

module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Sort consecutive single-statement const declarations by line length, keeping dependencies first',
    },
    schema: [
      {
        type: 'object',
        properties: {
          unsafeFix: { type: 'boolean' },
          isBlankLineBoundary: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unsortedConsts:
        'Consecutive const declarations must be sorted by length, shortest first (dependencies stay first).',
    },
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    const options = context.options[0] || {};
    const isUnsafeFix = Boolean(options.unsafeFix);
    const isBlankLineBoundary = options.isBlankLineBoundary !== false;

    function getLength(statement) {
      return collapseText(sourceCode.getText(statement)).length;
    }

    function getReferencedNames(statement) {
      return new Set(
        sourceCode
          .getTokens(statement)
          .filter((token) => token.type === 'Identifier')
          .map((token) => token.value),
      );
    }

    function sortRun(run) {
      const declaredNames = run.map((statement) =>
        collectDeclaredNames(statement.declarations[0].id),
      );
      const referencedNames = run.map(getReferencedNames);
      const dependencies = run.map((_statement, index) =>
        run
          .map((_other, otherIndex) => otherIndex)
          .filter(
            (otherIndex) =>
              otherIndex < index &&
              [...declaredNames[otherIndex]].some((name) => referencedNames[index].has(name)),
          ),
      );

      const placed = new Set();
      const ordered = [];
      while (ordered.length < run.length) {
        const candidates = run
          .map((_statement, index) => index)
          .filter(
            (index) =>
              !placed.has(index) && dependencies[index].every((dependency) => placed.has(dependency)),
          );
        const next = candidates.reduce((best, index) =>
          getLength(run[index]) < getLength(run[best]) ? index : best,
        );
        placed.add(next);
        ordered.push(run[next]);
      }
      return ordered;
    }

    function isRunFixable(run) {
      if (isUnsafeFix) return true;
      return !run.some((statement) =>
        hasSideEffects(statement.declarations[0].init, sourceCode.visitorKeys),
      );
    }

    function splitRuns(statements) {
      const runs = [];
      let currentRun = [];
      let previous = null;
      statements.forEach((statement) => {
        const isConnected =
          previous &&
          (!isBlankLineBoundary ||
            !BLANK_LINE.test(sourceCode.text.slice(previous.range[1], statement.range[0])));
        if (!isSingleConst(statement) || !isConnected) {
          if (currentRun.length > 1) runs.push(currentRun);
          currentRun = [];
        }
        if (isSingleConst(statement)) currentRun.push(statement);
        previous = statement;
      });
      if (currentRun.length > 1) runs.push(currentRun);
      return runs;
    }

    function check(node) {
      reportUnsortedItems({
        context,
        items: node.body,
        messageId: 'unsortedConsts',
        reportNode: node.body.find(isSingleConst) || node,
        options: { splitRuns, sortRun, isRunFixable },
      });
    }

    return {
      Program: check,
      BlockStatement: check,
      StaticBlock: check,
      TSModuleBlock: check,
    };
  },
};
