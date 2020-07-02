function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


function makeid(length) {
    var result = "";
    var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

var SESSION_ID = getCookie("userSession");

function latLongArray(layer) {
    var array = [];
    for (i = 0; i < layer.getLatLngs()[0].length; i++) {
        array.push([layer.getLatLngs()[0][i].lat, layer.getLatLngs()[0][i].lng]);
    }
    return array;
}

function selectLayer(id) {
    editableLayers.eachLayer(function (layer) {
        layer.setStyle({ fillColor: "#335c4a" });
    });
    if (editableLayers.getLayer(id) !== undefined) {
        editableLayers.getLayer(id).setStyle({ fillColor: "#198a58" });
    }
}

function submitPlot() {
    var verify = true;
    if (editableLayers.getLayers().length < 1) {
        verify = false;
    }
    
    landAmenities = ""
    
    for (amenity of amenityItems) {
        landAmenities += amenity + ", "
    } 
    
    landAmenities = landAmenities.substring(0, landAmenities.length - 2);    
    
    
    if ($("#land-name").val() == "" || landAmenities == "") {
        verify = false;
    }
    $(".plot-name").each(function (i, obj) {
        if ($(this).val() == "") {
            verify = false;
        }
    });
    $(".plot-price").each(function () {
        if ($(this).val() == "") {
            verify = false;
        }
    });
        
    if (verify) {
        var divs = document
            .getElementById("layer-form")
            .getElementsByClassName("layer-info");
        var plotData = {};
        var plotNameArr = [];
        var plotSizeArr = []
        for (var i = 0; i < divs.length; i++) {
            var name = divs[i].getElementsByClassName("plot-name");
            name = name[0].value;
            plotNameArr.push(name);
            var price = divs[i].getElementsByClassName("plot-price");
            price = price[0].value;
            var id = divs[i].getAttribute("id");
            var latLongs = latLongArray(editableLayers.getLayer(id));

            var area = divs[i].getElementsByClassName("area");
            area = area[0].textContent
            plotSizeArr.push(area)

            plotData[name] = { price: price, coords: latLongs, size: area };
        }
        plotJSON["sessionID"] = SESSION_ID;
        plotJSON["plotData"] = plotData;
        plotJSON["landData"] = {
            landID: makeid(16),
            friendlyName: document.getElementById("land-name").value,
            amenities: landAmenities.split(", "),
            plotIDs: plotNameArr,
        };

        let apiPath = `${env}/api/addLandEntry`;
        let payload = JSON.stringify({
            sessionID: SESSION_ID,
            landData: plotJSON["landData"],
            plotData: plotJSON["plotData"],
        });

        console.log(payload)
        // send plots off to the api
        $.ajax({
            url: apiPath,
            type: "post",
            data: payload,
            dataType: "json",
            contentType: "application/json",
            success: function (data) {
                if (data.Status == "Success") {
                    alert("PLots have been submitted.");
                    window.location.href = "/dashboard";
                } else {
                    alert(
                        "Failed to add plots, please try again or contact site administrator."
                    );
                }
            },
            error: function (err) {
                console.warn(`Error with: ${apiPath}`);
                alert(
                    "Failed to add plots, please try again or contact site administrator."
                );
            },
        });
    } else {
        alert(
            "Please fill in every field and make sure you have added a plot to the map."
        );
    }
}

function updatePPM(id) {
    var price = document.getElementById("price-" + id).value;
    var area = document.getElementById("area-" + id).innerHTML;
    area = area.substring(0, area.length - 2);
    document.getElementById("ppm-" + id).innerHTML =
        "£" + (price / (area / 10000)).toFixed(2) + "/ha";
}

function removePlot(layerId) {
    editableLayers.removeLayer(editableLayers.getLayer(layerId));
    var layer_div = document.getElementById(layerId);
    layer_div.parentNode.removeChild(layer_div);
}

var editableLayers = new L.FeatureGroup();
var plotJSON = {};
var map;

document.addEventListener("DOMContentLoaded", function () {
    var bing = new L.BingLayer("Au6SI2Fvtrfu1bBnnHpB3sQnrVt6CB5a90plCjKAZaNf6iw-VITkKDuTee9ukRpz", { imagerySet: "AerialWithLabelsOnDemand" });
    var OpenStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });
    map = L.map("map", {
        center: [54.7, -3],
        zoom: 6,
        fullscreenControl: true,
        layer: [bing]
    });
    bing.addTo(map)
    var baseMaps = {
        "Satellite": bing,
        "Street": OpenStreetMap
    };
    L.control.layers(baseMaps).addTo(map);

    editableLayers = new L.FeatureGroup();
    map.addLayer(editableLayers);

    var drawControl = new L.Control.Draw({
        position: "topleft",
        draw: {
            polygon: {
                shapeOptions: {
                    color: "#d8e8dd",
                    opacity: 1,
                    fillColor: "#339c54",
                    fillOpacity: 1,
                },
                allowIntersection: false,
                drawError: {
                    color: "orange",
                    timeout: 1000,
                },
                showArea: true,
                metric: true,
            },
            polyline: false,
            marker: false,
            rectangle: false,
            circle: false,
            circlemarker: false,
        },
        edit: {
            featureGroup: editableLayers,
            remove: false,
        },
    });

    map.addControl(drawControl);

    map.on("draw:created", function (e) {
        var type = e.layerType,
            layer = e.layer;

        if (type === "polyline") {
            layer.bindPopup("A polyline!");
        } else if (type === "polygon") {
            var area = L.GeometryUtil.geodesicArea(layer.getLatLngs());
            // layer.bindPopup('A polygon!');
        } else if (type === "marker") {
            layer.bindPopup("marker!");
        } else if (type === "circle") {
            layer.bindPopup("A circle!");
        } else if (type === "rectangle") {
            layer.bindPopup("A rectangle!");
        }
        editableLayers.addLayer(layer);
        layer.setStyle({
            fillColor: "#335c4a",
            fillOpacity: "0.8",
            color: "#ffffff",
            opacity: 0.8,
        });
        // document.getElementById('layer-form').innerHTML += "<div class='layer-info' value='"+layer._leaflet_id+"'onclick='selectLayer("+layer._leaflet_id+")'><input name='plot-name' placeholder='name'><input name='plot-price' placeholder='price'></div>"
        var div = document.createElement("div");
        div.id = layer._leaflet_id;
        div.className = "layer-info";
        div.setAttribute("onclick", "selectLayer(" + layer._leaflet_id + ")");
        div.value = layer._leaflet_id;
        var name_input = document.createElement("input");
        name_input.className = "plot-name";
        name_input.placeholder = "Plot name";
        var price_input = document.createElement("input");
        price_input.className = "plot-price";
        price_input.placeholder = "Plot price (£)";
        price_input.id = "price-" + layer._leaflet_id;
        price_input.setAttribute("onkeyup", "updatePPM(" + layer._leaflet_id + ")");
        var area = Math.trunc(L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]));
        var area_div = document.createElement("div");
        area_div.className = "area";
        area_div.innerHTML = area + "m&sup2";
        area_div.id = "area-" + layer._leaflet_id;
        var ppm_div = document.createElement("div");
        ppm_div.className = "area";
        ppm_div.id = "ppm-" + layer._leaflet_id;
        ppm_div.innerHTML = "£0.00/ha";
        document.getElementById("layer-form").appendChild(div);
        div.appendChild(name_input);
        div.appendChild(price_input);
        div.appendChild(area_div);
        div.appendChild(ppm_div);
        div.innerHTML +=
            '<div class="del-button-container"><div class="del-button" onclick="removePlot(' +
            layer._leaflet_id +
            ')"><img class="remove-icon" src="https://img.icons8.com/color/48/000000/close-window.png"/></div></div>';
        latLongArray(layer);
    });

    var searchControl = new L.esri.Controls.Geosearch().addTo(map);

    var results = new L.LayerGroup().addTo(map);

    searchControl.on("results", function (data) {
        results.clearLayers();
        for (var i = data.results.length - 1; i >= 0; i--) {
            results.addLayer(L.marker(data.results[i].latlng));
        }
    });
});
