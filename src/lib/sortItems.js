const { collapseText } = require('./collapseText');
const { getSourceCode } = require('./getSourceCode');

function splitIntoRuns(items, isBoundary) {
  const runs = [];
  let currentRun = [];
  items.forEach((item) => {
    if (isBoundary(item)) {
      if (currentRun.length > 1) runs.push(currentRun);
      currentRun = [];
      return;
    }
    currentRun.push(item);
  });
  if (currentRun.length > 1) runs.push(currentRun);
  return runs;
}

function reportUnsortedItems({ context, items, messageId, reportNode, options = {} }) {
  const sourceCode = getSourceCode(context);
  const {
    isBoundary = () => false,
    getRange = (item) => item.range,
    getLength = (item) => collapseText(sourceCode.getText(item)).length,
    isRunFixable = () => true,
    sortRun = (run) => [...run].sort((a, b) => getLength(a) - getLength(b)),
    splitRuns = (list) => splitIntoRuns(list, isBoundary),
  } = options;

  const allComments = sourceCode.getAllComments();

  function hasCommentsInside(run) {
    const start = getRange(run[0])[0];
    const end = getRange(run[run.length - 1])[1];
    return allComments.some((comment) => comment.range[0] >= start && comment.range[1] <= end);
  }

  let isUnsorted = false;
  const fixableSwaps = [];

  splitRuns(items).forEach((run) => {
    const sortedRun = sortRun(run);
    const swaps = [];
    run.forEach((item, index) => {
      if (item !== sortedRun[index]) swaps.push({ item, replacement: sortedRun[index] });
    });
    if (!swaps.length) return;
    isUnsorted = true;
    if (!hasCommentsInside(run) && isRunFixable(run)) fixableSwaps.push(...swaps);
  });

  if (!isUnsorted) return;

  context.report({
    node: reportNode,
    messageId,
    fix: fixableSwaps.length
      ? (fixer) =>
          fixableSwaps.map(({ item, replacement }) => {
            const [replacementStart, replacementEnd] = getRange(replacement);
            return fixer.replaceTextRange(
              getRange(item),
              sourceCode.text.slice(replacementStart, replacementEnd),
            );
          })
      : null,
  });
}

module.exports = { reportUnsortedItems, splitIntoRuns };
