var mymap;
var osmLayer;
var oldLayer;

var redIcon = L.AwesomeMarkers.icon({
    icon: 'camera',
    markerColor: 'red',
    prefix: 'fa'
});

var blueIcon = L.AwesomeMarkers.icon({
    icon: 'camera',
    markerColor: 'blue',
    prefix: 'fa'
});


window.onload = function () {
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
    addImages();
    document.getElementById("opacitySlider").addEventListener('change',e=>{
        oldLayer.setOpacity(1-e.target.value/100.0)
    })
};

function getColor(x) {
    return x < 140 ? 'green' :
        x < 150 ? 'yellow' :
            x < 160 ? 'orange' :
                'red';
};

function addImages() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/data/images.json", true);
    xhr.responseType = 'json';
    xhr.onload = () => {
        if (xhr.status === 200) {
            var images = xhr.response;
            var markers = [];
            images.forEach(function (imageSource) {
                var lat = imageSource.Bau_1_Latitude;
                var long = imageSource.Bau_1_Longitude;
                if (lat && long) {
                    var marker = L.marker([lat, long], {
                        icon: blueIcon
                    }).addTo(mymap);
                    markers.push(marker);
                    marker.on('click', function (e) {
                        var wrapperDiv = document.createElement("div");
                        var header = document.createElement("h2");
                        wrapperDiv.appendChild(header);
                        header.innerHTML = imageSource["Titel"] + " ("+imageSource["Bildcode"]+")"
                        var img = new Image();   // Create new img element
                        var span = document.createElement("span");
                        span.innerHTML = imageSource["Bemerkungen zu physischen Bildträgern"];
                        wrapperDiv.appendChild(span);
                        var a = document.createElement('a');
                        a.target = "_blank";
                        var linkText = document.createTextNode(imageSource["Direktlink"]);
                        a.appendChild(linkText);
                        a.title = imageSource["Direktlink"];
                        a.href = imageSource["Direktlink"];
                        wrapperDiv.appendChild(img);
                        wrapperDiv.appendChild(a);
                        img.src ="data/images/" + imageSource["Asset-Name"].substring(0, imageSource["Asset-Name"].lastIndexOf(".")) + ".jpg"
                        img.addEventListener('load', function() {
                            var popup = L.popup({maxWidth: "auto",offset: [0, -30]})
                            .setLatLng(marker.getLatLng())
                            .setContent(wrapperDiv)
                            .openOn(mymap);
                        }, false);

                    });
                }
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