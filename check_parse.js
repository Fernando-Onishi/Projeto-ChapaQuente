const fs = require('fs');
const parser = require('@babel/parser');
const content = fs.readFileSync('TelaDescricao/TelaDescricao.js', 'utf8');
try {
  parser.parse(content, { sourceType: 'module', plugins: ['jsx'] });
  console.log('Parsed OK');
} catch (err) {
  console.error('PARSE_ERROR', err.message);
  console.error('LOC', err.loc);
  console.error('CODEFRAME:\n', err.codeFrame);
  process.exit(1);
}
