mapboxgl.accessToken =
  "pk.eyJ1IjoidGhpYmF1bHRqYW5iZXllciIsImEiOiJjand4cTRrcXEyM2l5NGJwNXFzYnY2dW5yIn0.cKm9QnyKCuUdg2BerGO_4Q";
googleKey = "AIzaSyBaBF2STO8Irsa0lM0xYfrWgORFGFNt8z0";

// Note: those keys ^ are bound to the github page and will only work when running via the github page. If you want to run it locally or somewhere else, you’ll need to generate your own keys

let hnmFeatures, cnaFeatures, allFeatures;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v10",
  center: [0, 0],
  zoom: 0
});

// https://docs.mapbox.com/mapbox-gl-js/example/hover-styles/
var hoveredStateId = null; // TODO: rename?

map.on("load", async function() {
  map.addSource("hnm", {
    type: "geojson",
    data: "h_n_m.geo.json"
  });

  map.addSource("cna", {
    type: "geojson",
    data: "c_n_a.geo.json"
  });

  map.addSource("open_apparrel", {
    type: "geojson",
    data: "open_apparrel.geo.json"
  });

  map.addSource("bangladesh_basins", {
    type: "geojson",
    data: "bangladesh_basins.geo.json"
  });

  /**
   * Controlls
   */

  const Geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
  });
  map.addControl(Geocoder);
  map.addControl(new mapboxgl.NavigationControl());

  //api.mapbox.com/geocoding/v5/mapbox.places/"+country+".json?country="+countrycode+"&access_token="+mapboxgl.accessToken

  addHeatmap();
  document.querySelector("#heatmap").addEventListener("change", evt => {
    if (evt.target.checked) return addHeatmap();
    map.removeLayer("open_apparrel-heat");
  });
  addCna();
  document.querySelector("#cna").addEventListener("change", evt => {
    if (evt.target.checked) return addCna();
    map.removeLayer("cna-point");
  });
  addHnm();
  document.querySelector("#hnm").addEventListener("change", evt => {
    if (evt.target.checked) return addHnm();
    map.removeLayer("hnm-point");
  });
  document.querySelector("#bangladesh").addEventListener("change", evt => {
    if (evt.target.checked) return addBangladesh();
    map.removeLayer("basins-lines");
  });

  Geocoder.on("result", function(data) {
    const bbox = data.result.bbox;

    const el1 = document.createElement("div");
    new mapboxgl.Marker(el1).setLngLat([bbox[0], bbox[1]]).addTo(map);
    const el2 = document.createElement("div");
    new mapboxgl.Marker(el2).setLngLat([bbox[2], bbox[3]]).addTo(map);

    const canvas = map.getCanvasContainer();
    const rect = canvas.getBoundingClientRect();
    const el1R = el1.getBoundingClientRect();
    const cEl1 = new mapboxgl.Point(
      el1R.left - rect.left - canvas.clientLeft,
      el1R.top - rect.top - canvas.clientTop
    );
    const el2R = el2.getBoundingClientRect();
    const cEl2 = new mapboxgl.Point(
      el2R.left - rect.left - canvas.clientLeft,
      el2R.top - rect.top - canvas.clientTop
    );

    try {
      hnmFeatures = map.queryRenderedFeatures([cEl1, cEl2], {
        layers: ["hnm-point"]
      });
    } catch (e) {
      console.log(e);
    }

    try {
      cnaFeatures = map.queryRenderedFeatures([cEl1, cEl2], {
        layers: ["cna-point"]
      });
    } catch (e) {
      console.log(e);
    }

    try {
      allFeatures = map.queryRenderedFeatures([cEl1, cEl2], {
        layers: ["open_apparrel-heat"]
      });
    } catch (e) {
      console.log(e);
    }

    console.log("f2", hnmFeatures, cnaFeatures, allFeatures);
    refreshFeatures();
  });
});

function refreshFeatures() {
  const hnm = (hnmFeatures && hnmFeatures.length) || 0;
  const cna = (cnaFeatures && cnaFeatures.length) || 0;
  const all = (allFeatures && allFeatures.length) || 0;
  document.querySelector("#features").innerHTML = hnm + cna + all || "";
  document.querySelector("#hnmFeatures").innerHTML = hnm || "";
  document.querySelector("#cnaFeatures").innerHTML = cna || "";
}

function addHeatmap() {
  map.addLayer(
    {
      id: "open_apparrel-heat",
      type: "heatmap",
      source: "open_apparrel",
      maxzoom: 9,
      paint: {
        // Increase the heatmap weight based on frequency and property magnitude
        "heatmap-weight": [
          "interpolate",
          ["linear"],
          ["get", "mag"],
          0,
          0,
          6,
          1
        ],
        // Increase the heatmap color weight weight by zoom level
        // heatmap-intensity is a multiplier on top of heatmap-weight
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 3],
        // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
        // Begin color ramp at 0-stop with a 0-transparancy color
        // to create a blur-like effect.
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(7,70,147,0)",
          0.2,
          "rgba(255,255,255,0.4)",
          0.4,
          "rgba(255,255,255,0.5)",
          0.6,
          "rgba(255,255,255,0.6)",
          0.8,
          "rgba(255,255,255,0.7)",
          1,
          "rgba(255,255,255,0.8)"
        ],
        // Adjust the heatmap radius by zoom level
        "heatmap-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          // zoom is 5 (or less)
          4,
          10,
          // zoom is 10 (or greater)
          10,
          0
        ],
        // Transition from heatmap to circle layer by zoom level
        "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0.8, 9, 0]
      }
    },
    "waterway-label"
  );

  setTimeout(() => {
    try {
      hnmFeatures = map.queryRenderedFeatures(null, {
        layers: ["open_apparrel-heat"]
      });
    } catch (e) {
      console.log(e);
    }
    refreshFeatures();
  }, 5000);
}

