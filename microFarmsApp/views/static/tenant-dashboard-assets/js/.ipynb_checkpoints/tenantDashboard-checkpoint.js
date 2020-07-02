var SESSION_ID = $.cookie("userSession");

function getBuyers() {
  let apiPath = `${env}/api/getInterestedBuyers`;
  let payload = JSON.stringify({ sessionID: SESSION_ID });

  $.ajax({
    url: apiPath,
    type: "post",
    data: payload,
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      // console.info(data);
      if (data == undefined || data == "" || data == null || data[0].length == 0) {
        $("#buyer-list").append(
          `<li class="list-group-item d-flex justify-content-between align-items-center">Currently no interested buyers.</li>`
        );
      }else{
          let buyerCount = 0;
      data.forEach((buyer) => {
        let buyerUsername = buyer[0];
        let buyerInterestedItems = buyer[1];
        buyerInterestedItems = Array.from(new Set(buyerInterestedItems))

        $("#buyer-list")
          .append(`<li class="list-group-item d-flex justify-content-between align-items-center" onclick='showBuyerInfo("${buyerUsername}")'>
                <a href="#" id="buyer-${buyerCount}"></a>
                <span class="badge badge-primary badge-pill">${buyerUsername}</span></li>`);

        let itemString = "";
        buyerInterestedItems.forEach((item) => {
          itemString += `${item}, `;
        });
        itemString = itemString.replace(/,([^,]*)$/, "$1"); // Remove last comma
        $(`#buyer-${buyerCount}`).append(itemString);

        buyerCount++;
      });
      }

      
    },
    error: function (err) {
      console.warn(`Error with: ${apiPath}`);
      $("#buyer-list").append(
        `<li class="list-group-item d-flex justify-content-between align-items-center">Currently no interested buyers.</li>`
      );
    },
  });
}

function showBuyerInfo(name){
    let apiPath = `${env}/api/getBuyerContact`;
  let payload = JSON.stringify({ sessionID: SESSION_ID, username: name });

  $.ajax({
    url: apiPath,
    type: "post",
    data: payload,
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      console.info(data);
      $("#buyer-phone").text("Contact Mobile: " + data.phoneNo);
      $("#buyer-email").text("Contact Email: " + data.email);
      $("#noPart").remove()
    },
    error: function (err) {
      console.warn(`Error with: ${apiPath}`);
      
    },
  });
}

function getBills() {
  let apiPath = `${env}/api/getTenantBills`;
  let payload = JSON.stringify({ sessionID: SESSION_ID });

  $.ajax({
    url: apiPath,
    type: "post",
    data: payload,
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      // console.info(data);

      let billTotal = data;
      $("#bill-list").append(
        `<li class="list-group-item d-flex justify-content-between align-items-center">Annual Bill Amount: £${billTotal}</li>`
      );
    },
    error: function (err) {
      console.warn(`Error with: ${apiPath}`);
    },
  });
}

function getPlots() {
  let apiPath = `${env}/api/getPlots`;
  let payload = JSON.stringify({ sessionID: SESSION_ID });

  $.ajax({
    url: apiPath,
    type: "post",
    data: payload,
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      // console.info(data);

      if (data[0].length == 0) {
        // if tenant has no actively rented plots
        $("#plot-list").append(
          `<li class="list-group-item d-flex justify-content-between align-items-center">No actively rented plots.</li>`
        );
      } else {
        data.forEach((plot) => {
          let landId = plot[0];
          let plotId = plot[1];

          $("#plot-list")
            .append(`<li class="list-group-item d-flex justify-content-between align-items-center">
                    <a href="/plot?land=${landId}&plot=${plotId}">${plotId}</a>
                    <span class="badge badge-primary badge-pill">${plot[2]}</span></li>`);
        });
      }
    },
    error: function (err) {
      console.warn(`Error with: ${apiPath}`);
      $("#plot-list").append(
        `<li class="list-group-item d-flex justify-content-between align-items-center">No actively rented plots.</li>`
      );
    },
  });
}

getPlots();
getBills();
getBuyers();
