$("#btnRun").click(function () {
  $.ajax({
    url: "libs/php/getCountryInfo.php",
    type: "POST",
    dataType: "json",
    data: {
      q: $("#searchCountry").val().toLowerCase(),
    },
    success: function (result) {
      console.log(JSON.stringify(result));

      if (result.status.name == "ok") {
        $("#txtTitle").html(result["data"][0]["title"]);
        $("#txtSummary").html(result["data"][0]["summary"]);
        $("#txtThumbnailImg").html(
          '<img src="' + result.data[0].thumbnailImg + '" alt="City Thumbnail">'
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      //error
    },
  });
});
