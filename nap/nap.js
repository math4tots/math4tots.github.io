/* jshint esversion: 6 */
/*
NAP: Not actually Python.

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
let nap;
if (typeof module !== 'undefined' && module.exports) {
  nap = module.exports;
} else {
  nap = {};
}
(function(exports) {
  'use strict';

  //// lex
  class Source {
    constructor(text, uri) {
      this.text = text;
      this.uri = uri;
    }
  }
  exports.Source = Source;

  class Token {
    constructor(type, value, i, source) {
      this.type = type;
      this.value = value;
      this.i = i;
      this.source = source;
    }
  }
  exports.Token = Token;

  const KEYWORDS = [
      'False', 'class', 'finally', 'is', 'return',
      'None', 'continue', 'for', 'lambda', 'try',
      'True', 'def', 'from', 'nonlocal', 'while',
      'and', 'del', 'global', 'not', 'with',
      'as', 'elif', 'if', 'or', 'yield',
      'assert', 'else', 'import', 'pass',
      'break', 'except', 'in', 'raise',
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
      throw 'invalid escape: ' + ch(i);
    }
  }
  function lex(source) {
    // allow 'lex' to accept either a 'string' or a 'Source' object.
    if (typeof source === 'string') {
      source = new Source(source, '<unknown>');
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
        throw 'Tabs are not allowed in indentations';
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
              throw 'unterminated string literal';
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
        // IDENTIFIER/KEYWORDS
        if (isWord(ch(i))) {
          let j = i;
          while (isWord(ch(i))) {
            i++;
          }
          let word = s.substring(j, i);
          if (KEYWORDS.indexOf(word) !== -1) {
            tokens.push(new Token(word, null, j, source));
          } else {
            tokens.push(new Token('IDENTIFIER', word, j, source));
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
          tokens.push(new Token(symbol, null, i, source));
          i += symbol.length;
          continue;
        }
        // err
        throw 'unrecognized token: ' + s.substring(i, i+10);
      }
    }
    tokens.push(new Token('EOF', null, i, source));
    return tokens;
  }
  exports.lex = lex;

  //// parse
  class Parser {
    constructor(source) {
      this.source = source;
      this.tokens = lex(source);
    }
  }
  exports.Parser = Parser;

})(nap);
