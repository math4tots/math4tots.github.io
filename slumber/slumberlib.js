/* jshint esversion: 6 */
/*
NAP: Not Actually Python.

Nap is a programming language that is largely meant to resemble Python.

However, there are some features of Python I wish to exclude due to
how much they make transpiling and static analysis more difficult:

  * Arbitrary monkey patching
    I do want to support some level of monkey patching, but with some
    restriction on when they can be performed.

  * Arbitrary decorators
    Again, I want to restrict decorators in when they are allowed.

  * Metaclasses
    I am still thinking about what I want to replace these with.
    Possibly a subclass hook -- a classmethod that gets called whenever
    a new subclass is declared.

Also, there is kind of a difference in the execution model.

Instead of just as a plain interpreter, the execution of code will be
divided into the 'preprocess stage' and the 'main stage'. The preprocess
stage has the full dynamic power of what you might typically expect of
Python. But once the 'main stage' begins (i.e. __name__ == '__main__'),
many operations will be restricted (e.g. monkey patching no longer allowed).

*/
let slumber;
if (typeof module !== 'undefined' && module.exports) {
  slumber = module.exports;
} else {
  slumber = {};
}
(function(exports) {
  'use strict';

  //// lex
  // Not all features supported by CPython are supported here (e.g.
  // CPython lets you use tabs for indentation, but this lexer forbids it).
  class Source {
    constructor(text, uri) {
      this.text = text;
      this.uri = uri;
    }
  }
  exports.Source = Source;

  function stringToSource(string) {
    return new Source(string, '<unknown>');
  }

  class Token {
    constructor(type, value, cursor, source) {
      this.type = type;
      this.value = value;
      this.cursor = cursor;
      this.source = source;
    }
    toLocationMessage() {
      return 'File "' + this.source.uri + '", line ' +
          this.getLineNumber();
    }
    getLineNumber() {
      let lineno = 1;
      let text = this.source.text;
      for (let i = 0; i < this.cursor; i++) {
        if (text[i] === '\n') {
          lineno++;
        }
      }
      return lineno;
    }
    inspect() {
      return 'Token(' + this.type + ', ' +
          this.value + ', ' + this.cursor + ')';
    }
  }
  exports.Token = Token;

  class SyntaxError extends Error {
    constructor(token, message) {
      super(token.toLocationMessage() + ': ' + message);
    }
  }

  const KEYWORDS = [
      'False', 'class', 'finally', 'is', 'return',
      'None', 'continue', 'for', 'lambda', 'try',
      'True', 'def', 'from', 'nonlocal', 'while',
      'and', 'del', 'global', 'not', 'with',
      'as', 'elif', 'if', 'or', 'yield',
      'assert', 'else', 'import', 'pass',
      'break', 'except', 'in', 'raise',
      // my keywords
      'async', 'await',
  ];
  const SYMBOLS = [
      // operators
      '+', '-', '*', '**', '/', '//', '%', '@',
      '<<', '>>', '&', '|', '^', '~',
      '<', '>', '<=', '>=', '==', '!=',
      // delimiters
      '(', ')', '[', ']', '{', '}',
      ',', ':', '.', ';', '@', '=', '->',
      '+=', '-=', '*=', '/=', '//=', '%=', '@=',
      '&=', '|=', '^=', '>>=', '<<=', '**=',
      // -- ellipsis -- special token.
      '...',
  ];
  function isSpace(c) {
    switch (c) {
    case ' ':case '\t':
    case '\n':case '\r':case '\f':
      return true;
    }
    return false;
  }
  function isDigit(c) {
    switch (c) {
    case '0':case '1':case '2':case '3':case '4':
    case '5':case '6':case '7':case '8':case '9':
      return true;
    }
  }
  function isAlpha(c) {
    switch (c.toLowerCase()) {
    case 'a':case 'b':case 'c':case 'd':case 'e':case 'f':case 'g':
    case 'h':case 'i':case 'j':case 'k':case 'l':case 'm':case 'n':
    case 'o':case 'p':case 'q':case 'r':case 's':case 't':case 'u':
    case 'v':case 'w':case 'x':case 'y':case 'z':
      return true;
    }
    return false;
  }
  function isAlnum(c) {
    return isDigit(c) || isAlpha(c);
  }
  function isWord(c) {
    return c === '_' || isAlnum(c);
  }
  function escape(c) {
    switch (ch(i)) {
    case 'n':
      return '\n';
    case 't':
      return '\t';
    case '\\':
      return '\\';
    case '"':
      return '"';
    case "'":
      return "'";
    default:
      throw new SyntaxError(
          new Token('ERR', null, i, source),
          'invalid escape: ' + ch(i));
    }
  }
  function lex(source) {
    // allow 'lex' to accept either a 'string' or a 'Source' object.
    if (typeof source === 'string') {
      source = stringToSource(source);
    }

    // state and helper functions
    let s = source.text;
    let i = 0;
    let indentStack = [0];
    let parenDepth = 0;
    function ch(k) {
      return k < s.length ? s[k] : '';
    }
    function startsWith(k, prefixes) {
      if (typeof prefixes === 'string') {
        prefixes = [prefixes];
      }
      for (let prefix of prefixes) {
        if (s.startsWith(prefix, k)) {
          return true;
        }
      }
      return false;
    }
    function skipEmptyLine() {
      if (i >= s.length) {
        return false;
      }
      let j = i;
      while (j < s.length && ch(j) !== '\n') {
        if (ch(j) === '#') {
          // if we hit a comment symbol, we skip the rest of the line.
          while (j < s.length && ch(j) !== '\n') {
            j++;
          }
        } else if (isSpace(ch(j))) {
          // if we find a whitespace character, we check the next character
          // on the line to see if we can skip the rest of the line.
          j++;
        } else {
          // if we hit any other non-whitespace character, we can't skip
          // this line, do nothing and return false to indicate that
          // nothing was skipped.
          return false;
        }
      }
      if (j < s.length && ch(j) === '\n') {
        j++;
      }
      i = j;
      return true;
    }
    function skipEmptyLines() {
      while (skipEmptyLine());
    }
    function skipComment() {
      if (ch(i) === '#') {
        while (i < s.length && ch(i) !== '\n') {
          i++;
        }
      }
    }
    function skipSpaces() {
      while (true) {
        if (ch(i) === '\\' && ch(i+1) === '\n')  {
          i += 2;
        } else if (ch(i) === '#') {
          skipComment();
        } else if (isSpace(ch(i)) && (ch(i) !== '\n' || parenDepth > 0)) {
          i++;
        } else {
          break;
        }
      }
    }
    function processIndentation() {
      let j = i;
      while (ch(j) === ' ') {
        j++;
      }
      if (ch(j) === '\t') {
        throw new SyntaxError(
            new Token('ERR', null, i, source),
            'Tabs are not allowed in indentations');
      }
      let depth = j - i;
      let last = indentStack[indentStack.length - 1];
      if (last < depth) {
        indentStack.push(depth);
        tokens.push(new Token('INDENT', null, i, source));
      } else if (last > depth) {
        while (indentStack[indentStack.length - 1] > depth) {
          indentStack.pop();
          tokens.push(new Token('DEDENT', null, i, source));
        }
      }
    }

    // tokenizing logic.
    let tokens = [];
    while (true) {
      skipEmptyLines();
      processIndentation();
      if (i >= s.length) {
        break;
      }
      while (true) {
        skipSpaces();
        // NEWLINE
        if (i >= s.length || ch(i) === '\n') {
          tokens.push(new Token('NEWLINE', null, i, source));
          break;
        }
        // STRING
        if (startsWith(i, ['"', "'", 'r"""', "r'''"])) {
          let j = i;
          let raw = false;
          if (ch(i) === 'r') {
            i++;
            raw = true;
          }
          let result = '';
          let quote;
          if (startsWith(i, ['"""', "'''"])) {
            quote = s.substring(i, i+3);
            i += 3;
          } else {
            quote = ch(i);
            i++;
          }
          while (!startsWith(i, quote)) {
            if (i >= s.length) {
              throw new SyntaxError(
                new Token('ERR', null, j, source),
                'unterminated string literal');
            }
            if (!raw && ch(i) === '\\') {
              i++;
              result += escape(ch(i));
              i++;
            } else {
              result += ch(i);
              i++;
            }
          }
          i += quote.length;
          tokens.push(new Token('STRING', result, j, source));
          continue;
        }
        // INT/FLOAT
        if (isDigit(ch(i)) || ch(i) === '.' && isDigit(ch(i+1))) {
          let j = i;
          while (isDigit(ch(i))) {
            i++;
          }
          if (ch(i) === '.') {
            i++;
            while (isDigit(ch(i))) {
              i++;
            }
            tokens.push(new Token('FLOAT', s.substring(j, i), j, source));
          } else {
            tokens.push(new Token('INT', s.substring(j, i), j, source));
          }
          continue;
        }
        // NAME/KEYWORDS
        if (isWord(ch(i))) {
          let j = i;
          while (isWord(ch(i))) {
            i++;
          }
          let word = s.substring(j, i);
          if (KEYWORDS.indexOf(word) !== -1) {
            tokens.push(new Token(word, null, j, source));
          } else {
            tokens.push(new Token('NAME', word, j, source));
          }
          continue;
        }
        // SYMBOLS
        let symbol = '';
        for (let sym of SYMBOLS) {
          if (startsWith(i, sym) && sym.length > symbol.length) {
            symbol = sym;
          }
        }
        if (symbol !== '') {
          switch (symbol) {
          case '(':
          case '[':
          case '{':
            parenDepth++;
            break;
          case ')':
          case ']':
          case '}':
            parenDepth--;
            break;
          }
          tokens.push(new Token(symbol, null, i, source));
          i += symbol.length;
          continue;
        }
        // err
        throw new SyntaxError(
          new Token('ERR', null, i, source),
          'unrecognized token: ' + s.substring(i, i+10));
      }
    }
    tokens.push(new Token('EOF', null, i, source));
    return tokens;
  }
  exports.lex = lex;

  //// Parser
  // A simple predictive parser.
  const AUGASSIGNS = [
    '+=', '-=', '*=', '@=', '/=', '%=', '&=', '|=', '^=',
    '<<=', '>>=', '**=', '//='
  ];
  class Parser {
    constructor(source) {
      this.source = source;
      this.tokens = lex(source);
      this.cursor = 0;
    }
    peek() {
      return this.tokens[this.cursor];
    }
    gettok() {
      let token = this.peek();
      this.cursor++;
      return token;
    }
    at(type) {
      return type === this.peek().type;
    }
    consume(type) {
      if (this.at(type)) {
        return this.gettok();
      }
      return false;
    }
    expect(type) {
      if (!this.at(type)) {
        throw new SyntaxError(
            this.peek(),
            'expected ' + type + ' but found ' + this.peek().type);
      }
      return this.gettok();
    }
    // rules
    parseFileInput() {
      let token = this.peek();
      let stmts = [];
      while (this.consume('NEWLINE'));
      while (!this.at('EOF')) {
        stmts.push(this.parseStatement());
        while (this.consume('NEWLINE'));
      }
      return new FileInput(token, stmts);
    }
    parseStatement() {
      let token = this.peek();
      // expression statement
      let stmt = new ExpressionStatement(token, this.parseExpression());
      this.expect('NEWLINE');
      return stmt;
    }
    parseExpression() {
      return this.parsePostfixExpression();
    }
    parsePostfixExpression() {
      let e = this.parsePrimaryExpression();
      while (true) {
        let token = this.peek();
        if (this.consume('(')) {
          let [args, vararg] = this.parseExpressionList();
          this.expect(')');
          e = new FunctionCall(token, e, args, vararg);
          continue;
        }
        break;
      }
      return e;
    }
    parseExpressionList() {
      let args = [];
      let vararg = null;
      while (true) {
        args.push(this.parseExpression());
        if (!this.consume(',')) {
          break;
        }
      }
      return [args, vararg];
    }
    parsePrimaryExpression() {
      let token = this.peek();
      if (this.at('NAME')) {
        let t = this.expect('NAME');
        return new Name(token, t.value);
      }
      if (this.at('INT') || this.at('FLOAT')) {
        let value = new SlmNumber(parseFloat(this.gettok().value));
        return new Literal(token, value);
      }
      throw new SyntaxError(
          token,
          'expected expression but found ' + token.type);
    }
  }
  exports.Parser = Parser;

  function parse(source) {
    return new Parser(source).parseFileInput();
  }
  exports.parse = parse;

  //// Ast
  let OK = 0;
  let RETURN = 1;
  let CONTINUE = 2;
  let BREAK = 3;
  class Ast {
    constructor(token) {
      this.token = token;
    }
  }
  class FileInput extends Ast {
    constructor(token, stmts) {
      super(token);
      this.block = new Block(token, stmts);
    }
    run(scope) {
      return this.block.run(scope);
    }
  }
  class Statement extends Ast {}
  class Block extends Statement {
    constructor(token, stmts) {
      super(token);
      this.stmts = stmts;
    }
    run(scope) {
      for (let stmt of this.stmts) {
        let [state, value] = stmt.run(scope);
        if (state !== OK) {
          return [state, value];
        }
      }
      return [null, slmnil];
    }
  }
  class ExpressionStatement extends Statement {
    constructor(token, expr) {
      super(token);
      this.expr = expr;
    }
    run(scope) {
      this.expr.eval(scope);
      return [OK, slmnil];
    }
  }
  class Expression extends Ast {}
  class Literal extends Expression {
    constructor(token, value) {
      super(token);
      this.value = value;
    }
    eval(scope) {
      return this.value;
    }
  }
  class Name extends Expression {
    constructor(token, name) {
      super(token);
      this.name = name;
      this.key = 'slm' + name;
    }
    eval(scope) {
      let result = scope[this.key];
      if (result === undefined) {
        slmThrow('undefined variable: ' + this.name, this.token);
      }
      return result;
    }
  }
  class FunctionCall extends Expression {
    constructor(token, f, args, vararg) {
      super(token);
      this.f = f;
      this.args = args;
      this.vararg = vararg;
    }
    eval(scope) {
      let args = this.args.map(arg => arg.eval(scope));
      if (this.vararg) {
        slmThrow('vararg not yet implemented', this.token);
      }
      let f = this.f.eval(scope);
      try {
        return callm(f, 'slm__call', args, this.token);
      } catch (e) {
        if (e instanceof SlmError) {
          e.trace.push(this.token);
        }
        throw e;
      }
    }
  }

  //// Data model
  let objcnt = 0;
  class SlmObject {
    constructor() {
      this.oid = objcnt++;
    }
    slm__str(args) {
      checkargs(args, 0);
      return this.slm__repr();
    }
    slm__repr(args) {
      checkargs(args, 0);
      return '<object ' + this.oid + '>';
    }
  }
  class SlmClass extends SlmObject {
    constructor(name, value) {
      super();
      this.name = name;
      this.value = value;
    }
    slm__call(args) {
      return new this.value(args);
    }
  }
  class SlmNil extends SlmObject {
    slm__repr(args) {
      checkargs(args, 0);
      return 'nil';
    }
    truthy() {
      return false;
    }
  }
  let slmnil = exports.slmnil = new SlmNil();
  class SlmBool extends SlmObject {
    constructor(value) {
      super();
      this.value = value;
    }
    slm__repr(args) {
      checkargs(args, 0);
      return this.value ? 'true' : 'false';
    }
    truthy() {
      return this.value;
    }
  }
  class SlmNumber extends SlmObject {
    constructor(value) {
      super();
      this.value = value;
    }
    truthy() {
      return this.value !== 0;
    }
    slm__repr() {
      return this.value.toString();
    }
  }
  class SlmString extends SlmObject {
    constructor(value) {
      super();
      this.value = value;
    }
    truthy() {
      return this.value.length !== 0;
    }
  }
  exports.SlmString = SlmString;
  class SlmList extends SlmObject {
    constructor(value) {
      super();
      this.value = value;
    }
    truthy() {
      return this.value.length !== 0;
    }
  }
  exports.SlmList = SlmList;
  class SlmFunction extends SlmObject {
    constructor(name, value) {
      super();
      this.name = name;
      this.value = value;
    }
    slm__call(args) {
      return this.value(args);
    }
    slm__repr() {
      return '<function ' + this.name + '>';
    }
    truthy() {
      return true;
    }
  }
  exports.SlmFunction = SlmFunction;
  class SlmError extends SlmObject {
    constructor(message, exception) {
      super();
      this.message = message;
      this.exception = exception ? exception : new Error(message);
      this.trace = [];
    }
    truthy() {
      return true;
    }
    toTraceMessage() {
      return this.trace.map(token => token.toLocationMessage()).join('\n');
    }
    toString() {
      return this.message + '\n' + this.toTraceMessage();
    }
  }
  function slmThrow(message, token) {
    let e = new SlmError(message);
    if (token) {
      e.trace.push(token);
    }
    throw e;
  }
  function callm(owner, methodName, args, token) {
    if (owner[methodName] === undefined) {
      slmThrow('No such method ' + methodName, token);
    }
    return owner[methodName](args);
  }
  function checkargs(args, expected) {
    if (args.length !== expected) {
      slmThrow('expected ' + expected + ' args but got ' + args.length);
    }
  }
  function checkargsrange(args, min, max) {
    if (args.length < min || args.length > max) {
      slmThrow('expected ' + min + ' to ' + max + ' args but got ' +
               args.length);
    }
  }
  function checkargsmin(args, min) {
    if (args.length < min) {
      slmThrow('expected at least ' + min + ' args but got ' + args.length);
    }
  }

  let globalScope = {
    slmnil: slmnil,
    slmObject: new SlmClass('Object', SlmObject),
    slmprint: new SlmFunction('print', function(args) {
      checkargs(args, 1);
      console.log(callm(args[0], 'slm__str', []));
    }),
  };
  exports.globalScope = globalScope;

})(slumber);
