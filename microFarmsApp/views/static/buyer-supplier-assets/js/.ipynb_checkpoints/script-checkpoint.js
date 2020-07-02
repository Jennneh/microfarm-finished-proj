$(document).ready(function () {
  $("#searchProduce").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $("#produceList label").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });
});

$(document).ready(function () {
  $("#searchTenant").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $("#tenantList label").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });
});
