#target illustrator

/*
    For Personal Use: Does not ask for user input about # of divisions and can't
    handle situations where the rectangle isn't perfectly level
*/

var doc = app.activeDocument;
var rect = app.selection[0];

if (rect == undefined || rect.pathPoints.length !== 4){
    alert('Please select a rectangle and run the script again');
}
else {
    var pts = sortPoints(rect.pathPoints);
    var tl = pts[0].anchor;
    var tr = pts[1].anchor;
    var br = pts[2].anchor;
    var bl = pts[3].anchor;
    if (tl[0] == bl[0] && tl[1] == tr[1] && tr[0] == br[0] && br[1] == bl[1]){
        divRect(tl[1], tl[0], br[1], br[0]);
    }
}

function sortPoints(pts){
    var left = (pts[0].anchor[0] < pts[1].anchor[0] || pts[0].anchor[0] < pts[3].anchor[0]);
    var top = (Math.abs(pts[0].anchor[1]) < Math.abs(pts[1].anchor[1]) || Math.abs(pts[0].anchor[1]) < Math.abs(pts[3].anchor[1]));
    if (left && top) return pts;
    else if (left && !top) return [pts[1], pts[2], pts[3], pts[0]];
    else if (!left && top) return [pts[3], pts[0], pts[1], pts[2]];
    else return [pts[2], pts[3], pts[0], pts[1]];
}


function divRect(y1, x1, y2, x2){
    $.writeln('[y1, x1, y2, x2]    =>    [' + y1 + ', ' + x1 + ', ' + y2 + ', ' + x2 + ']');
    var h = Math.abs(y2)-Math.abs(y1);
    var w = x2-x1;
    var gH = h/1.618;
    var gW = w/1.618;
    $.writeln('[h, w, gH, gW]    =>    [' + h + ', ' + w + ', ' + gH + ', ' + gW + ']');
    if (Math.abs(y2)-Math.abs(y1) > x2-x1){
        var ln1 = [[x1, y2+gH], [x2, y2+gH]];
        var ln2 = [[x2-gW, y1], [x2-gW, y2+gH]];
    }
    else {
        var ln1 = [[x1+gW, y1], [x1+gW, y2]];
        var ln2 = [[x1+gW, y2+gH], [x2, y2+gH]];
    }
    $.writeln('ln1 =>                  ' + ln1);
    $.writeln('ln2 =>                  ' + ln2);
    var div1 = doc.pathItems.add();
    var div2 = doc.pathItems.add();
    div1.setEntirePath(ln1);
    div2.setEntirePath(ln2);
}