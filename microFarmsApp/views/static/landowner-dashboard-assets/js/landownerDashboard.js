var SESSION_ID = $.cookie("userSession");

function getLand() {
  let apiPath = `${env}/api/getLandownerLand`;
  let payload = JSON.stringify({ sessionID: SESSION_ID });

  $.ajax({
    url: apiPath,
    type: "post",
    data: payload,
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      console.info(data);

      if (data.length == 0) {
        // if landowner no land
        $("#land-list").append(
          `<li class="list-group-item d-flex justify-content-between align-items-center">No land found.</li>`
        );
      } else {
        data.forEach((land) => {
          let landId = land.landID;
          let fName = land.friendlyName;

          $("#land-list")
            .append(`<li class="list-group-item d-flex justify-content-between align-items-center">
                      ${fName}
                      <span class="badge badge-primary badge-pill">${land.plotIDs.length}</li>`);
        });
      }
    },
    error: function (err) {
      console.warn(`Error with: ${apiPath}`);
      $("#land-list").append(
        `<li class="list-group-item d-flex justify-content-between align-items-center">No land found.</li>`
      );
    },
  });
}

function getPlots() {
  let apiPath = `${env}/api/getLandownerPlots`;
  let payload = JSON.stringify({ sessionID: SESSION_ID });

  $.ajax({
    url: apiPath,
    type: "post",
    data: payload,
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      // console.info(data);

      if (data.length == 0) {
        // if landowner has no plots
        $("#plot-list").append(
          `<li class="list-group-item d-flex justify-content-between align-items-center">No plots found.</li>`
        );
      } else {
        data.forEach((plot) => {
          let landId = plot.plotID;
          let plotId = plot.landID;

          $("#plot-list")
            .append(`<li class="list-group-item d-flex justify-content-between align-items-center">
                      <a href="/landownerPlot?land=${landId}&plot=${plotId}">${landId} - ${plotId}</a>
                      <span class="badge badge-primary badge-pill">${plot.status}
                      </span><span class="badge badge-primary badge-pill">£${plot.price}</span></li>`);
        });
      }
    },
    error: function (err) {
      console.warn(`Error with: ${apiPath}`);
      $("#plot-list").append(
        `<li class="list-group-item d-flex justify-content-between align-items-center">No plots found.</li>`
      );
    },
  });
}

function getSuppliers(){
  let apiPath = `${env}/api/getInterestedSuppliers`;
  let payload = JSON.stringify({ sessionID: SESSION_ID });

  $.ajax({
    url: apiPath,
    type: "post",
    data: payload,
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
//         console.info(data);
        fillSuppliers(data)
    },
    error: function (err) {
      console.warn(`Error with: ${apiPath}`);
    },
  });
}

function fillSuppliers(suppliersObject){   
    for(supplier of suppliersObject){
        let sellingStr = ""
        if(supplier.selling != ""){
            for(item of supplier.selling){
//                 console.log(item)
                sellingStr += item + ", "
            }
            console.log(supplier)
            sellingStr = sellingStr.substring(0, sellingStr.length - 2)
        $("#waiting-list").append(
        `<li class="list-group-item d-flex justify-content-between align-items-center" onclick='showSupplierInfo("${supplier.uname}")'>${sellingStr} <span class="badge badge-primary badge-pill">${supplier.uname}</li>`
      );
        }
        
    }
}


function showSupplierInfo(name){
    let apiPath = `${env}/api/showSupplierInfo`;
  let payload = JSON.stringify({ sessionID: SESSION_ID, username: name });

  $.ajax({
    url: apiPath,
    type: "post",
    data: payload,
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      console.info(data);
      $("#supplier-phone").text("Contact Mobile: " + data.phoneNo);
      $("#supplier-email").text("Contact Email: " + data.email);
      $("#noPart").remove()

    },
    error: function (err) {
      console.warn(`Error with: ${apiPath}`);
      
    },
  });
}

getSuppliers();
getLand();
getPlots();
