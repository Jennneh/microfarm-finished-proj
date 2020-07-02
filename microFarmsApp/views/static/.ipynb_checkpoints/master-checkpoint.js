var SESSION_ID = $.cookie("userSession");
var itemList= ["Carrots", "Parsnips", "Potatoes", "Tomatoes", "Strawberries", "Raspberries", "Beans", "Sweet Peas", "Jelly Beans", "Artichokes", "Asparagus", "Aubergine", "Beetroot", "Broccoli", "Brussel Sprouts", "Cabbages", "Cauliflower", "Celery", "Courgettes", "Cucumber", "Garlic", "Ginger", "Leeks", "Lettuce", "Melon", "Mushrooms", "Onions", "Peas", "Pumpkins", "Radish", "Rhubarb", "Spinach", "Spring onion", "Swede"]
var supplyList= ["Seeds", "Water [250L max per month]", "Water [500L max per month]", "Water [1000L max per month]", "Water [Unlimited]", "Tools", "Gas [£50 Credit]", "Gas [£100 Credit]", "Gas [Unlimited Credit]",  "Electricity [£50 Credit]", "Electricity [£100 Credit]","Electricity [Unlimited Credit]", "WiFi [50GB]", "WiFi [100GB]", "WiFi [Unlimited]", "Fertiliser", "Compost"]

function getUsername() {
  let apiPath = `${env}/api/getUserInfo`;
  let payload = JSON.stringify({ sessionID: SESSION_ID });

  $.ajax({
    url: apiPath,
    type: "post",
    data: payload,
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      let uname = data[0]["uname"];
      $("#uname").append(`Welcome, ${uname}!`);
    },
    error: function (err) {
      console.warn(`Error with: ${apiPath}`);
    },
  });
}

getUsername();
