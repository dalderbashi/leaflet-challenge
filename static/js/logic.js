// Define function to set the circle color based on the magnitude
function circleColor(magnitude) {
    if (magnitude < 1) {
        return "#fbe6c5"
    } else if (magnitude < 2) {
        return "#f5ba98"
    } else if (magnitude < 3) {
        return "#ee8a82"
    } else if (magnitude < 4) {
        return "#dc7176"
    } else if (magnitude < 5) {
        return "#9c3f5d"
    } else {
        return "#70284a"
    }
}

function createMap(earthquakes, plateLines) {
    // Adding tile layer
    // Create the tile layer that will be the background of our map
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
        maxZoom: 5,
        id: "mapbox.light",
        accessToken: API_KEY
    });


    var streets = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {
        "Light Map": lightmap,
        "Street Map": streets

    };


    //Create an overlayMaps object to hold the earthquakes  and the fault lines layers
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Fault Lines": plateLines
    };

    // Create the map object with options
    var map = L.map("map", {
        center: [36.778259, -119.41793],
        zoom: 5,
        layers: [lightmap, streets, earthquakes, plateLines]
    });

    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);

    // Create a legend to display information about our map
    var info = L.control({
        position: "bottomright"
    });

    // When the layer control is added, insert a div with the class of "legend"
    info.onAdd = function() {
        var div = L.DomUtil.create("div", "legend");
        var mags = [0, 1, 2, 3, 4, 5];

        mags.forEach(mag => {
            let magRange = `${mag}-${mag+1}`;
            if (mag === 5) {
                magRange = `${mag}+`
            }
            var magColor = circleColor(mag);
            var html = `
                <div class="legend-item"> 
                    <div style="height: 25px; width: 25px; background-color:${magColor}"> </div>
                    <div class=legend-text>${magRange}</div>
                </div>
            `
            div.innerHTML += html
        });
        return div;
    };
    // Add the info legend to the map
    info.addTo(map);
}

function createMarkers(earthquakeResponse, platesResponse) {
    console.log('quake', earthquakeResponse)
    console.log('plate', platesResponse)

    // Pull the "features" property off of response.data
    var earthquakeFeatures = earthquakeResponse.features;

    // Initialize an array to hold earthquake markers
    var earthquakeMarkers = [];


    // Loop through the features array
    earthquakeFeatures.forEach(feature => {
        // For each station, create a marker and bind a popup with the station's name
        var earthquakeMarker = L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            color: "black",
            weight: 1,
            fillColor: circleColor(feature.properties.mag),
            fillOpacity: 1,
            radius: feature.properties.mag * 20000
        })

        .bindPopup("<h3> Magnitude: " + feature.properties.mag + "<h3><h3>Location: " + feature.properties.place + "<h3>");

        // Add the marker to the earthquakeMarkers array
        earthquakeMarkers.push(earthquakeMarker);

    });

    //cretae plateLines layer
    var plateLines = L.geoJSON(platesResponse, {
        style: function() {
            return { color: "yellow", fillOpacity: 0 }
        }
    })

    // Create a layer group made from the earthqauke markers array, pass it into the createMap function
    createMap(L.layerGroup(earthquakeMarkers), plateLines);


}

// Perform an API call to the usgs API to get the earthqaukeinformation. And then a call to get the fault lines data.  Call createMarkers when complete
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson", function(earthquakeResponse) {
    d3.json("static/data/PB2002_plates.json", function(platesResponse) {
        createMarkers(earthquakeResponse, platesResponse)
    });
});