// 2018-08-03 21:43:18 //
// moved latest version of logger.jsx to helpers.jsx
(function () {
    // OTHER FORMATS I LIKE: [HH:MM:SS] [LVL], [HH:MM:SS LVL], [HH:MM:SS | LVL]
    function log (level, data, name) {
        if (name && Object(data) === data) {
            data = map(items(data), function (item) {
                return name + '[' + item[0] + '] = ' + String(item[1]);
            }).join('\n');
        } else {
            data = (name ? name + ' = ' : '') + String(data);
        }
        if (!this.opened) {
            this.file.open('w');
            this.opened = true;
        }
        this.file.writeln(
            new Date().toTimeString().slice(0, 8) + ' | ' + level + ' | ' +
            data.replace(/[\r\n]+/g, '\n                 '));
    };
    return {
        levels: {NONE: 0, ERROR: 1, INFO: 2, DEBUG: 4},
        level: this.levels.NONE,
        file: Folder.current + '/batch.log',
        opened: false,
        close: function () {
            this.file.close();
        },
        error: function (err) {
            if ((this.level * 2 - 1) & this.levels.ERROR)
                log.call(this, 'ERR', err, 'Error');
        },
        info: function (data, name) {
            if ((this.level * 2 - 1) & this.levels.INFO)
                log.call(this, 'INF', data, name);
        },
        debug: function (data, name) {
            if ((this.level * 2 - 1) & this.levels.DEBUG)
                log.call(this, 'DBG', data, name);
        }
    };
})();
