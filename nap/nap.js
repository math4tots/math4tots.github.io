'strict mode';

function napEval(text, source) {
  source = source ? source : '<unknown>';
}

class napObject {
  constructor() {
    this.nap__init__.apply(this, arguments);
    console.log('napObject == constructor?: ' + (
      napObject === this.constructor));
  }
  nap__init__() {}
}

class napError extends napObject {
  constructor(message) {
    this.message = message;
  }
  toString() {
    return this.message;
  }
}

class napNumber extends napObject {
  constructor(value) {
    this.value = value;
  }
  napAdd(num) {
    if (!(num instanceof napNumber)) {
      throw new napError('Tried to add a number to non-number');
    }
  }
}
