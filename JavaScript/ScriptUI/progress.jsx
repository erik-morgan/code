/*
 * inspect object references (eg in cancel onclick, use itself as base object)
 * try to avoid closures unless they're needed later anyway
It’s never a good idea to mix values of different types (e.g. numbers, strings, undefined or true/false) in the same array
On the use of delete - Marc is right for global variables, I usually store the window object and related functions within one single object which itself is stored in the global variable. This way the global namespace is less cluttered, resulting in more speed improvements, and delete will work on the slots of that object.
Indeed each library will add one (workspace) as soon as functions are loaded in the related closures (i.e. the INNER local variable and the SELF argument). That's the cost of the pattern, I agree, but it doesn't seem prohibitive so far, since each module is loaded once per session and never duplicated. About performance issues, I've always found they were negligible compared to DOM access time and ScriptUI LayoutManager intrinsic latency! However, when a INNER.xxx() or a SELF.yyy() routine needs to be invoked within a huge loop, you are right that the slowdown is noticeable. In such case, it's always better to create in the client code a local func variable that references the required method, then to call func() from within the loop.
check out how estk's jsx files determine available engines & dollar sign setup

add unwatch function in cleanup
i can assigns w.texts.1, w.texts.2, etc for integer keys

Indeed. Also, a slightly more succinct fix for IE6/7 would be:
  function foo(element, a, b) {
    element.onclick = function() {
        // uses a and b
    };
    element = null; // avoid memory leak
  }
The closure contains a reference to foo's activation object, not to its properties. As a consequence, you can clear out the element reference after the event handler has been defined and this will break the circular reference.
The above technique is also useful when creating anonymous functions for other purposes when element references happen to be lying around.


BAD:
var quantaty = 5;
function addGlobalQueryOnClick(linkRef){
    if(linkRef){
        linkRef.onclick = function(){
            this.href += ('?quantaty='+escape(quantaty));
            return true;
        };
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////
function ExampleConst(param){
    this.method1 = function(){};
    this.method2 = function(){};
    this.method3 = function(){};
    this.publicProp = param;
}

GOOD:
var quantaty = 5;
function addGlobalQueryOnClick(linkRef){
    if(linkRef)
        linkRef.onclick = forAddQueryOnClick;
}
function forAddQueryOnClick(){
    this.href += ('?quantaty='+escape(quantaty));
    return true;
}
///////////////////////////////////////////////////////////////////////////////////////////////////
function ExampleConst(param){
    this.publicProp = param;
}
ExampleConst.prototype.method1 = function(){};
ExampleConst.prototype.method2 = function(){};
ExampleConst.prototype.method3 = function(){};

*/

function ProgressWindow (title) {
    this.window = new Window('palette', '    ' + title);
    this.count = 0;
    this.file = this.timer = this.eta = '';
}

// in onShow, loop children, & if text, add watchers; use propNames for names, pattern for pattern, & props for props
function textFactory (item, obj) {
    var props = item.props.slice();
    for (var p = 0; p < props.length; p++) {
        obj.watch(props[p], function (name, prev, next) {
            return (item.props[p] = next);
        });
    }
    item.watch('props', function (name, prev, next) {
        item.text = localize.apply(undefined, [item.pattern].concat(next));
        return next;
    });
}

ProgressWindow.prototype.build = function (max) {
    var ctrl;
    this.window.alignChildren = 'fill';
    this.total = max;
    
    // ctrl = this.window.add('statictext {characters: 80}');
    ctrl = this.window.add('statictext');
    ctrl.pattern = 'Processing File %1/%2';
    ctrl.props = [, 'count', 'total'];
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
    this.window.cancel.onClick = this.window.close;
    
    this.window.onClose = function () {
        if (alert('Abort the operation?', true))
            throw Error('User aborted the operation');
    };
    
    this.start = new Date();
    this.window.show();
}

/*
 * i want to be able to show it before beginning the loop
 * SEPARATE THIS.UPDATE FROM THIS.REFRESH: this allows refreshing the times inbetween Procedure method calls without updating the counter
 * wrap main loop in try/catch; the user cancelled
 * MAKE SURE TO CALL PW.CLOSE IN FINALLY BLOCK
 * .visible || .show()
 * add 'Operation cancelled by user, ending process...' notification on cancel
 * 
 * IMPORTANT: do testing in indd as well as estk, bc it often behaves differently in one vs the other
 */

ProgressWindow.prototype.update = function (name) {
    this.file = name;
    this.bar.value = ++this.count;
    this.timer = doTime((new Date() - this.start) / 1000);
    this.eta = doTime((obj.total-obj.count)*(obj.timer/obj.count));
};

ProgressWindow.prototype.close = function () {
    this.window.onClose = null;
    this.window.close();
    this.window = null;
    delete this.window;
    // delete this? investigate persistence & reasons for it
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
    bar.onChange = function () {
        this.fraction = this.value / this.maxvalue;
        this.text = (this.fraction * 100).toFixed(2) + '%';
    };
    bar.onDraw = function () {
        var w = (this.size || this.preferredSize).width,
            h = (this.size || this.preferredSize).height,
            wt = g.measureString(this.text || '0%')[0];
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
