// manage qbt-cookie in python (look up timeout of webui cookie)
let dls = document.getElementsByClassName('plus');
for (dl of dls) {
    dl.addEventListener('click', function (e) {
        mag = e.target.getAttribute('data-mag');
        // SEND TO /qbt ENDPOINT
        fetch('/qbt', {
            method: 'POST',
            body: data
            // OR '&#x2713'
        }).then(response => e.target.innerText = String.fromCharCode(2713));
        /*
            USING WEBSOCKET WITH PYTHON HANDLING THIS STUFF:
                Open the socket outsids of the loop
            
            var sock = new WebSocket('ws://localhost:##');
            sock.onopen = function (event) {
                sock.send(mag);
            };
            // attach this to window so socket closes when window closes
            sock.close();
        */
    }
}

// TABLE SORTING FUNCTION
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