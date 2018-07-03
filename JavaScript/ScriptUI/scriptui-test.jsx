// Processing File #/### (##%)
// [|||||||||||||||||||||||||||||||||||||||||||||||||||||||||]
// Details panel
// File: %1
// Time Elapsed: %1
// Time Remaining: About %1
/*
 * Use width of 80 characters for width of window content
 * default spacing/margins = 15
 */
function ProgressBar (title) {
    var w = new Window('palette {title: "' + title + '", alignChildren: ["fill", "fill"]}'),
        charSize = w.graphics.measureString('m'), texts = [],
        makeText = function () {
            var text = w.add('statictext {justify: "left"}');
            text.args = arguments.slice();
            texts.push(text);
        };
    makeText('Processing File %1/%2', 'count', 'total');
    this.bar = getBar(w);
    makeText('Filename: %1', 'file');
    makeText('Time Elapsed: %1', 'timer');
    makeText('Time Remaining: About %1', 'eta');
    this.texts = texts;
    // ONLY WORKS ON DIALOGS
    // b = w.add('button {text: "Abort", name: "cancel", alignment: ["right", "bottom"]}');
    // b.onClick = this.close;
}

ProgressBar.prototype.init = function (max) {
    this.count = this.bar.value = 0;
    this.total = this.bar.maxvalue = max;
    this.start = new Date();
};

ProgressBar.prototype.update = function (name) {
    this.file = name;
    this.bar.value = ++this.count;
    this.timer = new Date() - this.start;
    this.eta = getETA(this);
    for (var t = 0; t < this.texts.length; t++) {
        var params = this.texts[t].args.slice();
        for (var p = 1; p < params.length; p++) {
            params[p] = this[params[p]];
        }
        this.texts[t].text = localize.apply(undefined, params);
    }
    if (!w.visible)
        w.show();
};

ProgressBar.prototype.close = function () {
    w.close();
};

function getETA (obj) {
    var time = (obj.total-obj.count)*(obj.timer/obj.count)/1000,
        h = ~~(time / 3600), m = ~~((time % 3600) / 60), s = time % 60;
    return (h ? h + ' hours, ' + (m ? m + ' minutes' : '') :
           (m ? m + ' minutes, ' + (s ? s + ' seconds' : '') :
           (s + ' seconds'))).replace(/\b(1 \S+)s|, $/g, '$1');
}

(function () {
    Folder.current = File($.fileName).parent;
    var namesFile = File('test_list.txt'),
        indds, pb;
    namesFile.open();
    indds = namesFile.read().split(/[\r\n]+/);
    namesFile.close();
    pb = new ProgressBar(indds.length);
    pb.init(indds.length);
    for (var i = 0; i < indds.length; i++) {
        var indd = indds[i];
        pb.update(indd);
        $.sleep(800 + (400 * Math.random()));
    }
    pb.close();
})();
