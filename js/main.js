function getMegaCities(){
	
	var mydata;

	$.ajax("data/MegaCities.geojson", {
		dataType: "json",
		success: function(response){
			mydata = response;
			callback(mydata);
		}
	});
}

function callback(mydata){
	
	$("#mydiv").append('GeoJSON data #1: ' + JSON.stringify(mydata, undefined, 4));
}

$(document).ready(getMegaCities);

// https://api.jquery.com/category/ajax/shorthand-methods/


 