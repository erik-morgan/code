// or just put onclick in html and grab event
let dls = document.getElementsByClassName('download');
for (dl of dls) {
    dl.addEventListener('click', function (e) {
        addTorrent(e.target.getAttribute('href'));
    }
}

// OR MAKE HREF POINT TO PYTHON FOR QBT
// switching to jquery for easy requests
function addTorrent (link) {
    if (!sessionStorage.getItem('qbt')) {
        $.ajax({
            url: 'http://192.168.1.71:8080/login',
            type: 'POST',
            headers: {
                'Referrer': 'http://192.168.1.71:8080',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                'username': 'admin',
                'password': 'password'
            },
            success: function (jqxhr) {
                // test whether i also get the path part
                sessionStorage.setItem('qbt', jqxhr.getResponseHeader('Set-Cookie').split('; '));
            }
        });
    }
    // localhost on the server
    $.ajax({
        url: 'http://192.168.1.71:8080/command/download',
        type: 'POST',
        headers: {
            'Referer': 'http://192.168.1.71:8080',
            'Cookie': sessionStorage.getItem('qbt'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
            'urls': link.replace(/&/g, '%26'),
            'sequentialDownload': true
        },
        success: function (jqxhr) {
            alert('Successfully added torrent!');
        }
    });
}

var headers = document.getElementsByTagName('th');
for (var i = 0; i < headers.length - 1; i++) {
    headers[i].addEventListener('click', function () {
        let tbody = document.getElementById('results-body'),
            rows = tbody.getElementsByTagName('tr'),
            results = tbody.getElementsByTagName('tr'),
            numRows = rows.length,
            sorted = false,
            dir = 1; // 1 = ascending && -1 = descending
        while (!sorted) {
            rows.sort(function (r1, r2) {
                let n1 = r1.cells[0].innerHTML.toUpperCase(),
                    n2 = r2.cells[0].innerHTML.toUpperCase();
                if (n1 < n2) return dir * 1;
                if (n1 > n2) return dir * -1;
                return 0;
            }
            if (i) {
                rows.sort(function (r1, r2) {
                    let e1 = i < 2 ? r1.cells[i].getAttribute('data-bytes') : r1.cells[i].innerHTML,
                        e2 = i < 2 ? r2.cells[i].getAttribute('data-bytes') : r2.cells[i].innerHTML;
                    return dir * (parseInt(e1) - parseInt(e2));
                })
            }
            for (var x = 0; x < numRows; x++) {
                if (rows[x] !== results[x]) break;
            }
            if (x == numRows) {
                dir *= -1;
            } else {
                sorted = true;
            }
        }
        for (let r = 0; r < numRows - 1; r++) {
            tbody.appendChild(rows[r]);
        }
    }
}

/*
    JS For:
        Download Buttons
        Adding to qbittorrent
*/
