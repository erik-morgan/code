// 2018-08-06 21:56:14 //

(function () {
    var w = new Window('palette', 'Batch Progress');
    w.alignChildren = 'fill';
    w.count = w.add('statictext');
    w.bar = w.add('customBoundedValue {text: "0%", factor: 0}');
    w.filename = w.add('statictext');
    w.tpast = w.add('statictext');
    w.tleft = w.add('statictext');
    w.cancel = w.add('button', undefined, 'Abort');
    w.cancel.onClick = w.close;
    buildBar(w.bar);
    
    var close = function () {
        this.win.onClose = null;
        this.win.close();
        Window.alert(localize(
            'Operation %1\nProcessed %2 files in %3',
            this.value == this.max ? 'complete!' : 'aborted.',
            this.value, this.ftime(this.timer())
        ));
    };
    
    var ftime = function (t) {
        var floor = Math.floor;
        if (t > 3600) {
            t = floor(t / 3600) + ' hours, ' +
                floor(t % 3600 / 60) + ' minutes';
        } else {
            t = floor(t % 3600 / 60) + ' minutes, ' +
                floor(t % 60) + ' seconds';
        }
        return t.replace(/(\b1 \w+)s|(, )?\b0 \w+(, )?/g, '$1');
    };
    
    var timer = function () {
        return (new Date() - this.start) / 1000;
    };
    
    var update = function (name) {
        if (this.value == this.max) {
            this.close();
        }
        if (name) {
            this.win.bar.value = ++this.value;
            this.win.count.text = 'Processing File ' + this.value +
                                  '/' + this.max;
            this.win.filename.text = 'Filename: ' + name;
        }
        this.win.tpast.text = 'Time Elapsed: ' + this.ftime(this.timer());
        this.win.tleft.text = 'Time Remaining: About ' + this.ftime(
            (this.max - this.value) * (this.timer() / this.value)
        );
    };
    
    function buildBar (bar) {
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
            this.graphics.drawString(
                this.text,
                this.pen,
                (this.w - this.graphics.measureString(this.text)[0]) / 2,
                this.h / 4
            );
        };
    }
    
    return {
        win: w,
        create: function (max) {
            this.value = 0;
            this.max = this.win.bar.maxvalue = this.left = max;
            this.start = new Date();
            this.win.onClose = function () {
                this.aborted = Window.alert('Abort the operation?', true);
            };
            this.win.show();
            delete this.create;
            return this;
        },
        close: close,
        ftime: ftime,
        timer: timer,
        update: update
    };
})();
