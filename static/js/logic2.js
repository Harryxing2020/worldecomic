
///////////////////////////////////////////////////////////////////////
// function1: load data  
///////////////////////////////////////////////////////////////////////
function updataJsonData(countryData) {

  countryData.features.forEach(countryInfo => {

    var varcountryName = countryInfo.properties.admin
    function findCountry(country) {
      if ((country.country.toLowerCase() === varcountryName.toLowerCase()) ||
        ((varcountryName === 'United States of America') && (country.country === 'United States'))) {

        // add new feature for geojson
        countryInfo.properties.population = country.population;
        countryInfo.properties.growthrate = country.growthrate;
        countryInfo.properties.gdp_per_capita = country.gdp_per_capita;
        countryInfo.properties.countrysize = country.countrysize;
        countryInfo.properties.happiestScore = country.happiestScore;
        return true;
      } else {
        return false;
      }
    }
    // filter() uses the custom function as its argument
    country_info.filter(findCountry);
  })

}

///////////////////////////////////////////////////////////////////////
// function1: load data  
///////////////////////////////////////////////////////////////////////


// Creating map object
var myMap = L.map("map", {
  center: [24.699175, 7.118681],
  zoom: 3
});

// Adding tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
}).addTo(myMap);

// Load in geojson data
var geoData = "static/data/countries.geo.json";

var geojson;

// Grab data with d3
d3.json(geoData, function (data) {



  updataJsonData(data);

  // Create a new choropleth layer
  geojson = L.choropleth(data, {

    // Define what  property in the features to use
    valueProperty: "happiestScore",
    // valueProperty: "pop_est",
    // Set color scale
    scale: ["red", "green"],

    // Number of breaks in step range
    steps: 10,

    // q for quartile, e for equidistant, k for k-means
    mode: "q",
    style: {
      // Border color
      color: "#fff",
      weight: 1,
      fillOpacity: 0.8
    },

    // Binding a pop-up to each layer
    onEachFeature: function (feature, layer) {

      var popupString = `<h3>Country: ${feature.properties.admin}</h3><hr>`;

      var nf = Intl.NumberFormat();
      popupString += `<h3>Populcation: ${nf.format(feature.properties.population)}</h3>`;
      popupString += `<h3>Populcation growth rate: ${nf.format(feature.properties.growthrate * 100)}%</h3>`;
      popupString += `<h3>GDP per Capita: ${nf.format(feature.properties.gdp_per_capita)} USD</h3>`;
      popupString += `<h3>Country Size: ${nf.format(feature.properties.countrysize)} (km²)</h3>`;
      popupString += `<h3>Happiest: ${nf.format(feature.properties.happiestScore)} Score</h3>`;

      layer.bindPopup(popupString);
    }
  }).addTo(myMap);


});
