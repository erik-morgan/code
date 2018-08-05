// 2018-08-05 01:25:33 //
// don't forget to increment this in batch.jsx, even when a file is skipped;
// otherwise, it will throw off the progress
(function () {
    var w = new Window('palette', '    Batch Progress');
    w.alignChildren = 'fill';
    w.add('statictext').update = function (self) {
        this.text = localize('Processing File %1/%2',
                             self.bar.value, self.bar.maxvalue);
    };
    // add update function to bar
    bar = buildBar(w);
    w.add('statictext').update = function (self) {
        this.text = localize('Filename: %1', self.file);
    };
    w.add('statictext').update = function (self) {
        this.text = localize('Time Elapsed: %1', self.timer.elapsed);
    };
    w.add('statictext').update = function (self) {
        this.text = localize('Time Remaining: About %1', self.timer.remaining);
    };
    w.cancel = w.add('button', undefined, 'Abort', {name: 'cancel'});
    w.cancel.onClick = w.close;
    w.onClose = function () {
        w.aborted = Window.alert('Abort the operation?', true);
    };
    return {
        w: w,
        bar: bar,
        init: function (max) {
            this.bar.maxvalue = max;
            this.start = new Date();
            this.w.show();
        },
        update: function (name) {
            each(this.w.children, function (child) {
                if (child.hasOwnProperty('update')) {
                    child.update(this);
                }
            }, this);
        }
    }
})();

ProgressWindow.prototype.update = function (name) {
    if (name) {
        this.file = name;
        this.bar.value = ++this.count;
    }
    this.timer = (new Date() - this.start) / 1000;
    this.tpass = formatTime(this.timer);
    this.tleft = formatTime((--this.total) * (this.timer / this.count));
};

ProgressWindow.prototype.close = function () {
    // try and use just this as close handler, but still throw error on abort
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
