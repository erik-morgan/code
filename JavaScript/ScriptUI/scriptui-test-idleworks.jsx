#target indesign
#targetengine "session"

//~ app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
//~ app.scriptPreferences.enableRedraw = true;

/*
 * throwing an error in onClose fails (uncaught js error)
 * calling window.close(#) does nothing
 * enableRedraw = true + no update = unable to interact with Abort button
 * enableRedraw = false + no update = same thing
 * changed loop operation to involve indesign dom
 * enableRedraw = true/false + update = flickered so badly i couldn't press anything
 * $.sleep(50 & 250) = clicking just resulted in beeps and not responding
 * TRY:
 * X     adding a sleep after update to allow the ui to wait
 * !     onIdle (when indd is idle, call a callback that does whatever, then updates the pb)
 * X     try adding main dom actions in onIdle
 * X     see if it flickers with regular progressBar
 * X     call window.update repeatedly? (checking for date - time)
 * X     adding an eventHandler to window for click?
 * X     try a persistent engine!?
 * X      using beforeOpen indd event handler
 *      last things i can think of:
 *          use bridgetalk
 *          do some dumb work around like with the file on the desktop
 *          don't give the option to cancel
 *          use another language for the gui
 */

$.ProgressWindow = function (title) {
    var w = new Window('palette', '    ' + title, undefined, {closeButton: true}),
        texts = [],
        makeText = function () {
            var text = w.add('statictext {characters: 80}');
            text.args = [].slice.call(arguments);
            texts.push(text);
        };
    w.alignChildren = 'fill';
    makeText('Processing File %1/%2', 'count', 'total');
    this.bar = getBar(w);
//~     this.bar = w.add('progressbar');
    makeText('Filename: %1', 'file');
    makeText('Time Elapsed: %1', 'timer');
    makeText('Time Remaining: About %1', 'eta');
    this.texts = texts.slice();
    w.onClose = function () {
        if (confirm('Abort the operation?', true))
            throw Error('User aborted the operation');
    };
    // ONLY WORKS ON DIALOGS
    w.cancel = w.add('button {text: "Abort", name: "cancel", alignment: ["right", "bottom"]}');
    w.cancelElement = w.cancel;
    w.cancel.onClick = function () {
        this.window.close();
    };
    this.window = w;
}

$.ProgressWindow.prototype.init = function (max) {
    this.count = this.bar.value = 0;
    this.total = this.bar.maxvalue = max;
    this.start = new Date();
    this.window.show();
};

$.ProgressWindow.prototype.update = function (name) {
    this.file = name;
    this.bar.value = ++this.count;
    this.timer = doTime((new Date() - this.start) / 1000);
    this.eta = doTime((this.total-this.count)*(this.timer/this.count));
    for (var t = 0; t < this.texts.length; t++) {
        var params = this.texts[t].args.slice();
        for (var p = 1; p < params.length; p++) {
            params[p] = this[params[p]];
        }
        this.texts[t].text = localize.apply(undefined, params);
    }
    this.window.update();
};

$.ProgressWindow.prototype.close = function () {
    this.window.onClose = null;
    this.window.close();
    this.window = null;
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

    var pb = new $.ProgressWindow('processINDD Progress'),
        doc = app.activeDocument,
        links = doc.links.everyItem().getElements(),
        task = app.idleTasks.add({name: 'processINDD', sleep: 5000}),
        i = 0;
    task.addEventListener(IdleEvent.ON_IDLE, function () {
        pb.update(links[i].name);
        updateLink(links[i++]);
        if (i == app.activeDocument.links.length)
            pb.close();
    });
    pb.init(links.length);
//~     try {
//~         for (; i < links.length; i++) {
//~             if (i == 25)
//~                 pb.window.cancel.notify('onClick');
//~             pb.update(links[i].name);
//~             updateLink(links[i]);
//~             $.sleep(50 + (100 * Math.random()));
//~         }
//~     } catch (e) {
//~         $.writeln(e);
//~     } finally {
//~         pb.close();
//~     }
