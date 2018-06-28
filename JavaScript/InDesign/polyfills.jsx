String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '').replace(/ {2,}/g, ' ');
};

Array.prototype.contains = function (item) {
    if (this == null)
        throw new TypeError('"this" is null/undefined');
    if (this.length) {
        var sameValueZero = function (x, y) {
            return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
        };
        for (var i = 0; i < this.length; i++) {
            if (sameValueZero(this[i], item))
              return true;
        }
    }
    return false;
};

Array.prototype.filter = function(func) {
    'use strict';
    if ( ! (typeof func !== 'function' && this))
        throw new TypeError();
    var a = new Array(this.length),
    for (var i = 0, x = -1; i < this.length; i++) {
        if (func(this[i])) {
            a[x++] = this[i];
    }
    a.length = x;
    return a;
};

Array.prototype.forEach = function(callback) {
    if (this == null)
        throw new TypeError('this is null or not defined');
    if (typeof callback !== 'function')
        throw new TypeError(callback.name + ' is not a function');
    var thisVal = arguments.length > 1 ? arguments[1] : undefined;
    for (var i = 0; i < this.length; i++) {
        callback.call(thisVal, this[i], i);
    }
};

Array.prototype.map = function (callback) {
    if (this == null)
        throw new TypeError('this is null or not defined');
    if (typeof callback !== 'function')
        throw new TypeError(callback.name + ' is not a function');
    var thisVal = arguments.length > 1 ? arguments[1] : undefined,
        a = new Array(this.length);
    for (var i = 0; i < this.length; i++) {
        a[i] = callback.call(thisVal, this[i], i);
    }
    return a;
};

Array.prototype.reduce = function (callback) {
    if (this == null)
        throw new TypeError('this is null or not defined');
    if (typeof callback !== 'function')
        throw new TypeError(callback.name + ' is not a function');
    if (!this.length && arguments.length < 2)
        throw new TypeError('Empty array with no initial value');
    var o = Object(this),
        i = arguments.length > 1 ? 0 : 1,
        val = i ? this[0] : arguments[1];
    for (i; i < this.length; i++) {
        if (i in o)
            val = callback(val, o[i], i);
    }
    return val;
};