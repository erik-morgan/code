// 2018-08-05 15:26:48 //

(function (global) {
    var pb = {
        val: 0,
        max: 100,
        onChange: [],
        onComplete: null,
        timer: {
            start: new Date(),
            time: function () {
                return (new Date() - this.start) / 1000;
            },
            left: function (instance) {
                return (instance.max - instance.value) * (this.time() / instance.value);
            },
            format: function (t) {
                return (t > 3600 ? 
                        ~~(t / 3600) + ' hours, ' + ~~(t % 3600 / 60) + ' minutes' :
                        ~~(t % 3600 / 60) + ' minutes, ' + ~~(t % 60) + ' seconds'
                ).replace(/(\b1 \w+)s|(, )?\b0 \w+(, )?/g, '$1');
            }
        },
        window: new Window('palette', 'ProgressBar'),
        create: function (val, max, title) {
            if (this.hasOwnProperty('instance')) {
                return this.instance;
            }
            this.instance = this;
            if (val !== undefined) {
                this.val = val;
            }
            if (max !== undefined) {
                this.max = max;
            }
            if (title !== undefined) {
                this.window.title = title;
            }
            return this;
        },
        destroy: function () {
            this.window.close();
        },
        value: function (value) {
            if (value === undefined) {
                return this.val;
            }
            if (Number(value) === value && value > 0 && value <= this.max) {
                this.window.bar.value = this.val = value * (
                    value < 1 ? this.max : 1
                );
            }
        },
        instance: function () {
            return this.hasOwnProperty('instance') ? this.instance : undefined;
        },
        addText: function (msg) {
            return this.window.add('statictext');
        },
        addBar: function () {
            if (! this.window.bar) {
                buildBar();
            }
        },
        show: function () {
            this.window.bar.value = this.val || 0;
            this.window.bar.maxvalue = this.max || 100;
            this.window.show();
        }
    };
    
    global.ProgressBar = pb;
})($.global);

function buildBar (pb) {
    pb.window.bar = pb.window.add('customBoundedValue {text: "0%", factor: 0}');
    bar.w = bar.graphics.measureString('X')[0] * 60;
    bar.h = bar.graphics.measureString('X')[1] * 2;
    bar.back: bar.graphics.newBrush(+null, [0.4, 0.4, 0.4]),
    bar.fill: bar.graphics.newBrush(+null, [0.13, 0.59, 0.95])
    bar.pen = bar.graphics.newPen(+null, [1, 1, 1], 1);
    bar.onChange = function () {
        if (this.value == this.maxvalue) {
            pb.onComplete ? pb.onComplete() : pb.destroy();
            return;
        } else {
            this.factor = this.value / this.maxvalue;
            this.text = (this.factor * 100).toFixed(2) + '%';
            each(pb.onChange, function (changeFunc) {
                changeFunc(pb);
            });
            this.notify('onDraw');
        }
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
}
