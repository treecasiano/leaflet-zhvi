function getMap(){

    var myMap;
    
    // default values
    var myCenterCoords = [20, 0];
    var defaultZoom = 2
    var tileLayerUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var tileLayerAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

    // create leaflet objects
    myMap = L.map('map-id').setView(myCenterCoords, defaultZoom);
        
	L.tileLayer(tileLayerUrl, {
		attribution: tileLayerAttrib,
		maxZoom: 13,

	}).addTo(myMap);

    getData(myMap);

    function getData(map) {
        $.ajax('data/metroRegionsZHVI.geojson', {
            dataType: 'json',
            success: function(response) {
            
                var geojsonLayer = L.geoJson(response);
                var markers = L.markerClusterGroup();
                markers.addLayer(geojsonLayer);
                map.addLayer(markers);
            }
        });  
    }

}

$(document).ready(getMap);