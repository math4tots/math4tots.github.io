# slumber

Slumber programming language.

I was considering implementing a substantial subset of Python (i.e. NAP),
but then I realized that that might be a lot more work than I'd need to
do to get the minimum viable system I want.

Some aspects of NAP that made me want to start Slumber:

  * Python's number system (arbitrarily large Int).
    * While useful at times, it is kind of a hassle to implement Python's
      number system on other platforms, e.g. javascript, where they
      aren't available natively.
  * Grammar is a bit messy.
    Granted, for a mature programming language, Python's is surprisingly
    clean and simple. But there is still a decent about of baggage.
