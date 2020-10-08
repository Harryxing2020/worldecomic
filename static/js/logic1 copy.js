///////////////////////////////////////////////////////////////////////
// Main entrance 
///////////////////////////////////////////////////////////////////////

// Use this link to get the geojson data.
var link = "static/data/countries.geo.json";
// Grabbing our GeoJSON data..
d3.json(link, function (countryData) {

  createFeatures(countryData)

});

///////////////////////////////////////////////////////////////////////
// Main entrance end
///////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////
// function1: return the color value 
///////////////////////////////////////////////////////////////////////

function getColorValue(number) {

  if (number >= 50000) {
    return 'green'
  } else if (number >= 35000) {
    return '#32CD32'
  } else if (number >= 20000) {
    return '#00FA9A'
  } else if (number >= 10000) {
    return '#FF8C00'
  } else if (number >= 5000) {
    return '#FFA07A'
  } else if (number >= 2000) {
    return '#FF00FF'
  } else if (number > 0) {
    return '#B22222'
  } else {
    return '#B22222'
  }
}


///////////////////////////////////////////////////////////////////////
// function1: end
///////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////
// function2: filtering the json doc by country namne 
///////////////////////////////////////////////////////////////////////

function chooseColor(countryName) {

  function findCountry(country) {
    if ((country.country.toLowerCase() === countryName.toLowerCase()) ||
      ((countryName === 'United States of America') && (country.country === 'United States'))) {
      return true;
    } else {
      return false;
    }
  }
  // filter() uses the custom function as its argument
  country = country_info.filter(findCountry);


  if (country.length > 0) {
    // if found the data recore in dataset
    return getColorValue(country[0].gdp_per_capita)
  } else {
    // if not found return a blank color 
    return getColorValue(0)
  }

}
///////////////////////////////////////////////////////////////////////
// function2: end 
///////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////
// function3: add Legend
///////////////////////////////////////////////////////////////////////

function addLegend() {
  // Create a legend for the map
  var legend = L.control({ position: 'bottomleft' });
  // Legend will be called once map is displayed
  legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend');

    var legendInfo = "<p>GDP per capita (Int$)</p>";

    div.innerHTML = legendInfo;

    // setup the depth 
    var limits = [0, 2000, 5000, 10000, 20000, 35000, 50000];
    // Loop through our magnitude intervals and generate a label with a colored square for each interval
    for (var i = 0; i < limits.length; i++) {
      var newHtml = `<i style="background: ${getColorValue(limits[i])}"></i>`;
      newHtml += limits[i] + (limits[i + 1] ? '&ndash;' + limits[i + 1] + '<br>' : '+');
      div.innerHTML += newHtml;
    }

    return div;
  };
  // Add the legend to the map
  return legend;
}

///////////////////////////////////////////////////////////////////////
// function3: end 
///////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////
// function4: create circles and tectonicplates
///////////////////////////////////////////////////////////////////////
function createFeatures(countryData) {
  var myMap = L.map("map", {
    center: [24.699175, 7.118681],
    zoom: 3
  });

  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  }).addTo(myMap);



  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var choroplethMap =
    L.geoJson(countryData, {
      // Style each feature (in this case a neighborhood)
      style: function (feature) {
        return {
          color: "white",
          // Call the chooseColor function to decide which color to color our neighborhood (color based on borough)
          fillColor: chooseColor(feature.properties.admin),
          fillOpacity: 0.5,
          weight: 1.5
        };
      },
      // Called on each feature
      onEachFeature: function (feature, layer) {
        // Set mouse events to change map styling
        layer.on({
          // When a user's mouse touches a map feature, the mouseover event calls this function, that feature's opacity changes to 90% so that it stands out
          mouseover: function (event) {
            layer = event.target;
            layer.setStyle({
              fillOpacity: 0.9
            });
          },
          // When the cursor no longer hovers over a map feature - when the mouseout event occurs - the feature's opacity reverts back to 50%
          mouseout: function (event) {
            layer = event.target;
            layer.setStyle({
              fillOpacity: 0.5
            });
          },
          // When a feature (neighborhood) is clicked, it is enlarged to fit the screen
          click: function (event) {
            myMap.fitBounds(event.target.getBounds());
          }
        });

        var popupString = `<h3>Country: ${feature.properties.admin}</h3><hr>`;
        function findCountry(country) {
          if ((country.country.toLowerCase() === feature.properties.admin.toLowerCase()) ||
            ((feature.properties.admin === 'United States of America') && (country.country === 'United States'))) {

            var nf = Intl.NumberFormat();
            popupString += `<h3>Populcation: ${nf.format(country.population)}</h3>`;
            popupString += `<h3>Populcation growth rate: ${nf.format(country.growthrate * 100)}%</h3>`;
            popupString += `<h3>GDP per Capita: ${nf.format(country.gdp_per_capita)} USD</h3>`;
            popupString += `<h3>Country Size: ${nf.format(country.countrysize)} (km²)</h3>`;
            popupString += `<h3>Happiest: ${nf.format(country.happiestScore)} Score</h3>`;
            // popupString += `<h3>Co2 Emissions: ${country.co2_emissions} (Mt CO2/yr)</h3>`;
            return true;
          } else {

            return false;
          }

        }
        // filter() uses the custom function as its argument
        findCountry = country_info.filter(findCountry);
        if (findCountry.length == 0) {
          popupString += `<h3>Data is not available for the country. </h3>`;
        }
        layer.bindPopup(popupString);

      }
    }).addTo(myMap);


  createMap(choroplethMap, myMap)

}

///////////////////////////////////////////////////////////////////////
// function4: end
///////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////
// function5: create the map 
///////////////////////////////////////////////////////////////////////
function createMap(choroplethMap, myMap) {

  // Adding tile layer
  var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  })

  // Define streetmap and darkmap layers
  var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    maxZoom: 18,
    id: "mapbox.satellite", //satellite
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Grayscale": grayscaleMap,
    "Satellite": satelliteMap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Choropleth": choroplethMap
  };

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  addLegend().addTo(myMap);
  
}


///////////////////////////////////////////////////////////////////////
// function5: end
///////////////////////////////////////////////////////////////////////

