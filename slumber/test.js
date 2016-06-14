/* jshint esversion: 6 */
const slumber = require('./slumber');
const util = require('util');

function assert(cond, message) {
  if (!cond) {
    throw new Error('assertion failed' + (message ? ': ' + message : ''));
  }
}

// simple lexer test.
{
  let tokens = slumber.lex("'hello world'");
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
  let tokens = slumber.lex(`
while True:
  'hello\n world' 5 4.4 x.y # hoi
# fun`);
  assert(tokens.length === 14, 'tokens.length === ' + tokens.length);
  let types = tokens.map(token => token.type);
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

// Lexer test for ignoring NEWLINE/INDENT/DEDENT when inside parenthesis.
{
  let tokens = slumber.lex(`
(
    )
`);
  assert(tokens.length === 4, 'tokens.length === ' + tokens.length);
  assert(tokens[0].type === '(', tokens[0].type);
  assert(tokens[1].type === ')', tokens[1].type);
  assert(tokens[2].type === 'NEWLINE', tokens[2].type);
  assert(tokens[3].type === 'EOF', tokens[3].type);
}

// trivial parser test.
{
  let ast = slumber.parse(`
`);
}

// simple parser test.
{
  let ast = slumber.parse(`
print(nil)
print(print)
`);
  ast.run(slumber.globalScope);
}

console.log('slumber tests pass!');
