// manage qbt-cookie in python (look up timeout of webui cookie)
var addTorrent = (target) => {
    target.addEventListener('click', (e) => {
        let mag = e.target.getAttribute('data-mag');
        fetch('/qbt', {
            method: 'POST',
            body: mag
        }).then(() => (e.target.innerText = String.fromCharCode(2713)));
    });
    return undefined;
};
Array.from(document.getElementsByClassName('plus')).map(addTorrent);

// if doing single-page updates, receive info as json, and create a map with data (mag hashes as keys)
// ADD TITLES TO EVERY TNAME
// CONSIDER FILTERING DUPLICATE NAME/SIZE IN ADDITION TO HASHES
//     BC OF PERIOD/NON-PERIOD VARIATIONS & TITLES VS INNERHTML
// TIME SORT USING FOREACH VS MAP ON LINE 23

var opts = { sensitivity: 'base', numeric: true },
    table = document.querySelector('.results'),
    compare = (a1, a2, ix) => a1[ix].localeCompare(a2[ix], undefined, opts);
document.querySelectorAll('.head').forEach((head, i) => {
    head.addEventListener('click', (e) => {
        let rows = Array.from(document.querySelectorAll('.tor:not(.header)')),
            rowData = rows.map((row, index) => [
                row.children[0].innerHTML,
                row.children[1].getAttribute('data-bytes'),
                row.children[2].innerHTML,
                index
            ]),
            dir = head.classList.contains('sorta') ? -1 : 1;
        table.querySelector('[class*=sort]').classList.remove('sorta', 'sortd');
        head.classList.add(dir > 0 ? 'sorta' : 'sortd');
        rowData.sort((a, b) => compare(a, b, i) * dir || (i ? compare(a, b, 0) : compare(b, a, 2)));
        rowData.map(row => table.appendChild(rows[row[3]]));
    });
});
