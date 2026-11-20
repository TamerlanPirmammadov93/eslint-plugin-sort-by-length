function getSourceCode(context) {
  return context.sourceCode || context.getSourceCode();
}

function getFilename(context) {
  return context.filename || context.getFilename();
}

module.exports = { getSourceCode, getFilename };
