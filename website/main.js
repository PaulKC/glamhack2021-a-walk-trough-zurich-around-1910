var mymap;
var osmLayer;
var oldLayer;

var blueIcon = L.AwesomeMarkers.icon({
    icon: 'camera',
    markerColor: 'blue',
    prefix: 'fa'
});

window.onload = function () {
    // Define maps to use
    mymap = L.map('mapid').setView([47.4275447, 8.6778257], 9);
    osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        'attribution': 'Kartendaten &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        'useCache': true
    }).addTo(mymap);
    oldLayer = L.tileLayer('data/tiles/{z}/{x}/{y}.png', {
        minZoom: 9,
        maxZoom: 19,
        tms: false,
        opacity: 0.5,
        detectRetina: true
    }).addTo(mymap);
    // Init slider listener
    document.getElementById("opacitySlider").addEventListener('change', e => {
        oldLayer.setOpacity(1 - e.target.value / 100.0)
    })
    // Add images to map
    addImages();
};

function addImages() {
    var xhr = new XMLHttpRequest();
    // Get metadata for images from json file
    xhr.open("GET", "/data/images.json", true);
    xhr.responseType = 'json';
    xhr.onload = () => {
        if (xhr.status === 200) {
            var images = xhr.response;
            var markers = [];
            // Iterate over image metadata
            images.forEach(function (imageSource) {
                // Extract the geocoordinates
                var lat = imageSource.Bau_1_Latitude;
                var long = imageSource.Bau_1_Longitude;
                if (lat && long) {
                    // Create marker and add to map
                    var marker = L.marker([lat, long], {
                        icon: blueIcon
                    }).addTo(mymap);
                    markers.push(marker);
                    // Add the popup to the marker when clicked
                    marker.on('click', function (e) {
                        var wrapperDiv = document.createElement("div");

                        var header = document.createElement("h2");
                        header.innerHTML = imageSource["Titel"] + " (" + imageSource["Bildcode"] + ")"

                        var img = new Image();   // Create new img element
                        var span = document.createElement("span");
                        span.innerHTML = imageSource["Bemerkungen zu physischen Bildträgern"];
                        
                        var a = document.createElement('a');
                        a.target = "_blank";
                        var linkText = document.createTextNode(imageSource["Direktlink"]);
                        a.appendChild(linkText);
                        a.title = imageSource["Direktlink"];
                        a.href = imageSource["Direktlink"];

                        wrapperDiv.appendChild(header);
                        wrapperDiv.appendChild(span);
                        wrapperDiv.appendChild(img);
                        wrapperDiv.appendChild(a);

                        img.src = "data/images/" + imageSource["Asset-Name"].substring(0, imageSource["Asset-Name"].lastIndexOf(".")) + ".jpg"
                        // The marker is only shown after the image is loaded so the dimensions of the image are known and the popup can be positioned correctly
                        img.addEventListener('load', function () {
                            var popup = L.popup({ maxWidth: "auto", offset: [0, -30] })
                                .setLatLng(marker.getLatLng())
                                .setContent(wrapperDiv)
                                .openOn(mymap);
                        }, false);

                    });
                }
                // Fit the map to so all markers are visible
                if (markers.length > 0) {
                    var group = new L.featureGroup(markers);
                    mymap.fitBounds(group.getBounds());
                }
            });
        } else {
            alert('Request failed. Returned status of ' + xhr.status);
        }
    }
    xhr.send()
}