function collapseText(text) {
  return text
    .replace(/,(?=\s*\n\s*[}\])])/g, '')
    .replace(/([[(])\s*\n\s*/g, '$1')
    .replace(/\s*\n\s*([\])])/g, '$1')
    .replace(/\s*\n\s*/g, ' ');
}

module.exports = { collapseText };
