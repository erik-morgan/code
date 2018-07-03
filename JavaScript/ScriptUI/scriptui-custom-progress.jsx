function ProgressBar (title) {
    var w = new Window('palette {title: "' + title + '", alignChildren: ["fill", "fill"]}'),
        charSize = w.graphics.measureString('m');
    this.bar = w.add('customBoundedValue', [15, 15, charSize[0] * 60, charSize[1] * 3]);
    var g = this.bar.graphics;
    this.bar.back = g.newBrush(g.BrushType.SOLID_COLOR, [0.4, 0.4, 0.4]);
    this.bar.fill = g.newBrush(g.BrushType.SOLID_COLOR, [0.13, 0.59, 0.95]);
    this.bar.pen = g.newPen(g.PenType.SOLID_COLOR, [1, 1, 1], 1);
    this.bar.onDraw = drawBar;
    this.close = function () {
        w.close();
    };
    this.update = function () {
        this.bar.value = ++this.count;
        this.bar.pct = (this.count * 100 / this.total).toFixed(1);
        if (!w.visible)
            w.show();
    };
    this.init = function (max) {
        this.count = this.bar.minvalue = this.bar.value = 0;
        this.total = this.bar.maxvalue = max;
    };
}

function drawBar () {
    var pbg = this.graphics,
        wh = this.size,
        xy = this.location,
        wt = pbg.measureString(this.pct + '%')[0];
    pbg.rectPath(0, 0, wh[0], wh[1]),
    pbg.fillPath(this.back);
    pbg.closePath();
    pbg.newPath();
    pbg.rectPath(0, 0, this.value * wh[0] / this.maxvalue, wh[1]);
    pbg.fillPath(this.fill);
    pbg.drawString(this.pct + '%', this.pen, (wh[0] - wt)/2, wh[1]/4);
}

(function () {
    var pb = new ProgressBar('processINDD Test');
    pb.init(10);
    for (var i = 0; i < 10; i++) {
        pb.update();
        $.sleep(500);
    }
    pb.close();
})();
