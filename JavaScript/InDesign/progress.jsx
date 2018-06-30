// Processing File: #/###
// [|||||||||||||||||||||||||||##%|||||||||||||||||||||||||||]
// Name: PROCID####/##/##.indd
// Speed: ##s per file
// Time Remaining: ##:##

function ProgressBar (max) {
    this.num = 0;
    this.total = max;
}

/*
 * IMPORTANT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * JUST ADD THESE METHODS AND PROPERTIES TO THE WINDOW OBJECT
 * (but then there is no reference to pass back to processINDD)
 * !!! pass ProgressBar constructor a function to register observers (ProgressBar methods)
 */

ProgressBar.prototype.init = function () {
    var w = new Window('dialog', 'processINDD Progress'),
        x = '';
    this.bar = w.add('progressbar', undefined, 0, 0, this.total);
};

// ROW 1
g = w.add('group', {orientation: 'row', alignment: 'fill', alignChildren: 'left'});
g.add('statictext', undefined, 'Processing File: ');
num = g.add('statictext', undefined, '0');
g.add('statictext', undefined, '/' + this.total, {alignment: 'fill'});

// PROGRESS BAR: set up a basic observer pattern in processINDD
g = w.add('group', {orientation: 'stack', alignment: 'fill', alignChildren: 'fill'});
bar = g.add('progressbar', undefined, 0, 0, this.total);
percent = g.add('staticText', undefined, '0%', {justify: 'center'});

// PANEL FOR ROWS 3-5?
// p = w.add('panel')

// ROW 3
g = w.add('group', {orientation: 'row', alignChildren: 'left'});
g.add('statictext', undefined, 'Name: ');
name = g.add('statictext', undefined, '0');

// ROW 4
g = w.add('group', {orientation: 'row', alignChildren: 'left'});
g.add('statictext', undefined, 'Speed: ');
speed = g.add('statictext', undefined, '0');
g.add('statictext', undefined, 's/file');

// ROW 5
g = w.add('group', {orientation: 'row', alignChildren: 'left'});
g.add('statictext', undefined, 'Time Remaining: ');
min = g.add('statictext', undefined, '00');
g.add('statictext', undefined, ':');
sec = g.add('statictext', undefined, '00');

// ADD CANCEL BUTTON

// CREATE TIMER FOR TIME ELAPSED
// CALC SPEED VIA TIMER / NUM
// CALC ETA BY SPEED * (TOTAL - NUM)