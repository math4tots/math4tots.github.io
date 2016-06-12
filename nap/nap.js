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
var Nap = {};
(function(exports) {
  'use strict';

  class Source {
    constructor(text, uri) {
      this.text = text;
      this.uri = uri;
    }
  }
  exports.Source = Source;

  class Token {
    constructor(type, value, source) {
      this.type = type;
      this.value = value;
      this.source = source;
    }
  }
  exports.Token = Token;

  var keywords = [
    'False', 'class', 'finally', 'is', 'return',
    'None', 'continue', 'for', 'lambda', 'try',
    'True', 'def', 'from', 'nonlocal', 'while',
    'and', 'del', 'global', 'not', 'with',
    'as', 'elif', 'if', 'or', 'yield',
    'assert', 'else', 'import', 'pass',
    'break', 'except', 'in', 'raise',
  ];
  var symbols = [];
  class Lexer {
    constructor(source) {
      this.i = 0;
      this.source = source;
    }
    extract() {

    }
  }
  exports.Lexer = Lexer;

  class Parser {
    constructor(lexer) {
      this.lexer = lexer;
    }
  }
  exports.Parser = Parser;

})(Nap);

console.log(Nap);
