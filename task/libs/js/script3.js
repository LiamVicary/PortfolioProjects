$("#btnRun3").click(function () {
  $.ajax({
    url: "libs/php/getOcean.php",
    type: "POST",
    dataType: "json",
    data: {
      lat: $("#slideLatitudeOcean").val(),
      lng: $("#slideLongitudeOcean").val(),
    },
    success: function (result) {
      console.log(JSON.stringify(result));

      if (result.status.name == "ok") {
        $("#txtOceanName").html(result["data"][0]["name"]);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      //error
    },
  });
});
