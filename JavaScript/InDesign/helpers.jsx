var hasProp = function (obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop) &&
           !obj[prop] instanceof Function;
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
    var a = [],
        isEnum = Object.prototype.propertyIsEnumerable;
    for (var p in obj) {
        if (hasProp(obj, p) && isEnum.call(obj, p)) {
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

(function () {
    // consider opening file here, and writing throughout?
    var logger = {};
    logger.levels = {NONE: 0, ERROR: 1, INFO: 2, DEBUG: 4};
    logger.level = this.levels.NONE;
    logger.file = Folder.current + '/batch.log';
    logger.logs = [];
    logger.log = function (level, data) {
        this.logs.push(localize(' [%1-%2-%3T%4] | %5 | %6'));
        // integrate timestamp here
        msg = timestamp() + '  [' + level + ']  ' + toString(data);
    };
    logger.error = function (data) {
        if ((this.level * 2 - 1) & this.levels.ERROR)
            this.log('ERROR', data);
    };
    logger.info = function (data) {
        if ((this.level * 2 - 1) & this.levels.INFO)
            this.log('INFO ', data);
    };
    logger.debug = function (data) {
        if ((this.level * 2 - 1) & this.levels.DEBUG)
            this.log('DEBUG', data);
    };
    this.levels.ERROR | this.levels.INFO | this.levels.DEBUG
    return logger;
})();

logger.log = function (level, data) {
    var d = new Date();
    this.logs.push(localize(' [%1-%2-%3T%4] | %5 | %6', 
                            d.getFullYear(),
                            ('0' + (++d.getMonth())).substr(-2),
                            ('0' + d.getDate()).substr(-2),
                            d.toTimeString().slice(0, 8),
                            level, toString(data, pretty));
    // toString options have to start with 31 spaces to match logs
    // cap log width at 120
    // just do json/toString for objects/arrays
};

logger.str = function (obj) {
    if (obj === o) {
        var o = Object(obj);
        var elements = map(o.items(), function (element) {
            if (obj instanceof Array) {
                return logger.str(element[0]);
            } else {
                return element[0] + ': ' + logger.str(element[1]);
            }
        })
        // figure out how to handle object vs array
        // reference fast-json-stable-stringify on github
        var brackets = o.toString() === '[object Array]' ? '[]' : '{}';
    } else {
        return String(obj);
    }
};

function except (type, arg, func) {
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
}

