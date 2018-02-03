function getMap(){

    var geojsonMarkerOptions;
	var myMap;
    
    // default values
    var myCenterCoords = [20, 0];
    var defaultZoom = 2
    var tileLayerUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var tileLayerAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

    myMap = L.map('map-id').setView(myCenterCoords, defaultZoom);
        
	L.tileLayer(tileLayerUrl, {
		attribution: tileLayerAttrib,
		maxZoom: 13,

	}).addTo(myMap);

    getData(myMap);

    function getData(map) {
        $.ajax('data/megaCities.geojson', {
            dataType: 'json',
            success: function(response) {
            
                // create a Leaflet GeoJSON layer and add it to the map
                L.geoJson(response, {
                    filter: filterFeatures,
                    pointToLayer: function (feature, latlng) {
                        return L.circleMarker(latlng, geojsonMarkerOptions);
                    },
                    onEachFeature: onEachFeature
                }).addTo(map);
            }
        });  
    }

    // helper functions, implementation details, and options

    var geojsonMarkerOptions =  {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1, 
        opacity: 1, 
        fillOpacity: 0.8
    }

    function filterFeatures(feature, layer) {
        return feature.properties.Pop_2015 > 20;
    }

    function onEachFeature(feature, layer) {
    
        var popupContent = "";

        if (feature.properties) {
            for (var property in feature.properties) {
                popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
            }
            layer.bindPopup(popupContent);
        }
    }
}

$(document).ready(getMap);