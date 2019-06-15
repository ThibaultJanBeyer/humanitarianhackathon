function initMap() {
  // Create the Google Map…
  map = new google.maps.Map(d3.select("#map").node(), {
    zoom: 1,
    center: new google.maps.LatLng(0, 0),
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });

  // Load the station data. When the data comes back, create an overlay.
  d3.json("data.json", function(error, data) {
    if (error) throw error;

    var overlay = new google.maps.OverlayView();

    // Add the container when the overlay is added to the map.
    overlay.onAdd = function() {
      var layer = d3
        .select(this.getPanes().overlayLayer)
        .append("div")
        .attr("class", "stations");

      // Draw each marker as a separate SVG element.
      // We could use a single SVG, but what size would it have?
      overlay.draw = function() {
        var projection = this.getProjection(),
          padding = 10;

        var marker = layer
          .selectAll("svg")
          .data(d3.entries(data))
          .each(transform) // update existing markers
          .enter()
          .append("svg")
          .each(transform)
          .attr("class", "marker");

        // Add a circle.
        marker
          .append("circle")
          .attr("r", 4.5)
          .attr("cx", padding)
          .attr("cy", padding);

        // Add a label.
        marker
          .append("text")
          .attr("x", padding + 7)
          .attr("y", padding)
          .attr("dy", ".31em")
          .text(function(d) {
            return d.value.name;
          });

        function transform(d) {
          console.log(d);
          d = new google.maps.LatLng(d.value.lat, d.value.lon);
          d = projection.fromLatLngToDivPixel(d);
          return d3
            .select(this)
            .style("left", d.x - padding + "px")
            .style("top", d.y - padding + "px");
        }
      };
    };

    // Bind our overlay to the map…
    overlay.setMap(map);
  });
}
