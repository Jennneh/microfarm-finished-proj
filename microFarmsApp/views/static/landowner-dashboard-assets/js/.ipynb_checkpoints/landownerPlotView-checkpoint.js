var SESSION_ID = $.cookie("userSession");

function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split("&"),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split("=");

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined
        ? true
        : decodeURIComponent(sParameterName[1]);
    }
  }
}

let land = getUrlParameter("plot");
let plot = getUrlParameter("land");

function approveWaiter(uname){
    console.log(uname)
    
    let confirmation = confirm("Are you sure you want to rent the plot to: " + uname)
    if(confirmation == false){
        alert("Not renting plot to: " + uname)
        return null
    }
    
    let apiPath = `${env}/api/approveWaitingList`;
    let payload = JSON.stringify({ sessionID: SESSION_ID, landID: land, plotID: plot, uname: uname });

  $.ajax({
    url: apiPath,
    type: "post",
    data: payload,
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
        alert("Congratulations! Plot rented successfully")
        location.reload();
    },
    error: function (err) {
      console.warn(`Error with: ${apiPath}`);
//       $("#plot-list").append(
//         `<li class="list-group-item d-flex justify-content-between align-items-center">No plots found.</li>`
//       );
    },
  });
}

function getPlotDetails() {
  let apiPath = `${env}/api/getPlotDetails`;
  let payload = JSON.stringify({ sessionID: SESSION_ID, landID: land, plotID: plot });

  $.ajax({
    url: apiPath,
    type: "post",
    data: payload,
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
        let plotData = data.plotData;
        let landData = data.landData;
        let tenantData = data.tenantData;
        
        if(tenantData == ""){
            $("#tenantData").append(`<li class="list-group-item d-flex justify-content-between align-items-center">No one is currently renting this plot</li>`);
            $("#updateBillArea").append(`<button type="button" class="btn btn-success btn-sm" onclick="updateBillAmount()">Update Bill Amount</button>`)
            
        }else{
            $("#tenantData").append(`<li class="list-group-item d-flex justify-content-between align-items-center">Name: ${tenantData.fName} ${tenantData.lName} </li><li class="list-group-item d-flex justify-content-between align-items-center">Email: ${tenantData.email}</li><li class="list-group-item d-flex justify-content-between align-items-center">Phone No: ${tenantData.phoneNo}</li>`)
            $("#updateBillArea").append(`<button type="button" class="btn btn-success btn-sm" onclick="" disabled>Update Bill Amount</button>`)
            
        }  
        amenityList = landData.amenities
        for (const amenity in amenityList) {
            $("#amenity-list").append(`<li class="list-group-item d-flex justify-content-between align-items-center">${amenityList[amenity]}</li>`)
        }
        waitingList = plotData.waitingList
        
        if(tenantData == ""){
            if(waitingList.length == 0){
                $("#wait-list").append(`<li class="list-group-item d-flex justify-content-between align-items-center">No one is waiting for this plot</li>`)
            }else{
                for (const tenant in waitingList) {
                    $("#wait-list").append(`<li style="cursor:pointer" class="list-group-item d-flex justify-content-between align-items-center">${waitingList[tenant]}<button type="button" class="btn btn-success btn-xs" onClick="approveWaiter('${waitingList[tenant]}')">Rent To Me</button></li>`)
                }
            }
        }else{
            $("#wait-list").append(`<li class="list-group-item d-flex justify-content-between align-items-center">Your plot is currently occupied</li>`)  
        }
        
        $("#billAmt").append(`£${plotData.price}`);
        $("#plot-id").append(`${plotData.plotID}`);

        //ADD MAP
        let coords = plotData.coords
        var plotPolygon = L.polygon(coords);
        plotPolygon.setStyle({
          fillColor: "#335c4a",
          fillOpacity: "0.8",
          color: "#ffffff",
          opacity: 0.8,
        });

        map = L.map("map", {
          fullscreenControl: true,
        });
        map.fitBounds(plotPolygon.getBounds())
        var bing = new L.BingLayer(
          "Au6SI2Fvtrfu1bBnnHpB3sQnrVt6CB5a90plCjKAZaNf6iw-VITkKDuTee9ukRpz",
          { imagerySet: "AerialWithLabelsOnDemand" }
        );
        map.addLayer(bing);
        plotPolygon.addTo(map);
    },
    error: function (err) {
      console.warn(`Error with: ${apiPath}`);
//       $("#plot-list").append(
//         `<li class="list-group-item d-flex justify-content-between align-items-center">No plots found.</li>`
//       );
    },
  });
}

function updateBillAmount(){
    let newPrice = prompt("New annual charge")
    let confirmChange = confirm("Are you sure you want to charge: £" + newPrice.toString() + " annualy?")
    if(confirmChange){
        let apiPath = `${env}/api/updatePlotBill`;
        let payload = JSON.stringify({ sessionID: SESSION_ID, landID: land, plotID: plot, bill: newPrice });
        $.ajax({
            url: apiPath,
            type: "post",
            data: payload,
            dataType: "json",
            contentType: "application/json",
            success: function (data) {
                alert(data.Status)
                location.reload();
        },
        error: function (err) {
          console.warn(`Error with: ${apiPath}`);
    //       $("#plot-list").append(
    //         `<li class="list-group-item d-flex justify-content-between align-items-center">No plots found.</li>`
    //       );
        },
      });
    }else{
        alert("Not changing price")
    }
    
}

getPlotDetails();