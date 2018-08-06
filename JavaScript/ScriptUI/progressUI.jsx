// 2018-08-06 00:02:32 //
/**
 * TODO: increment this in batch, even when file is skipped (to maintain count)
 */
(function () {
    // actually, switch to the prototype method, this is too sloppy
    
    var w = new Window('palette', 'Batch Progress');
    w.alignChildren = 'fill';
    
    w.count = w.add('statictext');
    buildBar(w);
    w.filename = w.add('statictext');
    w.elapsed = w.add('statictext');
    w.remaining = w.add('statictext');
    
    w.cancel = w.add('button', undefined, 'Abort', {name: 'cancel'});
    w.cancel.onClick = w.close;
    
    w.onClose = function () {
        w.aborted = Window.alert('Abort the operation?', true);
    };
    
    return {
        win: w,
        create: function (max, firstName) {
            this.value = 0;
            this.max = max;
            this.name = firstName;
        },
        update: function (name) {
            if (name) {
                this.win.count.text = localize('Processing File %1/%2',
                                               ++this.bar.value, this.bar.max);
                this.win.filename.text = 'Filename: %1' + name;
            }
            this.timer.update(this.bar.value, this.bar.maxvalue);
        },
        timer: {
            elapsed: w.children[3],
            remaining: w.children[4],
            update: function (val, max) {
                var time = (new Date() - this.start) / 1000;
                this.elapsed.text = 'Time Elapsed: ' + this.format(time);
                this.remaining.text = 'Time Remaining: About %1' + 
                                      this.format((max - val) * (time / val));
            },
            format: function (t) {
                var floor = Math.floor;
                if (t > 3600) {
                    t = floor(t / 3600) + ' hours, ' +
                        floor(t % 3600 / 60) + ' minutes';
                } else {
                    t = floor(t % 3600 / 60) + ' minutes, ' +
                        floor(t % 60) + ' seconds';
                }
                return t.replace(/(\b1 \w+)s|(, )?\b0 \w+(, )?/g, '$1');
            }
        }
    };
})();

ProgressWindow.prototype.close = function () {
    // try and use just this as close handler, but still throw error on abort
    this.w.onClose = null;
    this.w.close();
    if (!this.total)
        alert(localize('Operation complete!\nProcessed %1 INDD files in %2',
                       this.count, formatTime((new Date() - this.start) / 1000));
};

function buildBar (parent) {
    parent.bar = parent.add('customBoundedValue {text: "0%", factor: 0}');
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
