$(".message a").click(function () {
  $("form").animate({ height: "toggle", opacity: "toggle" }, "slow");
  $(".status-message").removeClass("visible-true");
  $(".status-message").addClass("visible-false");
});

$(".register-form").submit(function (e) {
  e.preventDefault();
  $.post(
    "register",
    {
      username: $("#rusername").val(),
      password: $("#rpassword").val(),
      email: $("#remail").val(),
      phonenumber: $("#rphonenumber").val(),
      role: $("#rselect").val(),
    },
    function (data, status) {
      if (data == "success") {
        window.location.replace(window.location.origin + "/login");
      } else {
        $(".status-message").html(data);
        $(".status-message").removeClass("visible-false");
        $(".status-message").addClass("visible-true");
      }
    }
  );
});
