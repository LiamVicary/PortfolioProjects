// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

var map;
window.poiMarkers = [];
window.airportMarkers = [];
window.arenaMarkers = [];
window.hospitalMarkers = [];
window.universityMarkers = [];
window.weirdAttractionMarkers = [];
window.parkMarkers = [];

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

// NEWS MODAL
var newsBtn = L.easyButton("fa-newspaper fa-xl", function (btn, map) {
  $("#newsModal").modal("show");
});

// WIKI MODAL
var wikiBtn = L.easyButton(
  "fa-brands fa-wikipedia-w fa-xl",
  function (btn, map) {
    $("#wikiModal").modal("show");
  }
);

// SINGLE DOMCONTENTLOADED HANDLER FOR EVERYTHING

document.addEventListener("DOMContentLoaded", () => {
  console.log("🔥 index.js loaded");

  // 1️⃣ Quick test: hit your PHP proxy directly and dump the response
  (async function debugCurrencyProxy() {
    try {
      console.log("→ Fetching PHP/currencies_proxy.php …");
      const resp = await fetch("PHP/currencies_proxy.php");
      console.log("← status:", resp.status);
      const text = await resp.text();
      console.log("← body:", text);
    } catch (err) {
      console.error("‼️ proxy fetch error:", err);
    }
  })();

  // INITIALISE MAP & LAYERS

  map = L.map("map", {
    layers: [streets],
  }).setView([54.5, -4], 6);

  L.control.layers(basemaps).addTo(map);
  infoBtn.addTo(map);
  weatherBtn.addTo(map);
  currencyBtn.addTo(map);
  flagBtn.addTo(map);
  newsBtn.addTo(map);
  wikiBtn.addTo(map);

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

  // --------------------------------------WIKI MODAL--------------------------------------

  async function showWiki(country) {
    const titleEl = document.getElementById("modalWikiTitle");
    const extractEl = document.getElementById("modalWikiExtract");
    const wikiModal = new bootstrap.Modal(document.getElementById("wikiModal"));

    titleEl.textContent = country;
    extractEl.textContent = "Loading…";
    wikiModal.show();

    try {
      const resp = await fetch(
        `PHP/get_wiki.php?country=${encodeURIComponent(country)}`
      );
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();

      // Decide what to show
      if (data.source) {
        // Make a clickable link
        extractEl.innerHTML = `
            <a href="${data.source}" 
               target="_blank" 
               rel="noopener noreferrer">
              Read more on Wikipedia
            </a>
          `;
      } else if (data.extract) {
        extractEl.textContent = data.extract;
      } else if (data.description) {
        extractEl.textContent = data.description;
      } else {
        extractEl.textContent = "No summary available.";
      }
    } catch (err) {
      console.error(err);
      extractEl.textContent = "Could not load summary.";
    }
  }
  // --------------------------------------CURRENCY MODAL--------------------------------------

  const currencyModalEl = document.getElementById("currencyModal");
  const fromSelect = document.getElementById("fromCurrency");
  const toSelect = document.getElementById("toCurrency");
  console.log("fromSelect:", fromSelect, "toSelect:", toSelect);
  const amountInput = document.getElementById("inputAmount");
  const resultEl = document.getElementById("conversionResult");

  // 1) detect user currency
  async function getUserCurrency() {
    if (!navigator.geolocation) return "USD";
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          const res = await fetch(`PHP/geocode.php?lat=${lat}&lng=${lng}`);
          const data = await res.json();
          resolve(data?.results?.[0]?.annotations?.currency?.iso_code || "USD");
        },
        () => resolve("USD")
      );
    });
  }

  // 2) populate both <select>s
  async function populateCurrencySelects() {
    console.log("▶ populateCurrencySelects fired");
    fromSelect.innerHTML = "";
    toSelect.innerHTML = "";
    const userCurr = await getUserCurrency();
    const res = await fetch("PHP/currencies_proxy.php");
    const data = await res.json();

    // Check if the API call was successful
    if (!data.success) {
      console.error("Symbols API returned", data);
      // Handle the error appropriately, e.g., display a message to the user
      return;
    }

    // Rest of the code to populate the selects
    if (!data.currencies) {
      console.error("Symbols API returned", data);
      return;
    }
    Object.entries(data.currencies).forEach(([code, fullName]) => {
      const label = `${code} — ${fullName}`;
      fromSelect.append(new Option(label, code));
      toSelect.append(new Option(label, code));
    });

    fromSelect.value = "GBP";
    toSelect.value = userCurr;
  }

  // 3) when modal is shown, fill the dropdowns
  currencyModalEl.addEventListener("show.bs.modal", populateCurrencySelects);

  // 4) on form submit, do the conversion
  document
    .getElementById("currencyForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const amount = +amountInput.value;
      const from = fromSelect.value;
      const to = toSelect.value;
      try {
        const res = await fetch(
          `PHP/convert_currency.php?from=${from}&to=${to}&amount=${amount}`
        );
        const { result } = await res.json();
        if (result != null) {
          resultEl.textContent = `${amount} ${from} = ${result.toFixed(
            2
          )} ${to}`;
        } else {
          resultEl.textContent = "Conversion failed";
        }
      } catch (err) {
        resultEl.textContent = "Error";
        console.error(err);
      }
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

        fetchAndDisplayPOI(countryName);
        fetchAndDisplayAirports(countryName);
        fetchAndDisplayArenas(countryName);
        fetchAndDisplayHospitals(countryName);
        fetchAndDisplayUniversities(countryName);
        fetchAndDisplayWeirdAttractions(countryName);
        fetchAndDisplayNationalParks(countryName);

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
              iconSize: [80, 80],
              iconAnchor: [40, 80],
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

    // Geocode the POI's
    function fetchAndDisplayPOI(countryName) {
      const query = `landmark in ${countryName}`;

      fetch(`PHP/geocode_google_places.php?q=${encodeURIComponent(query)}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (!data.results || data.results.length === 0) {
            console.warn("No POIs found from Places API");
            return;
          }

          // Clear old POI markers if any
          if (window.poiMarkers) {
            window.poiMarkers.forEach((marker) => map.removeLayer(marker));
          }
          window.poiMarkers = [];

          const top10 = data.results.slice(0, 10); // Get top 6 results

          top10.forEach((result, index) => {
            const { lat, lng } = result.geometry.location;
            const name = result.name;
            const address = result.formatted_address;

            const poiIcon = L.icon({
              iconUrl: "images/POI-marker.png",
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40],
            });

            const marker = L.marker([lat, lng], { icon: poiIcon })
              .addTo(map)
              .bindPopup(`<strong>${name}</strong><br>${address}`);

            window.poiMarkers.push(marker);
          });

          console.log("Displayed top 3 POIs for", countryName);
        })
        .catch((err) => {
          console.error("Google Places API POI fetch error:", err);
        });
    }

    function fetchAndDisplayAirports(countryName) {
      const query = `major airports in ${countryName}`;

      fetch(`PHP/geocode_google_places.php?q=${encodeURIComponent(query)}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (!data.results || data.results.length === 0) {
            console.warn("No airports found from Places API");
            return;
          }

          // Clear old airport markers if any
          if (window.airportMarkers) {
            window.airportMarkers.forEach((marker) => map.removeLayer(marker));
          }
          window.airportMarkers = [];

          const top5 = data.results.slice(0, 5); // Get top 3 airports

          top5.forEach((result) => {
            const { lat, lng } = result.geometry.location;
            const name = result.name;
            const address = result.formatted_address;

            const airportIcon = L.icon({
              iconUrl: "images/airport-marker.png", // 🛩️ You can design your own icon
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40],
            });

            const marker = L.marker([lat, lng], { icon: airportIcon })
              .addTo(map)
              .bindPopup(`<strong>${name}</strong><br>${address}`);

            window.airportMarkers.push(marker);
          });

          console.log("Displayed up to 3 major airports for", countryName);
        })
        .catch((err) => {
          console.error("Google Places API airport fetch error:", err);
        });
    }

    function fetchAndDisplayArenas(countryName) {
      const query = `major sports venues in ${countryName}`;

      fetch(`PHP/geocode_google_places.php?q=${encodeURIComponent(query)}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (!data.results || data.results.length === 0) {
            console.warn("No sporting arenas found from Places API");
            return;
          }

          // Clear previous arena markers
          if (window.arenaMarkers) {
            window.arenaMarkers.forEach((marker) => map.removeLayer(marker));
          }
          window.arenaMarkers = [];

          const top8 = data.results.slice(0, 8);

          top8.forEach((result) => {
            const { lat, lng } = result.geometry.location;
            const name = result.name;
            const address = result.formatted_address;

            const arenaIcon = L.icon({
              iconUrl: "images/arena-marker.png", // You can design a stadium icon
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40],
            });

            const marker = L.marker([lat, lng], { icon: arenaIcon })
              .addTo(map)
              .bindPopup(`<strong>${name}</strong><br>${address}`);

            window.arenaMarkers.push(marker);
          });

          console.log("Displayed up to 3 sporting arenas for", countryName);
        })
        .catch((err) => {
          console.error("Google Places API sports arena fetch error:", err);
        });
    }
    function fetchAndDisplayHospitals(countryName) {
      const query = `major hospitals in ${countryName}`;

      fetch(`PHP/geocode_google_places.php?q=${encodeURIComponent(query)}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (!data.results || data.results.length === 0) {
            console.warn("No hospitals found from Places API");
            return;
          }

          // Clear previous hospital markers
          if (window.hospitalMarkers) {
            window.hospitalMarkers.forEach((marker) => map.removeLayer(marker));
          }
          window.hospitalMarkers = [];

          const top3 = data.results.slice(0, 3); // Show 3 hospitals

          top3.forEach((result) => {
            const { lat, lng } = result.geometry.location;
            const name = result.name;
            const address = result.formatted_address;

            const hospitalIcon = L.icon({
              iconUrl: "images/hospital-marker.png", // Use a red cross or medical icon
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40],
            });

            const marker = L.marker([lat, lng], { icon: hospitalIcon })
              .addTo(map)
              .bindPopup(`<strong>${name}</strong><br>${address}`);

            window.hospitalMarkers.push(marker);
          });

          console.log("Displayed up to 3 hospitals for", countryName);
        })
        .catch((err) => {
          console.error("Google Places API hospital fetch error:", err);
        });
    }

    function fetchAndDisplayUniversities(countryName) {
      const query = `top universities in ${countryName}`;

      fetch(`PHP/geocode_google_places.php?q=${encodeURIComponent(query)}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (!data.results || data.results.length === 0) {
            console.warn("No universities found from Places API");
            return;
          }

          // Clear previous university markers
          if (window.universityMarkers) {
            window.universityMarkers.forEach((marker) =>
              map.removeLayer(marker)
            );
          }
          window.universityMarkers = [];

          const top5 = data.results.slice(0, 5); // Get top 3 universities

          top5.forEach((result) => {
            const { lat, lng } = result.geometry.location;
            const name = result.name;
            const address = result.formatted_address;

            const universityIcon = L.icon({
              iconUrl: "images/university-marker.png", // 🎓 Use a school/campus icon
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40],
            });

            const marker = L.marker([lat, lng], { icon: universityIcon })
              .addTo(map)
              .bindPopup(`<strong>${name}</strong><br>${address}`);

            window.universityMarkers.push(marker);
          });

          console.log("Displayed top 3 universities for", countryName);
        })
        .catch((err) => {
          console.error("Google Places API university fetch error:", err);
        });
    }

    function fetchAndDisplayWeirdAttractions(countryName) {
      const query = `weird attractions in ${countryName}`;

      fetch(`PHP/geocode_google_places.php?q=${encodeURIComponent(query)}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (!data.results || data.results.length === 0) {
            console.warn("No weird attractions found from Places API");
            return;
          }

          // Remove previous weird attraction markers
          if (window.weirdAttractionMarkers) {
            window.weirdAttractionMarkers.forEach((marker) =>
              map.removeLayer(marker)
            );
          }
          window.weirdAttractionMarkers = [];

          const top3 = data.results.slice(0, 3);

          top3.forEach((result) => {
            const { lat, lng } = result.geometry.location;
            const name = result.name;
            const address = result.formatted_address;

            const weirdIcon = L.icon({
              iconUrl: "images/weird-marker.png", // 🎭 Or a question mark / alien / skull
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40],
            });

            const marker = L.marker([lat, lng], { icon: weirdIcon })
              .addTo(map)
              .bindPopup(`<strong>${name}</strong><br>${address}`);

            window.weirdAttractionMarkers.push(marker);
          });

          console.log("Displayed weird attractions for", countryName);
        })
        .catch((err) => {
          console.error("Google Places API weird attraction fetch error:", err);
        });
    }

    function fetchAndDisplayNationalParks(countryName) {
      const query = `national parks in ${countryName}`;

      fetch(`PHP/geocode_google_places.php?q=${encodeURIComponent(query)}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (!data.results || data.results.length === 0) {
            console.warn("No national parks found from Places API");
            return;
          }

          // Clear previous national park markers
          if (window.parkMarkers) {
            window.parkMarkers.forEach((marker) => map.removeLayer(marker));
          }
          window.parkMarkers = [];

          const top3 = data.results.slice(0, 3);

          top3.forEach((result) => {
            const { lat, lng } = result.geometry.location;
            const name = result.name;
            const address = result.formatted_address;

            const parkIcon = L.icon({
              iconUrl: "images/park-marker.png", // 🏞️ Use a tree, mountain, or leaf icon
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40],
            });

            const marker = L.marker([lat, lng], { icon: parkIcon })
              .addTo(map)
              .bindPopup(`<strong>${name}</strong><br>${address}`);

            window.parkMarkers.push(marker);
          });

          console.log("Displayed national parks for", countryName);
        })
        .catch((err) => {
          console.error("Google Places API national park fetch error:", err);
        });
    }

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

    // MODAL CURRENCY
    fetch(
      `PHP/get_currency_rest.php?country=${encodeURIComponent(countryName)}`
    )
      .then((res) => res.json())
      .then((data) => {
        const td = document.getElementById("modalCountryCurrency");
        if (data.symbol && data.name) {
          td.textContent = `${data.symbol} — ${data.name}`;
        } else {
          td.textContent = "—";
          console.error("Currency lookup failed", data.error);
        }
      })
      .catch((err) => {
        document.getElementById("modalCountryCurrency").textContent = "Error";
        console.error("Fetch error:", err);
      });

    // MODAL BORDERING COUNTRIES
    fetch(`PHP/get_borders.php?country=${encodeURIComponent(countryName)}`)
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("HTTP " + res.status))
      )
      .then((data) => {
        const cell = document.getElementById("modalCountryBorders");
        if (Array.isArray(data.borders) && data.borders.length) {
          cell.textContent = data.borders.join(", ");
        } else {
          cell.textContent = "None";
        }
      })
      .catch((err) => {
        console.error("Borders lookup failed:", err);
        document.getElementById("modalCountryBorders").textContent = "Error";
      });

    // --------------------------------------FETCH AND DRAW COUNTRY BORDER GEOJSON--------------------------------------
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

    // --------------------------------------WEATHER MODAL--------------------------------------

    /* Updated Weather Modal JS */
    const countrySelect = document.querySelector("#countrySelect");
    const weatherModalEl = document.querySelector("#weatherModal");

    // Fetch when user changes country
    countrySelect.addEventListener("change", () => {
      const idx = countrySelect.selectedIndex;
      if (idx <= 0) return;
      const country = countrySelect.options[idx].text;
      fetchCurrentWeather(country);
    });

    // Also fetch on modal open for already-selected country
    $(weatherModalEl).on("show.bs.modal", () => {
      const idx = countrySelect.selectedIndex;
      if (idx > 0) {
        const country = countrySelect.options[idx].text;
        fetchCurrentWeather(country);
      }
    });

    function fetchCurrentWeather(country) {
      // Current weather
      fetch(
        `PHP/get_current_weather.php?country=${encodeURIComponent(country)}`
      )
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          // Top row: country, day
          document.getElementById("modalWeatherLocation").textContent =
            data.location.country;
          const local = data.location.localtime; // "YYYY-MM-DD hh:mm"
          const dayName = new Date(local).toLocaleDateString("en-GB", {
            weekday: "long",
          });
          document.getElementById("modalWeatherDay").textContent = dayName;

          // Icons & condition
          document.getElementById("modalWeatherIconBig").src =
            data.current.condition.icon;
          document.getElementById("modalConditionBig").textContent =
            data.current.condition.text;

          // Temperature, humidity, wind
          document.getElementById(
            "modalTemperatureBig"
          ).textContent = `${data.current.temp_c}°C`;
          document.getElementById(
            "modalHumidity"
          ).textContent = `${data.current.humidity}%`;
          document.getElementById(
            "modalWindSpeed"
          ).textContent = `${data.current.wind_mph} mph`;

          // Fetch forecast
          return fetch(
            `PHP/get_forecast.php?country=${encodeURIComponent(country)}`
          );
        })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((forecastData) => {
          // WeatherAPI returns forecast.forecastday array
          const days = forecastData.forecast.forecastday;
          const today = days[0].day;

          // Mid row: morning, afternoon, evening
          document.querySelector(
            "#modalForecastMorningTemp"
          ).textContent = `${Math.round(today.mintemp_c)}°C`;
          document.querySelector(
            "#modalForecastAfternoonTemp"
          ).textContent = `${Math.round(today.maxtemp_c)}°C`;
          document.querySelector(
            "#modalForecastEveningTemp"
          ).textContent = `${Math.round(today.maxtemp_c)}°C`;

          document.querySelector("#modalForecastMorningIcon").src =
            today.condition.icon;
          document.querySelector("#modalForecastAfternoonIcon").src =
            today.condition.icon;
          document.querySelector("#modalForecastEveningIcon").src =
            today.condition.icon;

          document.querySelector("#modalForecastMorningCond").textContent =
            today.condition.text;
          document.querySelector("#modalForecastAfternoonCond").textContent =
            today.condition.text;
          document.querySelector("#modalForecastEveningCond").textContent =
            today.condition.text;

          // Bottom row: next three days
          days.slice(1, 4).forEach((d, idx) => {
            if (!d) return; // no day object? skip
            const slot = idx + 1; // 1,2,3

            // 1) compute date & name
            const dateStr = d.date;
            const dayNameShort = new Date(dateStr).toLocaleDateString("en-GB", {
              weekday: "short",
            });

            // 2) update elements, but only if they exist
            const nameEl = document.getElementById(
              `modalForecastDay${slot}Name`
            );
            if (nameEl) nameEl.textContent = dayNameShort;

            const dateEl = document.getElementById(
              `modalForecastDay${slot}Date`
            );
            if (dateEl) dateEl.textContent = dateStr;

            const iconEl = document.getElementById(
              `modalForecastDay${slot}Icon`
            );
            if (iconEl) iconEl.src = d.day.condition.icon;

            const highEl = document.getElementById(
              `modalForecastDay${slot}High`
            );
            if (highEl) highEl.textContent = `${Math.round(d.day.maxtemp_c)}°`;

            const lowEl = document.getElementById(`modalForecastDay${slot}Low`);
            if (lowEl) lowEl.textContent = `${Math.round(d.day.mintemp_c)}°`;
          });
        })
        .catch((err) => console.error("Weather error:", err));
    }

    const newsModalEl = document.getElementById("newsModal");
    function fetchCountryNews(countryName) {
      const body = document.getElementById("newsModalBody");
      body.innerHTML = '<p class="text-muted">Loading…</p>';
      fetch(`PHP/news_proxy.php?country=${encodeURIComponent(countryName)}`)
        .then((res) => res.json())
        .then(({ articles }) => {
          if (!articles || articles.length === 0) {
            body.innerHTML = "<p>No recent news found.</p>";
            return;
          }
          const list = document.createElement("ul");
          list.className = "list-group";
          articles.forEach((a) => {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.innerHTML = `
          <a href="${a.link}" target="_blank" class="fw-bold">${a.title}</a>
          <p class="mb-0 small text-muted">${a.source_id} • ${new Date(
              a.pubDate
            ).toLocaleDateString()}</p>
        `;
            list.appendChild(li);
          });
          body.innerHTML = "";
          body.appendChild(list);
        })
        .catch((err) => {
          console.error("News fetch error:", err);
          document.getElementById("newsModalBody").innerHTML =
            '<p class="text-danger">Failed to load news.</p>';
        });
    }

    // When user picks a new country:
    countrySelect.addEventListener("change", () => {
      const idx = countrySelect.selectedIndex;
      if (idx <= 0) return;
      const country = countrySelect.options[idx].text;
      fetchCountryNews(country);
    });

    // Also when opening the modal (in case country was already selected):
    $("#newsModal").on("show.bs.modal", () => {
      const idx = countrySelect.selectedIndex;
      if (idx > 0) {
        const country = countrySelect.options[idx].text;
        fetchCountryNews(country);
      }
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
