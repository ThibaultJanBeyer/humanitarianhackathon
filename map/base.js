mapboxgl.accessToken =
  "pk.eyJ1IjoidGhpYmF1bHRqYW5iZXllciIsImEiOiJjand4cTRrcXEyM2l5NGJwNXFzYnY2dW5yIn0.cKm9QnyKCuUdg2BerGO_4Q";
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v10",
  center: [-103.59179687498357, 40.66995747013945],
  zoom: 3
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

  map.addLayer({
    id: "open_apparrel-point",
    type: "circle",
    interactive: true,
    source: "open_apparrel",
    paint: {
      "circle-color": "#00f",
      "circle-radius": 4
    }
  });

  map.addLayer({
    id: "hnm-point",
    type: "circle",
    interactive: true,
    source: "hnm",
    paint: {
      "circle-color": "#f00",
      "circle-radius": 4
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
  // map.on("mouseenter", "clusters", function() {
  //   map.getCanvas().style.cursor = "pointer";
  // });
  // map.on("mouseleave", "clusters", function() {
  //   map.getCanvas().style.cursor = "";
  // });
});
