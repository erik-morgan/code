var op = Object.prototype,
    hasOwn = op.hasOwnProperty;
var hasProp = function (obj, prop) {
    return hasOwn.call(obj, prop) && !obj[prop] instanceof Function;
};
var keys = function (obj) {
    return items.call(obj, true);
};
var values = function (obj) {
    return items.call(obj, false);
};
var items = function (obj, k) {
    if (!obj || obj !== Object(obj)) {
        throw TypeError('Can not get keys of a non-object');
    }
    var a = [];
    for (var p in obj) {
        if (hasProp(obj, p)) {
            a.push(k ? p : k == undefined ? [p, obj[p]] : obj[p]);
        }
    }
    return a;
};
var trim = function (str) {
    return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '').replace(/ {2,}/g, ' ');
};
var includes = function (arr, member, fromIndex) {
    if (arr === null || arr === undefined)
        throw TypeError('arr is null or undefined');
    var o = Object(arr),
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
var each = function (arr, callback) {
    if (arr === null || arr === undefined)
        throw TypeError('arr is null or undefined');
    if (typeof callback !== 'function')
        throw new TypeError(callback.name + ' is not a function');
    var thisVal = arguments.length > 2 ? arguments[2] : undefined;
    for (var i = 0; i < arr.length; i++) {
        callback.call(thisVal, arr[i], i);
    }
};
var map = function (arr, callback) {
    if (arr === null || arr === undefined)
        throw TypeError('arr is null or undefined');
    if (typeof callback !== 'function')
        throw new TypeError(callback.name + ' is not a function');
    var thisVal = arguments.length > 2 ? arguments[2] : undefined,
        a = new Array(arr.length);
    for (var i = 0; i < arr.length; i++) {
        a[i] = callback.call(thisVal, arr[i], i);
    }
    return a;
};
var except = function (type, arg, func) {
    var e = type instanceof Error ? type : 
            new Error(
                type == 'process' ? 'No processes in Batch.processes' :
                type == 'queue' ? 'No documents in Batch.queue' : arg
            );
    if (func) {
        e.from = func instanceof Function ? func.name : func;
    } else if (type == 'process' || type == 'queue') {
        e.from = 'Batch.process';
    }
    if (Batch && Batch.logging) {
        Batch.log('err', e);
    }
    throw e;
};
