function getMap(){

    var myMap;
    // default values
    var myCenterCoords = [39.8097, -98.5556];
    var defaultZoom = 4;

    var tileLayerUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var tileLayerAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

    // create leaflet objects
    myMap = L.map('map').setView(myCenterCoords, defaultZoom);

	L.tileLayer(tileLayerUrl, {
		attribution: tileLayerAttrib,
		maxZoom: 18

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
        };

        geojsonMarkerOptions.radius = calculateSymbolRadius(attributeValue);

        var layer = L.circleMarker(latlng, geojsonMarkerOptions);
        var popupHeader = "<p><strong>" + formatMonth(attribute) + "&nbsp;2017</strong></p>";
        var cityDisplayName = "<p><strong>City:</strong> " + feature.properties.regionName + "</p>";
        var attributeDisplayText = "<p><strong>Median Home Value: </strong>" + formatCurrency(attributeValue) + "</p>";

        var popupContent = cityDisplayName;
        var panelContent = popupHeader + cityDisplayName + attributeDisplayText;

        layer.bindPopup(popupContent, {
            offset: new L.Point(0, -geojsonMarkerOptions.radius),
            closeButton: false
        });

        layer.on({
            mouseover: function() {
                this.openPopup();
            },
            mouseout: function() {
                this.closePopup();
            },
            click: function() {
                $('#panel').html(panelContent);
            }
        });

        return layer;
    }

    function calculateSymbolRadius(attrValue) {
        var scaleFactor = .0006;
        var area = attrValue * scaleFactor;
        return Math.sqrt(area / Math.PI);
    }

    function formatMonth(zhviAttr) {
        var monthsOfYear = {
           '01': 'January',
           '02': 'February',
           '03': 'March',
           '04': 'April',
           '05': 'May',
           '06': 'June',
           '07': 'July',
           '08': 'August',
           '09': 'September',
           '10': 'October',
           '11': 'November',
           '12': 'December'
        };
        var monthString = zhviAttr.slice(-2);
        return monthsOfYear[monthString];
    }

    function formatCurrency(dollarValue) {
        // syntax numObj.toLocaleString([locales [, options]])
        return dollarValue.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0
        });
    }
}

$(document).ready(getMap);
