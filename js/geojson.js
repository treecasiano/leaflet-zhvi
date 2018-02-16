function getMap(){

    var myMap;
    // default values
    var myCenterCoords = [39.8097, -98.5556];
    var defaultZoom = 4;

	var infoContainer = $('#info-container');

    myMap = L.map('map').setView(myCenterCoords, defaultZoom);

    L.tileLayer.provider('CartoDB.Positron').addTo(myMap);

    getData(myMap);

    function getData(map) {
        $.ajax('data/metroRegionsZHVI.geojson', {
            dataType: 'json',
            success: function(response) {
                var attributes = processData(response);

                var geojsonLayer = L.geoJson(response, {
                    pointToLayer: function(feature, latlng) {
                        return pointToLayer(feature, latlng, attributes);
                    }
                });

                map.addLayer(geojsonLayer);

                createSequenceControls(map, attributes);

            }
        });
    }

    function pointToLayer(feature, latlng, attributes) {
        var attribute  = attributes[0];
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

        var popupContent = updatePopupContent(feature.properties, attribute);

        layer.bindPopup(popupContent, {
            offset: new L.Point(0, -geojsonMarkerOptions.radius)
        });

        var timePeriod = formatTimePeriod(attribute);
        infoContainer.html(timePeriod);

        return layer;
    }

    function processData(data) {
        var attributes = [];
        var properties = data.features[0].properties;
        for (var attribute in properties) {
            // retrieve all the years starting with 2000
            if (attribute.indexOf('2') > -1) {
                attributes.push(attribute);
            }
        }
        return attributes;
    }

    function createSequenceControls(map, attributes) {
        var sequenceControlsContainer = $('#sequence-controls-container');
        sequenceControlsContainer.append('<input id="range-slider" class="range-slider" type="range">');
        var slider = $('#range-slider');
        // slider attributes
        slider.attr({
            max: attributes.length,
            min: 0,
            value: 0,
            step: 1
        });
        sequenceControlsContainer.append('<div id="sequence-button-container"></div>');
        $('#sequence-button-container').append('<button id="reverse-button" class="sequence-buttons" aria-label="Reverse"></button>');
        $('#sequence-button-container').append('<button id="forward-button" class="sequence-buttons" aria-label="Forward"></button>');
        $('#reverse-button').append('<i class="fas fa-step-backward" aria-hidden="true"></i>');
        $('#forward-button').append('<i class="fas fa-step-forward" aria-hidden="true"></i>');

        $('.sequence-buttons').click(function() {
            var index = slider.val();
            if ($(this).attr('id') === 'forward-button') {
                index++;
                index = index > attributes.length ? 0 : index;
            } else if ($(this).attr('id') === 'reverse-button') {
                index--;
                index = index < 0 ? attributes.length  : index;
            }

            slider.val(index);
            updatePropSymbols(map, attributes[index]);
        });

        slider.click(function() {
            var index = $(this).val();
            updatePropSymbols(map, attributes[index]);
        });

    }

    function calculateSymbolRadius(attrValue) {
        var scaleFactor = .0025;
        var area = attrValue * scaleFactor;
        return Math.sqrt(area / Math.PI);
    }

    function formatMonth(zhviAttr) {
        // takes the Zillow header string formatted as YYYY/MM and returns the month in English
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

    function formatTimePeriod(attribute) {
        return "<p><strong>" + formatMonth(attribute) + "&nbsp;" + getYear(attribute) + "</strong></p>";
    }

    function getYear(zhviAttr) {
        return zhviAttr.slice(0,4);
    }

    function updatePopupContent(props, attribute) {
        var attributeValue = Number(props[attribute]);
        var header = formatTimePeriod(attribute);
        var cityDisplayName = "<p><strong>City:</strong> " + props.regionName + "</p>";
        var attributeDisplayText = "<p><strong>Median Home Value: </strong>" + formatCurrency(attributeValue) + "</p>";
        return header + cityDisplayName + attributeDisplayText;
    }

    function updatePropSymbols(map, attribute) {
        map.closePopup();
        map.eachLayer(function(layer) {
            if (layer.feature && layer.feature.properties[attribute]) {
                // update the layer style and popup
                var props = layer.feature.properties;
                var radius = calculateSymbolRadius(props[attribute]);
                var timePeriod = formatTimePeriod(attribute);
                infoContainer.html(timePeriod);
                var popupContent = updatePopupContent(props, attribute);

                layer.setRadius(radius);
                layer.bindPopup(popupContent, {
                    offset: new L.Point(0, -radius)
                });


            }
        });
    }
}

$(document).ready(getMap);
