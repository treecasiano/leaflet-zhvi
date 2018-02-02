function getMap(){

	var myMap;
    var myCenterCoords = [20, 0];
    var defaultZoom = 2
	
    myMap = L.map('map-id').setView(myCenterCoords, defaultZoom);
    
    var tileLayerUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var tileLayerAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

	L.tileLayer(tileLayerUrl, {
		attribution: tileLayerAttrib,
		maxZoom: 13,

	}).addTo(myMap);

    getData(myMap);
}

function getData(map) {
    $.ajax('data/megaCities.geojson', {
        dataType: 'json',
        success: function(response) {
            // create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response).addTo(map);
        }
    });  
}

$(document).ready(getMap);