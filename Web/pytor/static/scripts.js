var opts = { sensitivity: 'base', numeric: true },
    table = document.querySelector('.results'),
    tbase = table.cloneNode(true),
    compare = (a1, a2, ix) => a1[ix].localeCompare(a2[ix], undefined, opts),
    addMagnet = (target, mag) => {
        target.addEventListener('click', () => {
            this.setAttribute('data-mag', mag);
            fetch('/qbt', {
                method: 'POST',
                body: mag
            }).then(() => target.innerText = String.fromCharCode(2713) && target.disabled = true);
        });
    };

function torSearch (formObject) {
    var spinner = document.createElement('div');
    spinner.className = 'spinner';
    if (table.children.length > 1) table.parentNode.replaceChild(table, tbase);
    table.style.display = 'none';
    table.appendChild(spinner);
    fetch('/search', {
        method: 'GET',
        body: URLSearchParams('query=' + formObject['search-bar'].value)
    }).then((resp) => resp.json());
    .then((torObj) => {
        if (torObj.status !== 'OK') {
            table.appendChild(document.createElement('h2')).innerText = torObj.status;
            return;
        }
        var tree = document.createDocumentFragment(),
            rowTemplate = document.getElementById('torTemplate');
        torObj.torrents.map((tor) => {
            let row = rowTemplate.content.cloneNode(true);
            row.children[0].innerText = tor[0];
            row.children[1].innerText = tor[1].size;
            row.children[1].setAttribute('data-bytes', tor[1].bytes);
            row.children[2].innerText = tor[2];
            addMagnet(row.querySelector('.plus'), tor[3]);
            tree.appendChild(row);
        });
        table.replaceChild(spinner, tree);
        table.style.display = 'block';
    });
}

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