function ProgressWindow (title) {
    this.window = new Window('palette', '    ' + title);
    this.count = 0;
    this.file = this.timer = this.eta = '';
    this.register = function (item) {
        var props = item.props.slice();
        for (var p = 0; p < props.length; p++) {
            this.watch(props[p], function (name, prev, next) {
                return (item.props[p] = next);
            });
        }
        item.watch('props', function (name, prev, next) {
            item.text = localize.apply(undefined, [item.pattern].concat(next));
            return next;
        });
    };
}

ProgressWindow.prototype.build = function (max) {
    var ctrl;
    this.window.alignChildren = 'fill';
    this.total = max;
    
    // ctrl = this.window.add('statictext {characters: 80}');
    ctrl = this.window.add('statictext');
    ctrl.props = ['Processing File %1/%2', 'count', 'total'];
    this.register(ctrl);
    
    this.bar = getBar(this.window);
    this.bar.maxvalue = this.total;
    
    ctrl = this.window.add('statictext');
    ctrl.props = ['Filename: %1', 'file'];
    this.register(ctrl);
    
    ctrl = this.window.add('statictext');
    ctrl.props = ['Time Elapsed: %1', 'timer'];
    this.register(ctrl);
    
    ctrl = this.window.add('statictext');
    ctrl.props = ['Time Remaining: About %1', 'eta'];
    this.register(ctrl);
    
    this.window.add('button', undefined, 'Abort', {name: 'cancel'});
    this.window.cancel.onClick = this.close;
    
    this.window.onClose = function () {
        // return result of confirmation
        this.aborted = true;
    };
    
    this.aborted = false;
    this.toClose = false;
    this.start = new Date();
    this.window.show();
}

/*
 * i want to be able to show it before beginning the loop
 * SEPARATE THIS.UPDATE FROM THIS.REFRESH: this allows refreshing the times inbetween Procedure method calls without updating the counter
 * add onChange handler to progressbar to set up onDraw vars
 * hide, close, then nullify a palette window (see bottom)
 * .visible || .show()
 * 
 * ANOTHER OPTION: pass ProgressWindow the structure (?) & a callback, so it does the looping:
 *     receive the array in build and process it
 *     for (var n = 0; n < array.length; n++) {
 *         if (!pb.aborted)
 *             doSomethingCallback(array[n]);
 *     }
 * 
 * OR: since scriptui can only process update events during execution, exclude a cancel button.
 *     rely on indesign's ability to cancel script with escape key, but will not close the dialog,
 *     so I'd have to devise a way of detecting the window (after script execution?), and closing it
 * 
 * perform try/catch in update? figure out how to interrupt the process when cancel is clicked
 * IMPORTANT: do testing in indd as well as estk, bc it often behaves differently in one vs the other
 */

ProgressWindow.prototype.update = function (name) {
    this.file = name;
    this.bar.value = ++this.count;
    this.timer = doTime((new Date() - this.start) / 1000);
    this.eta = doTime((obj.total-obj.count)*(obj.timer/obj.count));
    if (!this.window.visible)
        this.window.show();
};

ProgressWindow.prototype.close = function () {
    this.window.close();
    this.window = null;
};

function doTime (time) {
    var u, t = [];
    if (u = Math.floor(time / 3600))
        t.push(u + (u > 1 ? ' hours' : ' hour'));
    if (u = Math.floor(time % 3600 / 60))
        t.push(u + (u > 1 ? ' minutes' : ' minute'));
    if (time < 3600 && (u = Math.floor(time % 60)))
        t.push(u + (u > 1 ? ' seconds' : ' second'));
    return t.join(', ');
}

function getBar (parent) {
    var bar = parent.add('customBoundedValue'),
        g = bar.graphics,
        sz = g.measureString('X'),
        backBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.4, 0.4, 0.4]),
        fillBrush = g.newBrush(g.BrushType.SOLID_COLOR, [0.13, 0.59, 0.95]),
        pen = g.newPen(g.PenType.SOLID_COLOR, [1, 1, 1], 1);
    bar.preferredSize = [sz[0] * 60, sz[1] * 2];
    bar.onDraw = function () {
        var w = (this.size || this.preferredSize).width,
            h = (this.size || this.preferredSize).height,
            ratio = this.value / this.maxvalue, s,
            wt = g.measureString(s = (ratio * 100 ).toFixed(2) + '%')[0];
        g.rectPath(0, 0, w, h),
        g.fillPath(backBrush);
        g.closePath();
        g.newPath();
        g.rectPath(0, 0, ratio * w, h);
        g.fillPath(fillBrush);
        g.drawString(s, pen, (w - wt) / 2, h / 4);
    };
    return bar;
}

/*
///////////////////////////////////////////////////////////////////////////////////////////////////
dlg.cancel.onClick = dlg.close;
dlg.onClose = function() { this.aborted = true; }
dlg.aborted = dlg.toClose = false;
dlg.center();
dlg.show();
const kLaunchTimeout = 300000; // wait until launched, timeout after 5 Min.
var startTime = new Date();
while( !dlg.aborted && !dlg.toClose ) {
    try {
        var task = this.target.cdic.isTargetRunning( this.target.address );
        var res = CDICManager.getSynchronousResult( cdicMgr.callSynchronous( task ) );
        if( res && res.length && res[0] )
            dlg.toClose = true; // app is running
        // pump application event loop several times to receive UI events
        var abortIm = false;
        for( var pumpLoop=0; pumpLoop<10 && !abortIm; pumpLoop++ )
            abortIm = !app.pumpEventLoop();
        if( abortIm ) {
            dlg.aborted = true; // abort
            dlg.close();
            if( abortIm ) return; // estk is quitting
        }
    } catch( exc ) {
        dlg.aborted = true; // abort
        dlg.close();
    }
    var now = new Date();
    dlg.aborted = ( dlg.aborted ? dlg.aborted : ( ( now - startTime ) > kLaunchTimeout ) );
}
var dlgaborted = dlg.aborted;
dlg.close();
dlg = null;     // force deletion of core Window element
this.cb ? this.cb.call( !dlgaborted ) : app.launchError( this );
///////////////////////////////////////////////////////////////////////////////////////////////////
#targetengine ManageSingletonPalette
$.UI || ($.UI = function F(FLAG) { // -1 > destroy; 0 > restore; 1  > rebuild
    F.W || (F.W=Window.find("palette", "My Palette"));
    if( F.W && FLAG ) {
        F.W.visible && F.W.close();
        F.W = null;
        delete F.W;
    }
    if( -1===FLAG ) return;
    if( !F.W ) {
        F.W = new Window('palette', "My Palette", [50,50,300,300], {resizeable:true});
        // etc.
    }
    F.W.visible || F.W.show();
});
///////////////////////////////////////////////////////////////////////////////////////////////////
*/