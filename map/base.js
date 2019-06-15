let map;

async function initMap() {
  // Create the Google Map…
  map = new google.maps.Map(d3.select("#map").node(), {
    zoom: 2,
    center: new google.maps.LatLng(0, 0),
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });

  let resp = await fetch("c_n_a_locations.json");
  const cnaData = await resp.json();
  resp = await fetch("h_n_m_locations.json");
  const hnmData = await resp.json();

  handleData(cnaData);
  handleData(hnmData);
}

function handleData(data) {
  const markers = [];
  const gMarkers = data.map(d => {
    try {
      const marker = d;
      const latLng = { lat: JSON.parse(d.lat), lng: JSON.parse(d.lon) };
      marker.m = new google.maps.Marker({
        position: latLng,
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 1,
          strokeColor: d.brand === "H&M" ? "#ff0000" : "#0000ff"
        },
        title: d.name
      });
      markers.push(marker);
      return marker;
    } catch (e) {
      console.info(e);
    }
  });
}
