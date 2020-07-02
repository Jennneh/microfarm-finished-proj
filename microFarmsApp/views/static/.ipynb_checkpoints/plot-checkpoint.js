var SESSION_ID = $.cookie("userSession");
var producedItems = []
var existingItems = []

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

let landId = getUrlParameter("land");
let plotId = getUrlParameter("plot");

function cancelPlot() {
    
    let confirmation = confirm("Are you sure you want to give notice on your plot?")
    
    if(confirmation == false){
        alert("Request cancelled!")
        return null
    }
    
  console.log("STARTING");
  let apiPath = `${env}/api/giveNotice`;
  let payload = JSON.stringify({
    sessionID: SESSION_ID,
    landID: landId,
    plotID: plotId,
  });

  $.ajax({
    url: apiPath,
    type: "post",
    data: payload,
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      console.info(data);
      if (data.Status == "Plot already noticed") {
        alert("Notice Already Given.");
            location.reload()

      } else {
        alert("Notice Successfully Given.");
            location.reload()

      }
    },
    error: function (err) {
      console.warn(`Error with: ${apiPath}`);
      alert("Notice Could Not Be Given.");
    },
  });
}
var dt
// Mock jQuery until API is finalised
function getPlotInfo() {
  let apiPath = `${env}/api/getPlotInfo`;
  let payload = JSON.stringify({
    sessionID: SESSION_ID,
    landId: landId,
    plotId: plotId,
  });

  $.ajax({
    url: apiPath,
    type: "post",
    data: payload,
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      // console.info(data);
      dt = data
      console.log(data[2]);
      let landId = data[1].landDetails.landID;
      let landFriendlyName = data[1].landDetails.friendlyName;
      let plotId = data[2].plotDetails.plotID;
      let friendlyName = data[2].plotDetails.friendlyName;
      let amenities = data[1].landDetails.amenities;
      let landownerEmail = data[0].landownerDetails.email;
      let landownerPhone = data[0].landownerDetails.phoneNo;
      let coords = data[2].plotDetails.coords;
      let billAmt = data[2].plotDetails.price;
      let billDate = data[2].plotDetails.billDate;

      // LAND AND PLOT ID
      $("#plot-id").append(`${landFriendlyName} - ${plotId} - ${friendlyName}`);

      // AMENITIES
      amenities.forEach((amenity) => {
        $("#amenity-list")
          .append(`<li class="list-group-item d-flex justify-content-between align-items-center">
                ${amenity}</li>`);
      });

      // CONTACT INFO
      if (landownerEmail != null) {
        $("#landowner-email").append(landownerEmail);
      } else {
        $("#landowner-email").append("None provided");
      }

      if (landownerPhone != null) {
        $("#landowner-phone").append(landownerPhone);
      } else {
        $("#landowner-phone").append("None provided");
      }

      // DOCS LIST
      $("#docs-list").append(
        `<li class="list-group-item d-flex justify-content-between align-items-center">No documents found.</li>`
      );

      // ADD MAP
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


      $("#billAmt").append(`Amount Due: £${billAmt}`);
      $("#billDate").append(`Start Date (Annual Billing): ${billDate}`);
      // start date (Annual billing)
    },
    error: function (err) {
      console.warn(`Error with: ${apiPath}`);
    },
  });
}

function getProduce(){
    let apiPath = `${env}/api/getUserInfo`;
    let payload = JSON.stringify({
        sessionID: SESSION_ID,
    });

    $.ajax({
        url: apiPath,
        type: "post",
        data: payload,
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
//             console.info(data[0].produce);
            for (const element of data[0].produce) {
                if(element[1] == landId && element[2] == plotId){
                    // the produce is in the db already, we need to checkbox the item
                    existingItems.push(element[0])
                }
            }
            writeList();
        },
        error: function (err) {
          console.warn(`Error with: ${apiPath}`);
            writeList();

        },
    });
}

function saveProduce(producedItems){
    //     console.log(producedItems)
    let apiPath = `${env}/api/updateTenantItems`;
    let payload = JSON.stringify({
        sessionID: SESSION_ID,
        landID: landId,
        plotID: plotId,
        produce: producedItems
    });

    $.ajax({
        url: apiPath,
        type: "post",
        data: payload,
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
          console.info(data.Status);
            // say its done
            alert("Produce updated successfully")
            location.reload()
        },
        error: function (err) {
          console.warn(`Error with: ${apiPath}`);
        },
    });
}

function checkAddress(checkbox)
    {
        console.log("Im running")
        if (checkbox.checked == true)
        {
            producedItems.push(checkbox.value)
            console.log("ADDED " + checkbox.value)
        }else{
            const index = producedItems.indexOf(checkbox.value);
            if (index > -2) {
              producedItems.splice(index, 1);
                console.log("REMOVED " + checkbox.value)
            }
        }
    }

function writeList(){

// start populating the checkbox list, if the element we're iterating on is already in the existingItems field, check the box and move on, otherwise carry on
    for (const item of itemList) {
        if(existingItems.includes(item)){
            $("#produceList").append(`<input type="checkbox" name="CheckBoxInputName" value="${item}" id="CheckBox${item}" onclick="checkAddress(this)"/>
                <label class="list-group-item" for="CheckBox${item}">${item}</label>`);
            document.getElementById(`CheckBox${item}`).click();
        }else{
            $("#produceList").append(`<input type="checkbox" name="CheckBoxInputName" value="${item}" id="CheckBox${item}" onclick="checkAddress(this)"/>
                <label class="list-group-item" for="CheckBox${item}">${item}</label>`);
        }
    }
}

function checkPlotNotice() {
  let apiPath = `${env}/api/checkPlotNotice`;
  let payload = JSON.stringify({
    sessionID: SESSION_ID,
    landID: landId,
    plotID: plotId,
  });

  $.ajax({
    url: apiPath,
    type: "post",
    data: payload,
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      console.info(data);
      if (data.Notice == "True") {
//         alert("Notice Already Given.");
          $("#cancelPlot").prop("disabled",true);
          $("#cancelPlot").html("Notice Given");
      } else {
//         alert("Notice Not Given.");
      }
    },
    error: function (err) {
      console.warn(`Error with: ${apiPath}`);
      alert("Notice Could Not Be Checked.");
    },
  });
}

getPlotInfo();
getProduce();
checkPlotNotice();

$("#cancelPlot").on("click", function () {
  cancelPlot();
});


// checkPlotNotice

