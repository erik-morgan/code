/*
 * got a working algorithm for compact, semi-pretty semi-JSON
 * stringify-like behavior for logging data
 * 
 * it would be cool if it handled obj braces better (eg if an array of objs,
 * then when one ends, and another begins, it'd be like "}, {")
 * 
 * Inspired by and used for guidance:
 * https://github.com/lydell/json-stringify-pretty-compact/blob/master/index.js
 * 
 * Fiddle containing algorithm:
 * https://jsfiddle.net/erikmorgan/t7yejk1o/45/
 */

function logger () {
    // consider opening file here, and writing throughout?
    this.levels = {NONE: 0, ERROR: 1, INFO: 2, DEBUG: 4};
    this.level = this.levels.NONE;
    this.file = Folder.current + '/batch.log';
    this.logs = [];
}
logger.prototype.error = function (data) {
    if ((this.level * 2 - 1) & this.levels.ERROR)
        this.log('ERROR', data);
};
logger.prototype.info = function (data) {
    if ((this.level * 2 - 1) & this.levels.INFO)
        this.log('INFO ', data);
};
logger.prototype.debug = function (data) {
    if ((this.level * 2 - 1) & this.levels.DEBUG)
        this.log('DEBUG', data);
};
logger.prototype.log = function (level, msg, data) {
    var d = new Date();
    this.logs.push(localize(
        '[ %1-%2-%3 %4 ] [ %5 ] %6', 
        d.getFullYear(),
        ('0' + (++d.getMonth())).substr(-2),
        ('0' + d.getDate()).substr(-2),
        d.toTimeString().slice(0, 8),
        level, localize(msg, strify(data)));
};
var quote = function (str) { return '\'' + str + '\''; },
    pad = function (times, rept) {
        rept = rept || ' ';
        for (var n = 0, str = ''; n < times; n++, str += rept);
        return str;
};
function strify (obj, indent, offset) {
    // either need to add a constant for reserved space,
    // or increment keylen; or i could start with a 32 char indent?
    var o = Object(obj);
    indent = indent || 0;
    offset = offset || 0;
    if (obj === o) {
        var isArray = o instanceof Array,
            ends = isArray ? '[]' : '{}',
            members, len;
        members = items(o).map(function (item, i, self) {
            var key = isArray ? '' : quote(item[0]) + ': ',
                keylen = i == self.length - 1 ? 0 : 2;
            return key + strify(item[1], indent + 2, keylen);
        });
        len = members.join(', ').length + indent + offset + 2;
        if (len <= 120) {
            return ends[0] + members.join(', ') + ends[1];
        } else {
            return ends[0] + '\n' + pad(indent + 2) + 
                   members.join(',\n' + pad(indent + 2)) + 
                   '\n' + pad(indent) + ends[1];
        }
    } else {
        return String(obj) === obj ? quote(String(obj)) : String(obj);
    }
}
