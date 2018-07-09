#target indesign

function ProgressWindow (title, max) {
    var w = new Window('palette', '    ' + title);
    this.count = 0;
    this.file = this.tpass = this.tleft = '';
    this.texts = {};
    w.alignChildren = 'fill';
    
    this.texts.count = w.add('statictext');
    this.texts.count.pattern = 'Processing File {count}/' + max;
    
    this.bar = buildBar(w);
    this.bar.maxvalue = this.total = max;
    
    this.texts.file = w.add('statictext');
    this.texts.file.pattern = 'Filename: {file}';
    
    this.texts.tpass = w.add('statictext');
    this.texts.tpass.pattern = 'Time Elapsed: {tpass}';
    
    this.texts.tleft = w.add('statictext');
    this.texts.tleft.pattern = 'Time Remaining: About {tleft}';
    
    w.add('button', undefined, 'Abort', {name: 'cancel'});
    w.cancel.onClick = w.close;
    
    w.onClose = function () {
        /* Options for cancelling:
         * if alert, call onError that calls PW.close (but activation obj would still be in stack)
         * object.watch this.aborted property
         * put this into init method, and wrap it all in a giant try/catch
         * put the try/catch on client-end, but cancelling isn't an error, so display operation summary with error summary?
         */
        if (!alert('Abort the operation?', true))
            return true;
        throw Error('User aborted the operation');
        return false;
    };
    
    (this.w = w) && (w = null);
};

ProgressWindow.prototype.init = function () {
    this.start = new Date();
    this.w.show();
};

ProgressWindow.prototype.update = function (name) {
    if (name) {
        this.file = name;
        this.bar.value = ++this.count;
    }
    this.timer = (new Date() - this.start) / 1000;
    this.tpass = formatTime(this.timer);
    this.tleft = formatTime((--this.total) * (this.timer / this.count));
    this.formatText(this);
    // use idletask to "pump" event loop aka window.update()?
    // determine whether it is necessary to call update, and how enableRedraw affects things
};

ProgressWindow.prototype.formatText = function (obj) {
    for (var txt in obj.texts) {
        txt.text = txt.pattern.replace(/\{(\w+)\}/g, function (match, g1) {
            return obj.hasOwnProperty(g1) ? obj[g1] : '';
        });
    }
};

ProgressWindow.prototype.close = function () {
    this.w.onClose = null;
    this.w.close();
    if (!this.total)
        alert(localize('Operation complete!\nProcessed %1 INDD files in %2',
                       this.count, formatTime((new Date() - this.start) / 1000));
};

function formatTime (time) {
    var u, t = [];
    if (u = Math.floor(time / 3600))
        t.push(u + (u > 1 ? ' hours' : ' hour'));
    if (u = Math.floor(time % 3600 / 60))
        t.push(u + (u > 1 ? ' minutes' : ' minute'));
    if (time < 3600 && (u = Math.floor(time % 60)))
        t.push(u + (u > 1 ? ' seconds' : ' second'));
    return t.join(', ');
}

function buildBar (parent) {
    var bar = parent.add('customBoundedValue {text: "0%", factor: 0}');
    bar.w = bar.graphics.measureString('X')[0] * 60;
    bar.h = bar.graphics.measureString('X')[1] * 2;
    bar.back: bar.graphics.newBrush(+null, [0.4, 0.4, 0.4]),
    bar.fill: bar.graphics.newBrush(+null, [0.13, 0.59, 0.95])
    bar.pen = bar.graphics.newPen(+null, [1, 1, 1], 1);
    bar.onChange = function () {
        this.factor = this.value / this.maxvalue;
        this.text = (this.factor * 100).toFixed(2) + '%';
        this.notify('onDraw');
    };
    bar.onDraw = function () {
        this.graphics.rectPath(0, 0, this.w, this.h),
        this.graphics.fillPath(this.back);
        this.graphics.closePath();
        this.graphics.newPath();
        this.graphics.rectPath(0, 0, (this.factor) * this.w, this.h);
        this.graphics.fillPath(this.fill);
        this.graphics.drawString({
            text: this.text,
            pen: this.pen,
            x: (this.w - this.graphics.measureString(this.text)[0]) / 2,
            y: this.h / 4
        });
    };
    return bar;
}
