// 2018-08-03 21:42:03 //
var items = function (o, funcs) {
    if (! o || o !== Object(o)) {
        throw TypeError('Can not get members of a non-object');
    }
    var obj = Object(o),
        has = obj.propertyIsEnumerable,
        entries = [];
    for (var key in obj) {
        if (has(key) && (! obj[key] instanceof Function || funcs)) {
            entries.push([key, obj[key]]);
        }
    }
    entries.sort(function (a, b) {
        a[0].localeCompare(b[0], 'en-u-kn-true');
    })
    return entries;
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
var logger = (function () {
    var log = function (level, data, name) {
        if (name && Object(data) === data) {
            data = map(items(data), function (item) {
                return name + '[' + item[0] + '] = ' + String(item[1]);
            }).join('\n');
        } else {
            data = (name ? name + ' = ' : '') + String(data);
        }
        this.file.writeln(
            new Date().toTimeString().slice(0, 8) + ' | ' + level + ' | ' +
            data.replace(/[\r\n]+/g, '\n                 '));
    };
    return {
        levels: {NONE: 0, ERROR: 1, INFO: 2, DEBUG: 4},
        level: 0,
        file: 'batch.log',
        close: function () {
            this.file.close();
        },
        error: function (err) {
            if ((this.level * 2 - 1) & this.levels.ERROR) {
                log.call(this, 'ERR', err, 'Error');
            }
        },
        info: function (data, name) {
            if ((this.level * 2 - 1) & this.levels.INFO) {
                log.call(this, 'INF', data, name);
            }
        },
        debug: function (data, name) {
            if ((this.level * 2 - 1) & this.levels.DEBUG) {
                log.call(this, 'DBG', data, name);
            }
        }
    };
})();
