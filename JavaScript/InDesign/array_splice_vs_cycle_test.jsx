doc = app.activeDocument;
links = doc.links.everyItem().filePath.sort();

test(25);

function test (runs) {
    var funcName = 'testCycle',
        func = testCycle;
    $.writeln(funcName + ' x ' + runs);
    $.writeln(Number(new Date()));
    for (var n = 0; n < runs; n++)
        results = func(links);
    $.writeln(Number(new Date()));
}

function testSplice (links) {
    for (var i = links.length - 1; i > -1; i--) {
        if (links[i - 1] == links[i])
            links.splice(i, 1);
    }
    return links;
}

function testCycle (links) {
    for (var i = 0; i < links.length; i++) {
        if (links[0] !== links[links.length])
            links.push(links.shift());
        else
            links.shift();
    }
    return links;
}

/*
 * testSplice (25x) t1: 1529813044084
 * testSplice (25x) t2: 1529813044085
 * testCycle (25x) t1: 1529813044085
 * testCycle (25x) t2: 1529813044085
 * testSplice x 25
 * 1529813539151
 * 1529813539151
 * testCycle x 25
 * 1529813552821
 * 1529813552829
 */