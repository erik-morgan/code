(function () {
    // OTHER FORMATS I LIKE: [HH:MM:SS] [LVL], [HH:MM:SS LVL], [HH:MM:SS | LVL]
    function log (level, msg, data, name) {
        var stamp = [new Date().toTimeString().slice(0, 8), level].join(' | ');
        if (data && data === Object(data)) {
            name = name || data.constructor.name;
            data = map(items(o), function (item) {
                return name + '[' + item[0] + '] = ' + item[1];
            }).join('\n');
        } else {
            data = data ? (name || data.constructor.name) + ' = ' + data : '';
        }
        if (!this.opened) {
            this.file.open('w');
            this.opened = true;
        }
        this.file.writeln(trim(stamp + (msg || '') + '\n' + 
            data).replace(/^ /gm, '                  '));
    };

    var esc = function (str) {
        return str.replace(/[\r\n]+/g, '\\n').replace('\t', '\\t');
    }
    function log (level, data, name) {
        // what if item[1] has newlines? there has to be a limit...
        // 
        // JUST MAKE IT INTENTIONAL!
        // IF NAME IS SUPPLIED, TREAT AS LOGDATA, OTHERWISE AS MESSAGE
        // 
        if (Object(data) === data) {
            name = name || data.constructor.name;
            data = map(items(o), function (item) {
                return name + '[' + item[0] + '] = ' + esc(item[1]);
            }).join('\n                 ');
        } else {
            data = (name ? name + ' = ' : '') + esc(String(data));
        }
        if (!this.opened) {
            this.file.open('w');
            this.opened = true;
        }
        // could do a single replace at end?
        this.file.writeln(new Date().toTimeString().slice(0, 8) + ' | ' + 
                          level + ' | ' + data);
    };
    
    return {
        levels: {NONE: 0, ERROR: 1, INFO: 2, DEBUG: 4},
        level: this.levels.NONE,
        file: file || Folder.current + '/batch.log',
        opened: false,
        close: function () {
            this.file.close();
        },
        error: function (err) {
            if ((this.level * 2 - 1) & this.levels.ERROR)
                log.call(this, 'ERR', undefined, err);
        },
        info: function (msg, data) {
            if ((this.level * 2 - 1) & this.levels.INFO)
                log.call(this, 'INF', msg, data);
        },
        debug: function (msg, data) {
            if ((this.level * 2 - 1) & this.levels.DEBUG)
                log.call(this, 'DBG', msg, data);
        }
    };
})();
