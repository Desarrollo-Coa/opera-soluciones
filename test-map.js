const https = require('https');

function test(url) {
    return new Promise((resolve) => {
        https.get(url, {
            headers: {
                'User-Agent': 'SGI-Opera-Soluciones/1.0 (Contact: dev@operasoluciones.com)',
                'Accept': 'image/png,image/*;q=0.8'
            }
        }, (res) => {
            console.log(url, res.statusCode);
            resolve(res.statusCode);
        }).on('error', (e) => {
            console.log(url, e.message);
            resolve(0);
        });
    });
}

async function run() {
    await test('https://maps.wikimedia.org/img/osm-intl,16,11.002,-74.808,600x350.png');
}
run();
