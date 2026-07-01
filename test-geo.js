const topojson = require('topojson-client');
const { geoContains } = require('d3-geo');

async function test() {
    const res = await fetch('https://code.highcharts.com/mapdata/countries/co/co-all.topo.json');
    const data = await res.json();
    const features = topojson.feature(data, data.objects.default).features;

    // Barranquilla approx: 11.002, -74.808
    const pt = [-74.808, 11.002]; 
    console.log("Testing Point:", pt);

    let found = false;
    for (const geo of features) {
        if (geoContains(geo, pt)) {
            console.log("Found in:", geo.properties.name);
            found = true;
        }
    }
    if (!found) {
        console.log("Not found in any department.");
        console.log("Wait, let's look at the first geometry's coordinates:");
        console.log(JSON.stringify(features[0].geometry.coordinates[0][0]));
    }
}
test();
