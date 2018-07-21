if (!Array.prototype.includes) {
    Array.prototype.includes = function (member, fromIndex) {
        if (this === null || this === undefined)
            throw TypeError('this is null or undefined');
        var o = Object(this),
            len = o.length,
            i = (fromIndex |= 0) >= 0 ? fromIndex : len + fromIndex,
            val = Object.valueOf;
        if (len === 0 || i >= len)
            return false;
        for (i = i < 0 ? 0 : i; i < len; i++) {
            if (i in o && (o[i] === member || val(o[i]) === val(member)))
                return true;
        }
    };
}

if (!Array.prototype.filter){
    Array.prototype.filter = function(callback) {
        'use strict';
        if (this === null || this === undefined)
            throw TypeError('this is null or undefined');
        if (typeof callback !== 'function')
            throw new TypeError(callback.name + ' is not a function');
        var thisVal = arguments.length > 1 ? arguments[1] : undefined,
            a = new Array(this.length);
        for (var i = 0, x = -1; i < this.length; i++) {
            if (callback.call(thisVal, this[i], i))
                a[x++] = this[i];
        }
        a.length = x;
        return a;
    }
};

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback) {
        if (this === null || this === undefined)
            throw TypeError('this is null or undefined');
        if (typeof callback !== 'function')
            throw new TypeError(callback.name + ' is not a function');
        var thisVal = arguments.length > 1 ? arguments[1] : undefined;
        for (var i = 0; i < this.length; i++) {
            callback.call(thisVal, this[i], i);
        }
    };
}

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (member, fromIndex) {
        if (this === null || this === undefined)
            throw TypeError('this is null or undefined');
        var o = Object(this),
            len = o.length,
            i = (fromIndex |= 0) >= 0 ? fromIndex : len + fromIndex,
            val = Object.valueOf;
        if (len === 0 || i >= len)
            return -1;
        for (i = i < 0 ? 0 : i; i < len; i++) {
            if (i in o && (o[i] === member || val(o[i]) === val(member)))
                return i;
        }
        return -1;
    };
}

if (!Array.prototype.map) {
    Array.prototype.map = function(callback) {
        if (this === null || this === undefined)
            throw TypeError('this is null or undefined');
        if (typeof callback !== 'function')
            throw new TypeError(callback.name + ' is not a function');
        var thisVal = arguments.length > 1 ? arguments[1] : undefined,
            a = new Array(this.length);
        for (var i = 0; i < this.length; i++) {
            a[i] = callback.call(thisVal, this[i], i);
        }
        return a;
    };
}

if (!Array.prototype.reduce) {
    Array.prototype.reduce = function (callback) {
        if (this === null || this === undefined)
            throw TypeError('this is null or undefined');
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
}

if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '').replace(/ {2,}/g, ' ');
    };
}
