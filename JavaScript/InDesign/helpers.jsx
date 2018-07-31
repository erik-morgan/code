var keys = function (obj) {
    return items.call(obj, true);
}
var values = function (obj) {
    return items.call(obj, false);
}
var items = function (obj, k) {
    if (!obj || obj !== Object(obj)) {
        throw TypeError('Can not get keys of a non-object');
    }
    var a = [],
        hasOwn = Object.prototype.hasOwnProperty,
        isEnum = Object.prototype.propertyIsEnumerable;
    for (var p in obj) {
        if (hasOwn.call(obj, p)) {
            a.push(k ? p : k == undefined ? [p, obj[p]] : obj[p]);
        }
    }
    return a;
}
var trim = function (str) {
    return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '').replace(/ {2,}/g, ' ');
}
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
}
var merge = function (arr, args) {
    if (arr === null || arr === undefined)
        throw TypeError('arr is null or undefined');
    if (!arr instanceof Array)
        throw TypeError('Can not merge into non-Array');
    var i = arr.length,
        len = arguments.length;
    for (var n = 0; n < len; n++) {
        arr[i++] = arguments[n];
    }
    arr.length = i;
}
var each = function (arr, callback) {
    if (arr === null || arr === undefined)
        throw TypeError('arr is null or undefined');
    if (typeof callback !== 'function')
        throw new TypeError(callback.name + ' is not a function');
    var thisVal = arguments.length > 2 ? arguments[2] : undefined;
    for (var i = 0; i < arr.length; i++) {
        callback.call(thisVal, arr[i], i);
    }
}
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
}
