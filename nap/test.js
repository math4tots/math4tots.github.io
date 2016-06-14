/* jshint esversion: 6 */
const nap = require('./nap');
const util = require('util');

function assert(cond, message) {
  if (!cond) {
    throw new Error('assertion failed' + (message ? ': ' + message : ''));
  }
}

// simple lexer test.
{
  let tokens = nap.lex("'hello world'");
  assert(tokens.length === 3, 'tokens.length === ' + tokens.length);
  assert(tokens[0].type === 'STRING', tokens[0].type);
  assert(tokens[0].value === 'hello world');
  assert(tokens[1].type === 'NEWLINE', tokens[1].type);
  assert(tokens[2].type === 'EOF', tokens[2].type);
  assert(
      tokens[0].toLocationMessage() === 'File "<unknown>", line 1',
      tokens[0].toLocationMessage());
}

// lexer test with every category of token at least once.
{
  let tokens = nap.lex(`
while True:
  'hello\n world' 5 4.4 x.y # hoi
# fun`);
  assert(tokens.length === 14, 'tokens.length === ' + tokens.length);
  let types = tokens.map((token) => token.type);
  let strtypes = types[0];
  for (let t of types.slice(1)) {
    strtypes += '/' + t;
  }
  assert(
      strtypes ===
          'while/True/:/NEWLINE/INDENT/STRING/INT/FLOAT/NAME/' +
          './NAME/NEWLINE/DEDENT/EOF',
      strtypes);
}

// simple parser test.
{
  let ast = nap.parse(`
`);
  console.log(ast);
}

console.log('nap tests pass!');
