function getMap(){

    var myMap;

    var myCenterCoords = [38.8097, -98.5556];
    var defaultZoom = getZoomValue();

    /*jQuery objects*/
    var infoContainer = $('#info-container');
    var infoPanel = $('#panel');
    var citiesByHomeValue = $('#cities-by-home-value');
	var citiesByMarketSize = $('#cities-by-market-size');
	var listTypeText = $('#list-type-text');

    /*tile layers*/
    var cartoDB = L.tileLayer.provider('CartoDB.Positron');
    var openStreetMap = L.tileLayer.provider('OpenStreetMap.BlackAndWhite');
    var stamenTonerLite = L.tileLayer.provider('Stamen.TonerLite');
    var baseMaps = {
        '<span class="tileLayer__text">CartoDB Positron</span>': cartoDB,
        '<span class="tileLayer__text">Open Street Map</span>': openStreetMap,
        '<span class="tileLayer__text">Stamen Toner Lite</span>': stamenTonerLite
    };

    // instantiate map
    myMap = L.map('map', {layers: [cartoDB]}).setView(myCenterCoords, defaultZoom);
    L.tileLayer.provider('CartoDB.Positron').addTo(myMap);
    L.control.layers(baseMaps).addTo(myMap);
    myMap.zoomControl.setPosition('bottomright');
    getData(myMap);

    // event listeners
    $(".tab__btn").click(function() {
        if ($(this).attr('id') === 'tab-btn-market-size') {
            citiesByHomeValue.hide();
            citiesByMarketSize.fadeIn('fast');
            $(this).addClass('active');
            $('#tab-btn-home-value').removeClass('active');
            listTypeText.html('');
            listTypeText.html('Market Size');
        } else if ($(this).attr('id') === 'tab-btn-home-value') {
            citiesByMarketSize.hide();
            citiesByHomeValue.fadeIn('fast');
            $(this).addClass('active');
            $('#tab-btn-market-size').removeClass('active');
            listTypeText.html('');
            listTypeText.html('Median Home Value');
        }
    });

    $('#panel-close').click(function() {
        hideInfoPanel();
    });

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

                sortCitiesByHomeValue();
                addSequenceControlsToMap(map, attributes);
                createLegend(map, attributes);
            }
        });
    }

    function addSequenceControlsToMap(map, attributes) {
        var SequenceControl = L.Control.extend({
            options: {
                position: 'bottomleft'
            },
            onAdd: function() {
                var sequenceControlsContainer = L.DomUtil.create('div', 'legend-control-container');
                $(sequenceControlsContainer).attr("id", 'sequence-controls-container');
                $(sequenceControlsContainer).on('mousedown dblclick pointerdown', function(e){
                    L.DomEvent.stopPropagation(e);
                });
                return sequenceControlsContainer;
            }

        });

        map.addControl(new SequenceControl());
        createSequenceControls(map, attributes);
    }

    function pointToLayer(feature, latlng, attributes) {
        var attribute  = attributes[0];
        var attributeValue = Number(feature.properties[attribute]);
        var geojsonMarkerOptions =  {
            radius: 5,
            fillColor: "#71a3be",
            color: "#ffffff",
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
        citiesByMarketSize.append(createCityListItem(feature.properties, attribute));
        citiesByHomeValue.append(createCityListItem(feature.properties, attribute));

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

    function createLegend(map, attributes) {
        var LegendControl = L.Control.extend({
            options: {
                position: 'bottomleft'
            },
            onAdd: function(map) {
                var legendContainer = L.DomUtil.create('div', 'legend-control-container');
                var temporalLabel = L.DomUtil.create('div', 'legend-control-temporal-label');
                var svgContainer = L.DomUtil.create('div', 'legend-svg-container');
                var infoButtonContainer = L.DomUtil.create('div', 'info-button-container');
                $(infoButtonContainer).attr("id", 'info-button-container');
                $(infoButtonContainer).html('<button title="View List of Cities" id="info-button"><i class="fas fa-info-circle"></i></button>');
                var timePeriod = formatTimePeriod(attributes[0]);
                var svg = '<svg id="attribute-legend" width="200px" height="80px">';
                var circles = ['max', 'mean', 'min'];
                var circleValues = getCircleValues(map, attributes[0]);
                var yValues = [25, 50, 75];
                for (var i=0; i<circles.length; i++) {
                    var radius = calculateSymbolRadius(circleValues[circles[i]]);
                    var cy = 79-radius;
                    var legendText = formatCurrency(Math.round(circleValues[circles[i]]*100)/100) + '&nbsp;' +  circles[i];
                    var y = yValues[i];
                    // circle string
                    svg += '<circle class="legend-circle" id="' + circles[i] +
                        '" fill="#71a3be" fill-opacity="0.8" stroke="lightgray" ' +
                        'cx="50" cy="' + cy +
                        '" r="' + radius + '" />';

                    // text string
                    svg += '<text class="legend-text" fill="#71a3be" id="' + circles[i] + '-text" x="100" y="' + y + '">' + legendText + '</text>'
                }
                svg += "</svg>";
                $(legendContainer).append($(infoButtonContainer));
                $(legendContainer).append($(temporalLabel));
                $(temporalLabel).html(timePeriod);
                $(legendContainer).append($(svgContainer));
                $(svgContainer).append(svg);
                $(legendContainer).on('mousedown dblclick pointerdown', function(e){
                    L.DomEvent.stopPropagation(e);
                });

                return legendContainer;
            }
        });

        map.addControl(new LegendControl());
        $('#info-button').click(function() {
            infoPanel.fadeToggle();
        });
    }

    function createSequenceControls(map, attributes) {
        var sequenceControlsContainer = $('#sequence-controls-container');
        sequenceControlsContainer.append('<input id="range-slider" class="range-slider" type="range">');
        var slider = $('#range-slider');
        // slider attributes
        slider.attr({
            max: attributes.length - 1,
            min: 0,
            value: 0,
            step: 1
        });
        sequenceControlsContainer.append('<div id="sequence-button-container"></div>');
        var sequenceButtonContainer = $('#sequence-button-container');
        sequenceButtonContainer.append('<button id="fast-reverse-button" class="sequence-buttons" aria-label="Fast Reverse"></button>');
        sequenceButtonContainer.append('<button id="reverse-button" class="sequence-buttons" aria-label="Reverse"></button>');
        sequenceButtonContainer.append('<button id="forward-button" class="sequence-buttons" aria-label="Forward"></button>');
        sequenceButtonContainer.append('<button id="fast-forward-button" class="sequence-buttons" aria-label="Fast Forward"></button>');
        $('#fast-reverse-button')
            .attr('title', 'Reverse by Year')
            .append('<i class="fas fa-fast-backward" aria-hidden="true"></i>');
        $('#reverse-button')
            .attr('title', 'Reverse by Month')
            .append('<i class="fas fa-step-backward" aria-hidden="true"></i>');
        $('#forward-button')
            .attr('title', 'Forward by Month')
            .append('<i class="fas fa-step-forward" aria-hidden="true"></i>');
        $('#fast-forward-button')
            .attr('title', 'Forward by Year').append('<i class="fas fa-fast-forward" aria-hidden="true"></i>');

        $('.sequence-buttons').click(function() {
            var index = parseInt(slider.val());
            var numOfSteps = attributes.length - 1;

            if ($(this).attr('id') === 'forward-button') {
                index++;
                index = index > numOfSteps ? 0 : index;
            } else if ($(this).attr('id') === 'fast-forward-button') {
                index = index + 12;
                var newFastForwardIndex = index - numOfSteps - 1;
                index = index > numOfSteps ? newFastForwardIndex : index;
            } else if ($(this).attr('id') === 'reverse-button') {
                index--;
                index = index < 0 ? numOfSteps  : index;
            } else if ($(this).attr('id') === 'fast-reverse-button') {
                index = index - 12;
                var newFastReverseIndex = numOfSteps + index + 1;
                index = index < 0 ? newFastReverseIndex  : index;
            }

            slider.val(index);
            citiesByMarketSize.html('');
            citiesByHomeValue.html('');
            updateDisplayedData(map, attributes[index]);
        });

        slider.click(function() {
            var index = $(this).val();
            citiesByMarketSize.html('');
            citiesByHomeValue.html('');
            updateDisplayedData(map, attributes[index]);
        });

    }

    function createCityListItem(featureProperties, attribute) {
        var regionName = featureProperties.regionName;
        var homeValue = formatCurrency(featureProperties[attribute]) || "no data";
        var listItemText = regionName + ": " + homeValue;
        return $('<li></li>').text(listItemText).attr('data-home-value', featureProperties[attribute]);
    }

    function calculateSymbolRadius(attrValue) {
        var scaleFactor = .004;
        var area = attrValue * scaleFactor;
        return Math.sqrt(area / Math.PI);
    }

    function getCircleValues(map, attribute) {
        var min = Infinity,
            max = -Infinity;

        map.eachLayer(function(layer){
            if (layer.feature) {
                var attributeValue = Number(layer.feature.properties[attribute]);

                // do not include values of 0 from the cities with no data
                if (attributeValue < min && attributeValue !== 0) {
                    min = attributeValue;
                }

                if (attributeValue > max) {
                    max = attributeValue;
                }
            }
        });

        var mean = (max + min ) / 2;

        return {
            max: max,
            mean: mean,
            min: min
        }
    }

    function hideInfoPanel() {
        infoPanel.fadeOut();
    }

    function sortCitiesByHomeValue() {
        var cityListItems = $('#cities-by-home-value li');
        var orderedCitiesList = $('#cities-by-home-value');

        // sort by attribute data-home-value assigned in createCityListItem
        orderedCitiesList.html(cityListItems.sort(comparisonFunction));

        function comparisonFunction(a, b){
            return ($(b).data('home-value')) > ($(a).data('home-value')) ? 1 : -1;
        }
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
        return formatMonth(attribute) + "&nbsp;" + getYear(attribute);
    }

    function getYear(zhviAttr) {
        return zhviAttr.slice(0,4);
    }

    function updateDisplayedData(map, attribute) {
        map.closePopup();
        // update prop symbols, popup content, and list of cities
        map.eachLayer(function(layer) {
            if (layer.feature && layer.feature.properties) {
                // update the layer style and popup
                var props = layer.feature.properties;
                var radius = calculateSymbolRadius(props[attribute]);
                var timePeriod = formatTimePeriod(attribute);
                var popupContent = updatePopupContent(props, attribute);
                infoContainer.html(timePeriod);
                updateLegend(map, attribute, timePeriod);
                citiesByMarketSize.append(createCityListItem(props, attribute));
                citiesByHomeValue.append(createCityListItem(props, attribute));
                sortCitiesByHomeValue();
                layer.setRadius(radius);
                layer.bindPopup(popupContent, {
                    offset: new L.Point(0, -radius)
                });
            }
        });
    }

    function updateLegend(map, attribute, timePeriod) {

        $('.legend-control-temporal-label').html(timePeriod);

        var circleValues = getCircleValues(map, attribute);
        for (var key in circleValues) {
            var legendText = formatCurrency(Math.round(circleValues[key]*100)/100) + ' ' +  key;
            var radius = calculateSymbolRadius(circleValues[key]);
            $('#'+key).attr({
                cy: 79-radius,
                r: radius
            });
            $('#'+key+'-text').text(legendText);
        }
    }

    function updatePopupContent(props, attribute) {
        var attributeValue = formatCurrency(Number(props[attribute]));
        var cityDisplayName = "<p> " + props.regionName + "</p>";
        var label = "<p>" + formatTimePeriod(attribute) + "&nbsp;Median Home Value </p>";
        var homeValue = "<p>" + attributeValue + "</p>";
        return cityDisplayName + label + homeValue;
    }

    function getZoomValue() {
        var clientWidth = document.documentElement.clientWidth;

        if (clientWidth < 500) {
            return 3;
        } else if (clientWidth < 1000) {
            return 4;
        } else  {
            return 5;
        }
    }
}

// The code below is an adaptation from https://codepen.io/chriscoyier/pen/zdsty
// and https://github.com/pjfsilva/dte-project/blob/master/jquery-draggable/draggable.js
// as well as implementation of touch events from the jQuery-Touch library
// and my own experimentation

(function($) {
    $.fn.drags = function(opt) {

        opt = $.extend({handle: '', cursor:"move"}, opt);

        if (opt.handle === '') {
            var $el = this;
        } else {
            var $el = this.find(opt.handle);
        }

        return $el.css('cursor', opt.cursor)
            .on('mousedown taphold', function(e) {

                if (opt.handle === "") {
                    var $drag = $(this).addClass('draggable');
                    $(this).removeClass('scrollable-y');
                } else {
                    var $drag = $(this).addClass('active-handle').parent().addClass('draggable');
                    $(this).parent().removeClass('scrollable-y');
                }
                var z_idx = $drag.css('z-index'),
                    drg_h = $drag.outerHeight(),
                    drg_w = $drag.outerWidth(),
                    pos_y = $drag.offset().top + drg_h - e.pageY,
                    pos_x = $drag.offset().left + drg_w - e.pageX;

                $drag.css('z-index', 1000).parents()
                    .on("mousemove tapmove", function(e) {
                        $('.draggable').offset({
                        top:e.pageY + pos_y - drg_h,
                        left:e.pageX + pos_x - drg_w
                    }).on("mouseup touchend", function() {
                        $(this).removeClass('draggable').css('z-index', z_idx);
                        $(this).addClass('scrollable-y');
                    });
                });
            e.preventDefault();
        }).on("mouseup tapend", function() {
            if (opt.handle === "") {
                $(this).parent().removeClass('draggable');
                $(this).parent().addClass('scrollable-y');
            } else {
                $(this).removeClass('active-handle').parent().removeClass('draggable');
                $(this).parent().addClass('scrollable-y');
            }
        });

    }
})($);

$('#panel').drags({handle: '.draggable-handler', cursor: 'move'});

$(document).ready(getMap);
