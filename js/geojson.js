function getMap(){

    var myMap;
    var geojsonMarkerOptions;
    
    // default values
    var myCenterCoords = [39.8097, -98.5556];  
    var defaultZoom = 4
    
    var tileLayerUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var tileLayerAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

    // create leaflet objects
    myMap = L.map('map-id').setView(myCenterCoords, defaultZoom);
        
	L.tileLayer(tileLayerUrl, {
		attribution: tileLayerAttrib,
		maxZoom: 18,

	}).addTo(myMap);

    getData(myMap);

    function getData(map) {
        $.ajax('data/metroRegionsZHVI2017.geojson', {
            dataType: 'json',
            success: function(response) {
                var attribute  = "2017-01";
                var geojsonLayer = L.geoJson(response, {
                    filter: filterFeatures,
                    pointToLayer: function (feature, latlng) {
                        var attributeValue = Number(feature.properties[attribute]);
                        console.log(feature.properties, attributeValue);
                        geojsonMarkerOptions.radius = calculateSymbolRadius(attributeValue);
                        return L.circleMarker(latlng, geojsonMarkerOptions);
                    },
                    onEachFeature: onEachFeature
                });

                map.addLayer(geojsonLayer);
    
            }
        });  
    }

    var geojsonMarkerOptions =  {
        radius: 5,
        fillColor: "#8B008B",
        color: "#000",
        weight: 1, 
        opacity: 1, 
        fillOpacity: 0.9
    }

    // helper functions and options

    function calculateSymbolRadius(attrValue) {
        var scaleFactor = .0006;
        var area = attrValue * scaleFactor; 
        var radius = Math.sqrt(area/Math.PI);
        return radius;
    }

    function filterFeatures(feature, layer) {
        return true;
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