function addHnm() {
  map.addLayer({
    id: "hnm-point",
    type: "circle",
    interactive: true,
    source: "hnm",
    paint: {
      "circle-color": "#DC143C",
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        // zoom is 5 (or less) -> circle radius will be 2px
        4,
        3,
        // zoom is 10 (or greater) -> circle radius will be 5px
        10,
        5
      ]
    }
  });

  map.on("click", "hnm-point", function(e) {
    console.log(e);
    var features = map.queryRenderedFeatures(e.point, {
      layers: ["hnm-point"] // replace this with the name of the layer
    });
    if (!features.length) {
      return;
    }
    var feature = features[0];
    const lat = feature.geometry.coordinates[0];
    const lon = feature.geometry.coordinates[1];

    var popup = new mapboxgl.Popup({ offset: [0, -15] })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(
        `
        <h3>${feature.properties.name}</h3>
        <a href="https://earthengine.google.com/timelapse#v=${lon},${lat},12,latLng&t=1.09&ps=50&bt=19840101&et=20181231&startDwell=0&endDwell=0">
          <img src="http://maps.googleapis.com/maps/api/staticmap?center=${lon},${lat}&zoom=17&maptype=satellite&size=220x200&key=${googleKey}"
        </a>
        `
      )
      .setLngLat(feature.geometry.coordinates)
      .addTo(map);
  });

  setTimeout(() => {
    try {
      hnmFeatures = map.queryRenderedFeatures(null, {
        layers: ["hnm-point"]
      });
    } catch (e) {
      console.log(e);
    }
    refreshFeatures();
  }, 5000);
}

function addCna() {
  map.addLayer({
    id: "cna-point",
    type: "circle",
    interactive: true,
    source: "cna",
    paint: {
      "circle-color": "#98fb98",
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        // zoom is 5 (or less) -> circle radius will be 2px
        4,
        3,
        // zoom is 10 (or greater) -> circle radius will be 5px
        10,
        5
      ]
    }
  });

  map.on("click", "cna-point", function(e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: ["cna-point"] // replace this with the name of the layer
    });
    if (!features.length) {
      return;
    }
    var feature = features[0];
    const lat = feature.geometry.coordinates[0];
    const lon = feature.geometry.coordinates[1];

    var popup = new mapboxgl.Popup({ offset: [0, -15] })
      .setLngLat(feature.geometry.coordinates)
      .setHTML(
        `
        <h3>${feature.properties.name}</h3>
        <a href="https://earthengine.google.com/timelapse#v=${lon},${lat},12,latLng&t=1.09&ps=50&bt=19840101&et=20181231&startDwell=0&endDwell=0">
          <img src="http://maps.googleapis.com/maps/api/staticmap?center=${lon},${lat}&zoom=17&maptype=satellite&size=220x200&key=AIzaSyBaBF2STO8Irsa0lM0xYfrWgORFGFNt8z0"
        </a>
        `
      )
      .setLngLat(feature.geometry.coordinates)
      .addTo(map);
  });

  setTimeout(() => {
    try {
      cnaFeatures = map.queryRenderedFeatures(null, {
        layers: ["cna-point"]
      });
    } catch (e) {
      console.log(e);
    }
    refreshFeatures();
  }, 5000);
}

function addBangladesh() {
  map.addLayer({
    id: "basins-lines",
    type: "fill",
    //interactive: true,
    source: "bangladesh_basins",
    paint: {
      "fill-color": "#04F",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.6,
        0.2
      ]
    }
  });

  // When the user moves their mouse over the state-fill layer, we'll update the
  // feature state for the feature under the mouse.
  map.on("mousemove", "basins-lines", function(e) {
    if (e.features.length > 0) {
      if (hoveredStateId) {
        map.setFeatureState(
          { source: "bangladesh_basins", id: hoveredStateId },
          { hover: false }
        );
      }

      hoveredStateId = e.features[0].id;
      console.log(hoveredStateId);
      map.setFeatureState(
        { source: "bangladesh_basins", id: hoveredStateId },
        { hover: true }
      );
    }
  });

  // When the mouse leaves the state-fill layer, update the feature state of the
  // previously hovered feature.
  map.on("mouseleave", "basins-lines", function() {
    if (hoveredStateId) {
      map.setFeatureState(
        { source: "bangladesh_basins", id: hoveredStateId },
        { hover: false }
      );
    }

    hoveredStateId = null;
  });
}
