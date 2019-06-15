https://api.mapbox.com/geocoding/v5/mapbox.places/"+country+".json?country="+countrycode+"&access_token="+mapboxgl.accessToken

const source = document.querySelectorAll('source');
source.addEventListener('change', evt => {

});

colors.forEach(function (color) {
    var swatch = document.createElement('button');
    swatch.style.backgroundColor = color;
    swatch.addEventListener('click', function () {
        map.setPaintProperty(layer.value, 'fill-color', color);
    });
    swatches.appendChild(swatch);
});