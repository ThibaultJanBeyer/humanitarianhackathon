mapboxgl.accessToken =
  "pk.eyJ1IjoidGhpYmF1bHRqYW5iZXllciIsImEiOiJjand4cTRrcXEyM2l5NGJwNXFzYnY2dW5yIn0.cKm9QnyKCuUdg2BerGO_4Q";
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v10",
  center: [0, 0],
  zoom: 0
});

map.on("load", async function() {
  map.addSource("hnm", {
    type: "geojson",
    data: "/h_n_m.geo.json"
  });

  map.addSource("cna", {
    type: "geojson",
    data: "/c_n_a.geo.json"
  });

  map.addSource("open_apparrel", {
    type: "geojson",
    data: "/open_apparrel.geo.json"
  });

  // map.addLayer({
  //   id: "open_apparrel-point",
  //   type: "circle",
  //   interactive: true,
  //   source: "open_apparrel",
  //   paint: {
  //     "circle-color": "#f1f075",
  //     "circle-radius": 4
  //   }
  // });

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
          "rgba(255,255,255,0.9)"
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

  map.addLayer({
    id: "hnm-point",
    type: "circle",
    interactive: true,
    source: "hnm",
    paint: {
      "circle-color": "#f00",
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        // zoom is 5 (or less) -> circle radius will be 2px
        4,
        2,
        // zoom is 10 (or greater) -> circle radius will be 5px
        10,
        5
      ]
    }
  });

  // #51bbd6 #f1f075 #f28cb1

  map.addLayer({
    id: "cna-point",
    type: "circle",
    interactive: true,
    source: "cna",
    paint: {
      "circle-color": "#0f0",
      "circle-radius": 4
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
          <img src="http://maps.googleapis.com/maps/api/staticmap?center=${lon},${lat}&zoom=17&maptype=satellite&size=220x200&key=AIzaSyBaBF2STO8Irsa0lM0xYfrWgORFGFNt8z0"
        </a>
        `
      )
      .setLngLat(feature.geometry.coordinates)
      .addTo(map);
  });

  map.addControl(
    new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl
    })
  );
  map.addControl(new mapboxgl.NavigationControl());
});
