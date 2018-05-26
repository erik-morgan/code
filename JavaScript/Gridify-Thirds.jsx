#target illustrator
var doc = app.activeDocument;
var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()];
var bounds = ab.artboardRect;
//bounds[3] = bounds[3] * -1;
bounds[2]/3
bounds[2]*2/3
bounds[3]/3
bounds[3]*2/3
var v1 = doc.pathItems.add();
var v2 = doc.pathItems.add();
v1.setEntirePath([[bounds[2]/3, 0], [bounds[2]/3, bounds[3]]]);
v2.setEntirePath([[bounds[2]*2/3, 0], [bounds[2]*2/3, bounds[3]]]);
var h1 = doc.pathItems.add();
var h2 = doc.pathItems.add();
h1.setEntirePath([[0, bounds[3]/3], [bounds[2], bounds[3]/3]]);
h2.setEntirePath([[0, bounds[3]*2/3], [bounds[2], bounds[3]*2/3]]);
v1.guides = v2.guides = h1.guides = h2.guides = true;