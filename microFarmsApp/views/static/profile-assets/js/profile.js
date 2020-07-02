var SESSION_ID = $.cookie("userSession");

function getInfo() {
  let apiPath = `${env}/api/getUserInfo`;
  let payload = JSON.stringify({ sessionID: SESSION_ID });

  $.ajax({
    url: apiPath,
    type: "post",
    data: payload,
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      // console.info(data);

      if (data[1].length == 0) {
        // if object is empty
        console.log("Something very wrong happened");
      } else {
        console.log(data[1].email);
        $("#email").val(`${data[1].email}`);
        $("#fName").val(`${data[1].fName}`);
        $("#lName").val(`${data[1].lName}`);
        $("#phoneNo").val(`${data[1].phoneNo}`);
        $("#fullName").append(`${data[1].fName} ${data[1].lName}`);
        $("#role").append(`${data[1].role}`);
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

function updateUserInfo() {
  let apiPath = `${env}/api/updateUserInfo`;
  let payload = JSON.stringify({
    sessionID: SESSION_ID,
    email: $("#email").val(),
    fName: $("#fName").val(),
    lName: $("#lName").val(),
    phoneNo: $("#phoneNo").val(),
  });

  $.ajax({
    url: apiPath,
    type: "post",
    data: payload,
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      // console.info(data);

      console.log(data);
      location.reload();
    },
    error: function (err) {
      console.warn(`Error with: ${apiPath}`);
      console.log(err);
    },
  });
}

function updateUserPassword() {
  let apiPath = `${env}/api/updatePassword`;
  if ($("#newPassword").val() != $("#newPasswordConfirm").val()) {
    $("#passwordError").append("Your new password fields do not match!");
  } else {
    let payload = JSON.stringify({
      sessionID: SESSION_ID,
      currentPassword: $("#currentPassword").val(),
      newPassword: $("#newPassword").val(),
    });

    $.ajax({
      url: apiPath,
      type: "post",
      data: payload,
      dataType: "json",
      contentType: "application/json",
      success: function (data) {
        // console.info(data);
        $("#passwordError").append("Password changed successfully!");
        console.log(data);
      },
      error: function (err) {
        console.warn(`Error with: ${apiPath}`);
        console.log(err);
      },
    });
  }
}

$("#updateUserInfo").on("click", function () {
  updateUserInfo();
});

$("#changePassword").on("click", function () {
  updateUserPassword();
});
$("#updateUserInfo").on("keydown", function (e) {
  if (e.keyCode === 13) {
    updateUserInfo();
  }
});
$("#changePassword").on("keydown", function (e) {
  if (e.keyCode === 13) {
    updateUserPassword();
  }
});

getInfo();
