let e1 = +(i < 2) ? r1.cells[i].getAttribute('data-bytes') : r1.cells[i].innerHTML,
    e2 = +(i < 2) ? r2.cells[i].getAttribute('data-bytes') : r2.cells[i].innerHTML;
// while (!sorted) {
//     for (let x = 0; x < numRows; x++) {
//         for (let y = 0; y < numRows - x - 1; y++) {
//
//         }
//     }
// }
function sortResults (col) {
    var tbody = document.getElementById('results-body');
    var dir = (headers[col].className == 'sort-asc') ? 'sort-dsc' : 'sort-asc';
    headers[col].className = dir
    for (var i = 0; i < headers.length; i++) {
        if (i !== col) headers[i].removeAttribute('class')
    }
    var results = [];
    var rows = tbody.getElementsByTagName('tr');
    var numRows = rows.length;
    for (var r = 0; r < numRows; r++) {
        var row = rows[r];
        results.push([row.children[col].innerHTML.toUpperCase(), row]);
    }
    if (col){
        results.sort(function (a, b) {
            return parseFloat(a[0]) - parseFloat(b[0]);
        });
    }
    else {
        results.sort(function (a, b) {
            if (a[0] < b[0]) return -1;
            if (a[0] > b[0]) return 1;
            return 0;
        });
    }
    if (dir == 'sort-dsc') results.reverse();
    var len = results.length;
    for (var i = 0; i < len; i++) {
        tbody.append(results[i][1]);
    }
}
