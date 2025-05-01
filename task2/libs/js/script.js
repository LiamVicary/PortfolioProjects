$("#btnRun2").click(function () {
  $.ajax({
    url: "libs/php/getCountryInfo.php",
    type: "POST",
    dataType: "json",
    data: {
      lng: $("#slideLatitude").val(),
      lat: $("#slideLongitude").val(),
    },
    success: function (result) {
      console.log(JSON.stringify(result));

      if (result.status.name == "ok") {
        $("#txtLatitude").html(result["data"][0]["lat"]);
        $("#txtLongitude").html(result["data"][0]["lng"]);
        $("#txtCountryName").html(result["data"][0]["countryName"]);
        $("#txtSunrise").html(result["data"][0]["sunrise"]);
        $("#txtSunset").html(result["data"][0]["sunset"]);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      //error
    },
  });
});
