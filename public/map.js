var map;  // map object created from Leaflet

var metricsList = []; // names of metrics

var mapsList = []; // names of maps

var featureList = [];

var selectedMap = '';

var layer;

var geojson;

let currentMap = "ncr.geojson";

var defaultFeature;

var info = L.control();

info.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
}

info.update = function(props) {
  var prop = null;
  for(var obj in props) {
    if(obj == selectedMap) {
      prop = obj;
    }
  }

  this._div.innerHTML = '<h4>' + selectedMap + '<h4>' + (props ? '<b>' + props.DISTRICT + '</b><br />' + Math.trunc(props[prop] * 1000) / 1000 : 'Hover over a district');
}

/**
* Initialises map for showing districts. Should only be called once
*/
function initMap() {
  map = L.map('map').setView([35, -80], 7);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.light',
    accessToken: '******'
  }).addTo(map);


  // temporary
  var xmlhttp = new XMLHttpRequest();
  var jsonMap;  // contains geojson data about the map to display
  var hasDefault = false;
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {

      jsonMap = JSON.parse(this.responseText);
      L.geoJSON(jsonMap, {style: districtStyle}).addTo(map);  // adds geojson districts to map with style given in style()

      // gets list of properties from geojson file to determine list of map types
      var propertiesList = Object.keys(jsonMap.features[0].properties);

      for(i = 1; i < propertiesList.length; i++) {
        var name = propertiesList[i].toString();
        var $mapItem = newMap(name);

        $mapItem.click(mapItemOnClick($mapItem, name, jsonMap));

        if(!hasDefault) {
          hasDefault = true;
          mapItemOnClick($mapItem, name, jsonMap);
        }


      }

    }

  };
  xmlhttp.open("GET", currentMap, true);
  xmlhttp.send();

  info.addTo(map);
}

/**
* Removes the current layer from the map, and replaces it with a new one
*/
function resetMap(jsonMap) {
  if(layer != null)
    layer.removeFrom(map);

  let newMap = jsonMap;
  layer = L.geoJSON(newMap, {style: districtStyle, onEachFeature: onEachFeature});


  geojson = layer.addTo(map);
}

/**
* Defines functions to be called for mouse events (click, mouseover, etc.) that occurs on each district
*/
function onEachFeature(feature, layer) {
  var listItem = {district: feature.properties.DISTRICT, layer: layer};
  featureList.push(listItem); // adds feature to feature list

  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}

/**
* Highlights the district where the mouse event occured
*/
function highlightFeature(e) {
  var layer = e.target;

  highlightLayer(layer);
}

/**
* Resets highlights for the district where the mouse event occured
*/
function resetHighlight(e) {
  resetLayerHighlight(e.target);
}

/**
*
*/
function zoomToFeature(e) {
  defaultFeature = e;
  var layer = e.target;
  var district = layer.feature.properties.DISTRICT

  $(`.boxable${district}.bad`).css('background-color', '');
  $(`.boxable${district}.good`).css('background-color', '');

  $(`.boxable${district}.bad`).css('background-color', '#ff6666');
  $(`.boxable${district}.good`).css('background-color', '#99ff99');
}

/**
* Creates a new map item to display on the map types menu
*/
function newMap(nameStr) {
  mapsList.push(nameStr);
  var index = mapsList.length - 1;
  addNavRow(index);

  $mapItem = $('#navItem' + index);

  return $mapItem;
}

/**
* Adds a row to the map types navigation menu only.
* Only adds html to relevant section, without interactivity.
*/
function addNavRow(mapIndex) {
  // html for new row
  var newElem = '<a href="#" id="navItem' + mapIndex +
  '" class="w3-bar-item w3-button w3-padding"><i class="fa fa-map fa-fw"></i>   ' + mapsList[mapIndex] + '</a>';

  $('#div-nav-drawer').append(newElem);
}

/**
* Determines the style for districts on the map
*/
function districtStyle(feature) {
  var property = null;

  // loop through existing properties to see if the name is the same
  //  as the currently selected map
  for(var prop in feature.properties) {
    if(prop == selectedMap) {
      property = prop;
    }
  }

  return {
    fillColor: getColor(feature.properties[property]),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.5
  };
}

/**
* Determines what colour a district should be, based on a given value d
*/
function getColor(d) {
  return d > 0.75 ? '#FFEDA0' :
  d > 0.6  ? '#FED976' :
  d > 0.5  ? '#FEB24C' :
  d > 0.45  ? '#FD8D3C' :
  d > 0.4   ? '#FC4E2A' :
  d > 0.3   ? '#E31A1C' :
  d > 0.15   ? '#BD0026' :
  '#800026';
}


/**
* Called when a map type is selected from the menu
*/
function mapItemOnClick($item, name, jsonMap) {
  featureList = []; // empty list of features
  return function() {
    clearMapItemHighlights();
    $item.addClass('w3-blue');
    selectedMap = name;
    resetMap(jsonMap);
    $('#map').attr("data-mapType", name);

  }
}

/**
* Removes all blue highlights from map types menu
*/
function clearMapItemHighlights() {
  for(var i = 0; i < mapsList.length; i++) {
    $('#navItem' + i).removeClass('w3-blue');
  }
}





/**
* Resets highlights for all districts on the map
*/
function resetAllHighlights() {
  for(var i = 0; i < featureList.length; i++) {
    resetLayerHighlight(featureList[i].layer);
  }
}

/**
* Highlights a district on the map, depending on the given district number
*/
function highlightDistrict(number) {
  console.log("highlightDistrict");
  for(var i = 0; i < featureList.length; i++) {
    if(number == featureList[i].district) {
      console.log(`highlighting ${i} from featurelist`);
      
      highlightLayer(featureList[i].layer);

      return;
    }
  }
}

/**
* Highlights a layer on the map
*/
function highlightLayer(layer) {
  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });

  // problems with IE, Opera, and Edge will mean this function would not work
  // if(!L.Broswer.ie && !L.Browser.opera && !L.Browser.edge) {
  // layer.bringToFront();
  // }

  info.update(layer.feature.properties);
}

/**
* Clears all highlights for the given layer
*/
function resetLayerHighlight(layer) {
  geojson.resetStyle(layer);
  info.update();
}

function parseAsGeoJson(map) {
  let mapReader = new FileReader();
  mapReader.addEventListener("load", function() {
    console.log("Map reading completed");
    resetMap(JSON.parse(this.result));
  });
  mapReader.readAsText(map);
  console.log("Map reading started.")
}