$("#btnRun3").click(function () {
  $.ajax({
    url: "libs/php/getCountryInfo.php",
    type: "POST",
    dataType: "json",
    data: {
      lat: $("#slideLatitude").val(),
      lng: $("#slideLongitude").val(),
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
