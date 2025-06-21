// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

var map;

// tile layers

var streets = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
  }
);

var satellite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
);

var basemaps = {
  Streets: streets,
  Satellite: satellite,
};

// buttons
// EXAMPLE MODAL
var infoBtn = L.easyButton("fa-info fa-xl", function (btn, map) {
  $("#exampleModal").modal("show");
});

// WEATHER MODAL
var weatherBtn = L.easyButton("fa-cloud-sun fa-xl", function (btn, map) {
  $("#weatherModal").modal("show");
});

// CURRENCY MODAL
var currencyBtn = L.easyButton("fa-coins fa-xl", function (btn, map) {
  $("#currencyModal").modal("show");
});

// FLAG MODAL
var flagBtn = L.easyButton("fa-flag fa-xl", function (btn, map) {
  $("#flagModal").modal("show");
});

// SINGLE DOMCONTENTLOADED HANDLER FOR EVERYTHING

document.addEventListener("DOMContentLoaded", () => {
  // INITIALISE MAP & LAYERS

  map = L.map("map", {
    layers: [streets],
  }).setView([54.5, -4], 6);

  L.control.layers(basemaps).addTo(map);
  infoBtn.addTo(map);
  weatherBtn.addTo(map);
  currencyBtn.addTo(map);
  flagBtn.addTo(map);

  // POPULATE <select>

  const sel = document.getElementById("countrySelect");
  if (!sel) {
    console.error("No <select id='countrySelect'> found in the DOM.");
    return;
  }

  fetch("PHP/get_countries.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "get_countries.php returned HTTP " +
            response.status +
            " " +
            response.statusText
        );
      }
      return response.json();
    })
    .then((countries) => {
      sel.innerHTML = "<option value=''>Select a country</option>";

      countries.forEach(({ iso, name }) => {
        const opt = document.createElement("option");
        opt.value = iso;
        opt.textContent = name;
        sel.appendChild(opt);
      });
      console.log("Loaded", countries.length, "countries into <select>.");
    })
    .catch((err) => {
      console.error("Failed to load country list:", err);
      sel.innerHTML = "<option disabled>Error loading countries</option>";
    });

  // --------------------------------------INFORMATION MODAL--------------------------------------
  // FETCH BORDER + GEOCODE

  sel.addEventListener("change", (e) => {
    const isoCode = e.target.value;
    const countryName = sel.options[sel.selectedIndex].text;
    if (!isoCode) {
      console.warn("User selected the blank option; skipping.");
      return;
    }

    // MODAL - REGION
    console.log("User selected ISO =", isoCode, "name =", countryName);

    fetch(`PHP/get_region.php?country=${encodeURIComponent(countryName)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(({ region }) => {
        document.getElementById("modalRegion").textContent = region || "—";
      })
      .catch((err) => {
        console.error("Failed to fetch region:", err);
        document.getElementById("modalRegion").textContent = "Error";
      });

    // MODAL - CAPITAL CITY
    console.log("User selected ISO =", isoCode, "name =", countryName);

    fetch(`PHP/get_capital.php?country=${encodeURIComponent(countryName)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(({ capital }) => {
        const capitalCity =
          Array.isArray(capital) && capital.length ? capital[0] : null;
        document.getElementById("modalCapitalCity").textContent =
          capitalCity || "—";

        if (!capitalCity) return;

        // Geocode the capital city
        fetch(
          `PHP/geocode.php?q=${encodeURIComponent(
            capitalCity + ", " + countryName
          )}`
        )
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .then((geoData) => {
            if (!geoData.results || geoData.results.length === 0) return;

            const { lat, lng } = geoData.results[0].geometry;

            // Remove old marker if any
            if (window.capitalMarker) {
              map.removeLayer(window.capitalMarker);
            }

            const capitalIcon = L.icon({
              iconUrl: "images/capital-marker.png",
              iconSize: [60, 60],
              iconAnchor: [15, 40],
              popupAnchor: [0, -35],
            });

            window.capitalMarker = L.marker([lat, lng], { icon: capitalIcon })
              .addTo(map)
              .bindPopup(
                `<strong>${capitalCity}</strong><br>${lat.toFixed(
                  4
                )}, ${lng.toFixed(4)}`
              );
          })
          .catch((err) => {
            console.error("Failed to geocode capital city:", err);
          });
      })
      .catch((err) => {
        console.error("Failed to fetch capital:", err);
        document.getElementById("modalCapitalCity").textContent = "Error";
      });

    // MODAL - LANGUAGES
    console.log("User selected ISO =", isoCode, "name =", countryName);

    fetch(`PHP/get_languages.php?country=${encodeURIComponent(countryName)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(({ languages }) => {
        const firstLang = languages ? Object.values(languages)[0] : "—";
        document.getElementById("modalLanguage").textContent = firstLang;
      })
      .catch((err) => {
        console.error("Failed to fetch languages:", err);
        document.getElementById("modalLanguage").textContent = "Error";
      });

    // MODAL - POPULATION
    console.log("User selected ISO =", isoCode, "name =", countryName);

    fetch(`PHP/get_population.php?country=${encodeURIComponent(countryName)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(({ population }) => {
        const popText =
          typeof population === "number" ? population.toLocaleString() : "—";

        document.getElementById("modalCountryPopulation").textContent = popText;
      })
      .catch((err) => {
        console.error("Failed to fetch population:", err);
        document.getElementById("modalCountryPopulation").textContent = "Error";
      });

    // MODAL - FLAG
    console.log("User selected ISO =", isoCode, "name =", countryName);

    fetch(`PHP/get_flag.php?country=${encodeURIComponent(countryName)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(({ flag }) => {
        const img = document.getElementById("modalFlagImage");
        if (flag) {
          img.src = flag;
          img.alt = countryName + " flag";
        } else {
          img.src = "";
          img.alt = "No flag available";
        }
      })
      .catch((err) => {
        console.error("Failed to fetch flag:", err);
        const img = document.getElementById("modalFlagImage");
        img.src = "";
        img.alt = "Error loading flag";
      });

    // --------------------------------------WEATHER MODAL--------------------------------------

    const countrySelect = document.querySelector("#countrySelect");
    const weatherModalEl = document.querySelector("#weatherModal");

    countrySelect.addEventListener("change", () => {
      const idx = countrySelect.selectedIndex;
      if (idx <= 0) return;
      const country = countrySelect.options[idx].text;
      fetchCurrentWeather(country);
    });

    function fetchCurrentWeather(country) {
      fetch(
        `PHP/get_current_weather.php?country=${encodeURIComponent(country)}`
      )
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          // COUNTRY & DAY
          document.getElementById(
            "modalWeatherLocation"
          ).textContent = `${data.location.country}`;
          const local = data.location.localtime; // "YYYY-MM-DD hh:mm"
          const dayName = new Date(local).toLocaleDateString("en-GB", {
            weekday: "long",
          });
          document.getElementById("modalWeatherDay").textContent = dayName;

          // ICONS & CONDITION
          document.getElementById("modalWeatherIconBig").src =
            data.current.condition.icon;
          document.getElementById("modalConditionBig").textContent =
            data.current.condition.text;

          // TEMPERATURE, HUMIDITY, WIND
          document.getElementById("modalTemperatureBig").textContent =
            data.current.temp_c + "°C";
          document.getElementById("modalHumidity").textContent =
            data.current.humidity + "%";
          document.getElementById("modalWindSpeed").textContent =
            data.current.wind_mph + " mph";

          const modal = new bootstrap.Modal(weatherModalEl);
          modal.show();

          return fetch(
            `PHP/get_forecast.php?country=${encodeURIComponent(country)}`
          );
        })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((dataForecast) => {
          const today = dataForecast.daily[0];
          document.querySelector("#modalForecastMorningTemp").textContent =
            Math.round(today.temperature.morning) + "°C";
          document.querySelector("#modalForecastAfternoonTemp").textContent =
            Math.round(today.temperature.day) + "°C";
          document.querySelector("#modalForecastEveningTemp").textContent =
            Math.round(today.temperature.evening) + "°C";

          document.querySelector("#modalForecastMorningIcon").src =
            today.condition.icon_url;
          document.querySelector("#modalForecastAfternoonIcon").src =
            today.condition.icon_url;
          document.querySelector("#modalForecastEveningIcon").src =
            today.condition.icon_url;

          document.querySelector("#modalForecastMorningCond").textContent =
            today.condition.description;
          document.querySelector("#modalForecastAfternoonCond").textContent =
            today.condition.description;
          document.querySelector("#modalForecastEveningCond").textContent =
            today.condition.description;

          // 1️⃣ Then render the rest of the 5-day below:
          displayForecast(dataForecast);
        })

        .then(displayForecast)
        .catch((err) => {
          console.error("Weather error:", err);
          // you could show an alert here if you like
        });
    }

    function formatDay(ts) {
      const d = new Date(ts * 1000),
        days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days[d.getDay()];
    }

    function displayForecast(data) {
      const container = document.querySelector("#forecast");
      let html = "";

      data.daily.forEach((day, i) => {
        if (i >= 5) return;
        const hi = Math.round(day.temperature.maximum),
          lo = Math.round(day.temperature.minimum);

        html += `
      <div class="row">
        <div class="col-2 text-center">
          <div class="weather-forecast-date">${formatDay(day.time)}</div>
          <img src="${day.condition.icon_url}"
               class="weather-forecast-icon"
               style="width:40px;height:40px">
          <div class="weather-forecast-temp">
            <span class="weather-forecast-max">${hi}°</span>
            <span class="weather-forecast-min">${lo}°</span>
          </div>
        </div>
      </div>`;
      });

      container.innerHTML = html;
    }

    // FETCH AND DRAW COUNTRY BORDER GEOJSON
    const borderUrl = `PHP/get_countries_border.php?iso=${encodeURIComponent(
      isoCode
    )}`;
    console.log("Fetching border from:", borderUrl);

    fetch(borderUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            "Border fetch failed: " + res.status + " " + res.statusText
          );
        }
        return res.json();
      })
      .then((featureGeoJSON) => {
        if (window.currentCountryLayer) {
          map.removeLayer(window.currentCountryLayer);
        }
        window.currentCountryLayer = L.geoJSON(featureGeoJSON).addTo(map);
        map.fitBounds(window.currentCountryLayer.getBounds());
        console.log("Rendered border for", countryName);
      })
      .catch((err) => {
        console.error("Failed to load border for", countryName, err);
      });

    // GEOCODE THE COUNTRY VIA OPENCAGE

    const phpGeocodeUrl = `PHP/geocode.php?q=${encodeURIComponent(
      countryName
    )}`;

    fetch(phpGeocodeUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            "Proxy geocode failed: " + res.status + " " + res.statusText
          );
        }
        return res.json();
      })
      .then((data) => {
        if (!data.results || data.results.length === 0) {
          console.warn("Proxy returned no results for", countryName, data);
          return;
        }

        const { lat, lng } = data.results[0].geometry;
        console.log(`Geocoded ${countryName} → lat=${lat}, lng=${lng}`);

        if (window.geocodeMarker) {
          map.removeLayer(window.geocodeMarker);
        }
        window.geocodeMarker = L.marker([lat, lng]).addTo(map);

        window.geocodeMarker
          .bindPopup(`${countryName}: [${lat.toFixed(4)}, ${lng.toFixed(4)}]`)
          .openPopup();
        map.setView([lat, lng], 5);

        document.getElementById("modalCountryName").textContent = countryName;
        document.getElementById(
          "modalCoordinates"
        ).textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        $("#exampleModal").modal("show");
      })
      .catch((err) => {
        console.error("Failed to geocode via proxy for", countryName, err);
      });

    map.on("click", function (e) {
      const { lat, lng } = e.latlng;
      const phpReverseUrl = `PHP/geocode.php?lat=${lat}&lng=${lng}`;

      fetch(phpReverseUrl)
        .then((res) => {
          if (!res.ok) throw new Error(res.status + " " + res.statusText);
          return res.json();
        })
        .then((data) => {
          if (data && data.results && data.results.length > 0) {
            const place = data.results[0].formatted;
            L.popup()
              .setLatLng([lat, lng])
              .setContent(
                `You clicked at ${lat.toFixed(4)}, ${lng.toFixed(
                  4
                )}<br>Address: ${place}`
              )
              .openOn(map);
          } else {
            console.warn("No reverse‐geocode result", data);
          }
        })
        .catch((err) => console.error("Reverse geocode error:", err));
    });
  });

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (window.userMarker) {
          map.removeLayer(window.userMarker);
        }
        window.userMarker = L.marker([lat, lng], {
          icon: L.icon({
            //Custom icon goes here
          }),
        })
          .addTo(map)
          .bindPopup("You are here")
          .openPopup();

        map.setView([lat, lng], 10);

        //Reverse‐geocode to get a human‐readable address
        const phpReverseUrl = `PHP/geocode.php?lat=${lat}&lng=${lng}`;
        fetch(phpReverseUrl)
          .then((res) => {
            if (!res.ok) throw new Error(res.status + " " + res.statusText);
            return res.json();
          })
          .then((data) => {
            if (data.results && data.results.length > 0) {
              const place = data.results[0].formatted;
              document.getElementById("modalLocationName").textContent = place;
              window.userMarker.bindPopup(`You are here: ${place}`).openPopup();
            }
          })
          .catch((err) =>
            console.error("Reverse geocode (user location) error:", err)
          );
      },
      (err) => {
        console.error("Geolocation error:", err);
      }
    );
  } else {
    console.warn("Geolocation not available in this browser");
  }
});
