var SESSION_ID = $.cookie("userSession");
var LAND_DATA = undefined

function getData() {
    let apiPath = `${env}/api/getLandEntriesOp`;
    let payload = JSON.stringify({ sessionID: SESSION_ID });

    $.ajax({
        url: apiPath,
        type: "post",
        data: payload,
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            LAND_DATA = data
            populateTabs(data)

            changeTab(data[0].landDetails.landID) // show first tab by default
        },
        error: function (err) {
            console.warn(`Error with: ${apiPath}`);
        },
    });
}

function populateTabs(data) {
    data.forEach(entry => {
        let landId = entry.landDetails.landID
        let friendlyName = entry.landDetails.friendlyName

        $("#landTabs").append(`<li class="nav-item"><a href="#${landId}" id="${landId}"class="nav-link active" data-toggle="tab" onclick="changeTab(this.id)">${friendlyName}</a></li>`)
    })
}

function changeTab(id) {
    LAND_DATA.forEach(entry => {
        // check for land id
        if (entry.landDetails.landID == id) {
            // populate friendly name 
            $("#landName").text(entry.landDetails.friendlyName)
            // populate ammenities 
            populateAmenities(entry)
            // populate plots
            populatePlots(entry)
        }
    })
}

function populateAmenities(entry) {
    $("#amenitiesBlock").html(``)

    let amenityList = ""
    entry.landDetails.amenities.forEach(amenity => {
        amenityList += `${amenity}, `
    })

    amenityList = amenityList.replace(/,([^,]*)$/, "$1"); // Remove last comma
    $("#amenitiesBlock").append(amenityList)
}

// display correct map size
var maps = []
function mapResize() {
    for (i = 0; i < maps.length; i++) { 
        maps[i][0].invalidateSize()
        maps[i][0].fitBounds(maps[i][1].getBounds())
    }
}

function populatePlots(entry) {
    $("#plotList").html(``)

    entry.plotDetails.forEach(plot => {
//         console.log(plot.plotID, plot.landID)
        $("#plotList").append(`
        <a class="list-group-item list-group-item-action flex-column align-items-start">
            <h3 class="mb-1">${plot.plotID}</h3>
            <div class="container">
                <div class="info-container">
                    <hr>
                    <h4><i class="icofont-drag2"></i> Plot Size: ${plot.size.replace("m²", "")}m<sup>2</sup></h4>
                    <hr>
                    <h4><i class="icofont-pound"></i> Plot price: £${plot.price}/Month</h4>
                    <hr>
                </div>
            </div>
            <div class="btn-group special" role="group">
                <button type="button" class="btn btn-outline-success" onclick="requestWaiting('${plot.plotID}', '${plot.landID}')">Add to Waiting
                    List</button>
                <button type="button" class="btn btn-outline-success" onclick="displayContact('${plot.landID}')">Contact the
                    Landowner</button>
                <button type="button" class="btn btn-outline-success" data-toggle="collapse" data-target="#`+ plot.landID + `-` + plot.plotID +`" onclick="setTimeout(mapResize, 300)">View on a Map</button>
                <!-- data-target needs to be unique to this card for the toggle to work -->
            </div>
            <div class="collapse" id="`+ plot.landID + `-` + plot.plotID +`">
                <!-- id needs to be unique to this card for the toggle to work -->
                <!-- Opens map interface of plot -->
                <div class="card card-body">
                    <div id="map-`+ plot.landID + `-` + plot.plotID + `" style="height: 330px;"></div>
                </div>
            </div>
        </a>`)
        // Add map to div
        var plotPolygon = L.polygon(plot.coords);
        plotPolygon.setStyle({
          fillColor: "#335c4a",
          fillOpacity: "0.8",
          color: "#ffffff",
          opacity: 0.8,
        });
        console.log(plotPolygon)
        var map = L.map("map-" + plot.landID + '-' + plot.plotID, {
            center: plot.coords[0],
            zoom: 15,
          fullscreenControl: true,
        });
        map.fitBounds(plotPolygon.getBounds())
        var bing = new L.BingLayer(
          "Au6SI2Fvtrfu1bBnnHpB3sQnrVt6CB5a90plCjKAZaNf6iw-VITkKDuTee9ukRpz",
          { imagerySet: "AerialWithLabelsOnDemand" }
        );
        map.addLayer(bing);
        plotPolygon.addTo(map);
        maps.push([map, plotPolygon])
    })
}

function requestWaiting(plotID, landID){
    console.log("PlotID: ", plotID, "\nlandID: ", landID)
//     sessionID = req_data['sessionID']
//     plotID = req_data['plotID']
//     landID = req_data['landID']
    
    let apiPath = `${env}/api/appendWaitingList`;
    let payload = JSON.stringify({ sessionID: SESSION_ID, "plotID": plotID, "landID": landID });

    $.ajax({
        url: apiPath,
        type: "post",
        data: payload,
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            console.log(data)
            alert(data.Status)
        },
        error: function (err) {
            console.warn(`Error with: ${apiPath}`);
        },
    });
    
}

function displayContact(landID){    
    let apiPath = `${env}/api/getLandownerContact`;
    let payload = JSON.stringify({ sessionID: SESSION_ID, "landID": landID });

    $.ajax({
        url: apiPath,
        type: "post",
        data: payload,
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            alert(data.phone + "\n" + data.email)
        },
        error: function (err) {
            console.warn(`Error with: ${apiPath}`);
        },
    });
}

getData()
