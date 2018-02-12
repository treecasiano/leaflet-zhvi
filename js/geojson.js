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
                
                var geojsonLayer = L.geoJson(response, {
                    pointToLayer: pointToLayer
                });

                map.addLayer(geojsonLayer);
    
            }
        });  
    }

    function pointToLayer(feature, latlng) {
        var attribute  = "2017-01";
        var attributeValue = Number(feature.properties[attribute]);
        var geojsonMarkerOptions =  {
            radius: 5,
            fillColor: "#8B008B",
            color: "#000",
            weight: 1, 
            opacity: 1, 
            fillOpacity: 0.9
        }     

        geojsonMarkerOptions.radius = calculateSymbolRadius(attributeValue);

        var layer = L.circleMarker(latlng, geojsonMarkerOptions);

        var cityDisplayName = "<p><strong>City:</strong> " + feature.properties.regionName + "</p>";
        var attributeDisplayText = "<p><strong>Attribute:</strong> " + feature.properties[attribute] + "</p>";
        var popupContent = cityDisplayName + attributeDisplayText;
        layer.bindPopup(popupContent);
        return layer;
    }

    function calculateSymbolRadius(attrValue) {
        var scaleFactor = .0006;
        var area = attrValue * scaleFactor; 
        var radius = Math.sqrt(area/Math.PI);
        return radius;
    }

}

$(document).ready(getMap);