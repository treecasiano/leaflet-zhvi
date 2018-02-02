// var config = require(config/config.json);
// console.log('congif.keys', config.keys);
function getMap(){
	
	var myMap = L.map('map-id').setView([45.49, -122.743], 13);

// The URL format reflects the standardized structure of web
// mapping tilesets, which consist of 256x256 pixel images in a set of nested subdirectories on the tile
// server.
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox.streets',
		accessToken: 'pk.eyJ1IjoidGNhc2lhbm8iLCJhIjoiY2lzaWRwamQ0MDA0NTJwcHV3dmV2aWI5eSJ9.LZ_FxE38jClkNvqul1AGTg'
	}).addTo(myMap);

	var marker = L.marker([45.49, -122.743]).addTo(myMap);

	var circle = L.circle([45.49, -122.743], {
		color: 'black',
		fillColor: 'black',
		fillOpacity: 0.5,
		radius: 200
	}).addTo(myMap);

	var polygon = L.polygon([
		[45.75, -122.4],
		[45.52, -122.7],
		[45.8, -122.9]
	]).addTo(myMap);

	marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
	circle.bindPopup("I am a circle.");
	polygon.bindPopup("I am a polygon.");

	var popup = L.popup();

	function onMapClick(e) {
		popup
			.setLatLng(e.latlng)
			.setContent("You clicked the map at " + e.latlng.toString())
			.openOn(myMap);
	}

	myMap.on('click', onMapClick);

	var states = [{
		"type": "Feature",
		"properties": {"party": "Republican"},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[
				[-104.05, 48.99],
				[-97.22,  48.98],
				[-96.58,  45.94],
				[-104.03, 45.94],
				[-104.05, 48.99]
			]]
		}
	}, {
		"type": "Feature",
		"properties": {"party": "Democrat"},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[
				[-109.05, 41.00],
				[-102.06, 40.99],
				[-102.03, 36.99],
				[-109.04, 36.99],
				[-109.05, 41.00]
			]]
		}
	}];
	
	L.geoJSON(states, {
		style: function(feature) {
			switch (feature.properties.party) {
				case 'Republican': return {color: "#ff0000"};
				case 'Democrat':   return {color: "#0000ff"};
			}
		}
	}).addTo(myMap);


	function onEachFeature(feature, layer) {
		// does this feature have a property named popupContent?
		if (feature.properties && feature.properties.popupContent) {
			layer.bindPopup(feature.properties.popupContent);
		}
	}
	
	var geojsonFeature = {
		"type": "Feature",
		"properties": {
			"name": "Random Point in London",
			"amenity": "unknown",
			"popupContent": "London is beautiful!"
		},
		"geometry": {
			"type": "Point",
			"coordinates": [-0.03, 51.5]
		}
	};
	
	L.geoJSON(geojsonFeature, {
		onEachFeature: onEachFeature
	}).addTo(myMap);

}

$(document).ready(getMap);

// https://api.jquery.com/category/ajax/shorthand-methods/
// http://leafletjs.com/reference-1.3.0.html#map-example 

 