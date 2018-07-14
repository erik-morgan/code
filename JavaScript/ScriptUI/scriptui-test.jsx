#target indesign

$.ProgressWindow = function (title) {
    var w = new Window('palette', '    ' + title),
        texts = [],
        makeText = function () {
            var text = w.add('statictext');
            text.args = [].slice.call(arguments);
            texts.push(text);
        };
    w.alignChildren = 'fill';
    makeText('Processing File %1/%2', 'count', 'total');
    this.bar = getBar(w);
    makeText('Filename: %1', 'file');
    makeText('Time Elapsed: %1', 'timer');
    makeText('Time Remaining: About %1', 'eta');
    this.texts = texts;
    w.onClose = function () {
        if (confirm('Abort the operation?', true))
            throw Error('User aborted the operation');
    };
    // ONLY WORKS ON DIALOGS
    w.cancelElement = w.add('button {text: "Abort", name: "cancel", alignment: ["right", "bottom"]}');
    w.cancelElement.onClick = w.close;
    this.window = w;
}

$.ProgressWindow.prototype.init = function (max) {
    this.count = this.bar.value = 0;
    this.total = this.bar.maxvalue = max;
    this.start = new Date();
    this.window.show();
};

$.ProgressWindow.prototype.update = function (name) {
    if (this.count == this.total - 1) {
        this.close();
        return;
    }
    this.timer = doTime((new Date() - this.start) / 1000);
    this.eta = doTime((this.total-this.count)*(this.timer/this.count));
    if (name) {
        this.file = name;
        this.bar.value = ++this.count;
        for (var t = 0; t < this.texts.length; t++) {
            var params = this.texts[t].args.slice();
            for (var p = 1; p < params.length; p++) {
                params[p] = this[params[p]];
            }
            this.texts[t].text = localize.apply(undefined, params);
        }
    }
};

$.ProgressWindow.prototype.close = function () {
    this.window.onClose = null;
    this.window.close();
};

function doTime (time) {
    var h = ~~(time / 3600), m = ~~((time % 3600) / 60), s = ~~(time % 60);
    return (h ? h + ' hours, ' + (m ? m + ' minutes' : '') :
           (m ? m + ' minutes, ' + (s ? s + ' seconds' : '') :
           (s + ' seconds'))).replace(/\b(1 \S+)s|, $/g, '$1');
}

function getBar (parent) {
    var bar = parent.add('customBoundedValue'),
        g = bar.graphics,
        sz = g.measureString('X'),
        backBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.4, 0.4, 0.4]),
        fillBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.13, 0.59, 0.95]),
        pen = g.newPen(g.PenType.SOLID_COLOR, [1, 1, 1], 1);
    bar.text = '0%';
    bar.preferredSize = [sz[0] * 80, sz[1] * 2];
    bar.onChange = function () {
        this.fraction = this.value / this.maxvalue;
        this.text = (this.fraction * 100).toFixed(2) + '%';
        this.notify('onDraw');
    };
    bar.onDraw = function () {
        var w = (this.size || this.preferredSize).width,
            h = (this.size || this.preferredSize).height,
            wt = g.measureString(this.text)[0];
        g.rectPath(0, 0, w, h),
        g.fillPath(backBrush);
        g.closePath();
        g.newPath();
        g.rectPath(0, 0, (this.fraction || 0) * w, h);
        g.fillPath(fillBrush);
        g.drawString(this.text, pen, (w - wt) / 2, h / 4);
    };
    return bar;
}

function updateLink (link) {
    var linkPath = link.filePath;
    linkPath = linkPath.replace(RegExp(String.fromCharCode(61473), 'g'), '*');
    linkPath = linkPath.replace(RegExp(String.fromCharCode(61474), 'g'), ':');
    linkPath = linkPath.replace(/.+?(?=share)/i, '');
    if (File(linkPath).exists && link.status == LinkStatus.linkMissing)
        link.relink(File(linkPath));
}

var pb = new $.ProgressWindow('processINDD'),
    links = app.activeDocument.links.everyItem().getElements(),
    task = app.idleTasks.add({name: 'processINDD', sleep: 500});
pb.init(links.length);

task.addEventListener(IdleEvent.ON_IDLE, function () {
    pb.update();
    $.sleep(1500);
});

for (var i = 0; i < links.length; i++) {
    pb.update(links[i].name);
    updateLink(links[i]);
}

task.sleep = 0;