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
// INFO MODAL
var infoBtn = L.easyButton("fa-info fa-xl", function (btn, map) {
  $("#exampleModal").modal("show");
});

// WEATHER MODAL
var weatherBtn = L.easyButton("fa-cloud fa-xl", function (btn, map) {
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
  // INITIALISE MAP & LAYERS

  map = L.map("map", {
    layers: [streets],
  }).setView([54.5, -4], 6);

  window.poiCluster = L.markerClusterGroup({
    polygonOptions: {
      fillColor: "#EE8866",
      color: "#EE8866",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.2,
    },
  }).addTo(map);
  window.airportCluster = L.markerClusterGroup({
    polygonOptions: {
      fillColor: "#EE8866",
      color: "#EE8866",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.2,
    },
  }).addTo(map);
  window.arenaCluster = L.markerClusterGroup({
    polygonOptions: {
      fillColor: "#EE8866",
      color: "#EE8866",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.2,
    },
  }).addTo(map);
  window.hospitalCluster = L.markerClusterGroup({
    polygonOptions: {
      fillColor: "#EE8866",
      color: "#EE8866",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.2,
    },
  }).addTo(map);
  window.universityCluster = L.markerClusterGroup({
    polygonOptions: {
      fillColor: "#EE8866",
      color: "#EE8866",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.2,
    },
  }).addTo(map);
  window.weirdAttractionCluster = L.markerClusterGroup({
    polygonOptions: {
      fillColor: "#EE8866",
      color: "#EE8866",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.2,
    },
  }).addTo(map);
  window.parkCluster = L.markerClusterGroup({
    polygonOptions: {
      fillColor: "#EE8866",
      color: "#EE8866",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.2,
    },
  }).addTo(map);

  const overlayMaps = {
    POIs: window.poiCluster,
    Airports: window.airportCluster,
    Arenas: window.arenaCluster,
    Hospitals: window.hospitalCluster,
    Universities: window.universityCluster,
    "Weird Attractions": window.weirdAttractionCluster,
    Parks: window.parkCluster,
  };
  L.control.layers(basemaps, overlayMaps).addTo(map);

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
              iconSize: [50, 50],
              iconAnchor: [25, 50],
              popupAnchor: [0, -35],
            });

            window.capitalMarker = L.marker([lat, lng], { icon: capitalIcon })
              .addTo(map)
              .bindTooltip(`<strong>${capitalCity}</strong>`, {
                direction: "top",
                offset: [0, -50],
                permanent: false,
                opacity: 0.9,
              });
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
      fetch(
        `PHP/geocode_google_places.php?q=${encodeURIComponent(
          `landmark in ${countryName}`
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          window.poiCluster.clearLayers();
          if (!data.results) return;
          data.results.slice(0, 20).forEach((result) => {
            const { lat, lng } = result.geometry.location;
            const marker = L.marker([lat, lng], {
              icon: L.icon({
                iconUrl: "images/POI-marker.png",
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40],
              }),
            }).bindTooltip(
              `<strong>${result.name}</strong><br>${result.formatted_address}`,
              {
                direction: "top",
                offset: [0, -40],
                permanent: false,
                opacity: 0.9,
              }
            );
            window.poiCluster.addLayer(marker);
          });
        })
        .catch((err) => console.error(err));
    }

    function fetchAndDisplayAirports(countryName) {
      fetch(
        `PHP/geocode_google_places.php?q=${encodeURIComponent(
          `major airports in ${countryName}`
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          window.airportCluster.clearLayers();
          if (!data.results) return;
          data.results.slice(0, 20).forEach((result) => {
            const { lat, lng } = result.geometry.location;
            const marker = L.marker([lat, lng], {
              icon: L.icon({
                iconUrl: "images/airport-marker.png",
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40],
              }),
            }).bindTooltip(
              `<strong>${result.name}</strong><br>${result.formatted_address}`,
              {
                direction: "top",
                offset: [0, -40],
                permanent: false,
                opacity: 0.9,
              }
            );
            window.airportCluster.addLayer(marker);
          });
        })
        .catch((err) => console.error(err));
    }

    function fetchAndDisplayArenas(countryName) {
      fetch(
        `PHP/geocode_google_places.php?q=${encodeURIComponent(
          `major sports venues in ${countryName}`
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          window.arenaCluster.clearLayers();
          if (!data.results) return;
          data.results.slice(0, 20).forEach((result) => {
            const { lat, lng } = result.geometry.location;
            const marker = L.marker([lat, lng], {
              icon: L.icon({
                iconUrl: "images/arena-marker.png",
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40],
              }),
            }).bindTooltip(
              `<strong>${result.name}</strong><br>${result.formatted_address}`,
              {
                direction: "top",
                offset: [0, -40],
                permanent: false,
                opacity: 0.9,
              }
            );
            window.arenaCluster.addLayer(marker);
          });
        })
        .catch((err) => console.error(err));
    }

    function fetchAndDisplayHospitals(countryName) {
      fetch(
        `PHP/geocode_google_places.php?q=${encodeURIComponent(
          `major hospitals in ${countryName}`
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          window.hospitalCluster.clearLayers();
          if (!data.results) return;
          data.results.slice(0, 20).forEach((result) => {
            const { lat, lng } = result.geometry.location;
            const marker = L.marker([lat, lng], {
              icon: L.icon({
                iconUrl: "images/hospital-marker.png",
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40],
              }),
            }).bindTooltip(
              `<strong>${result.name}</strong><br>${result.formatted_address}`,
              {
                direction: "top",
                offset: [0, -40],
                permanent: false,
                opacity: 0.9,
              }
            );
            window.hospitalCluster.addLayer(marker);
          });
        })
        .catch((err) => console.error(err));
    }

    function fetchAndDisplayUniversities(countryName) {
      fetch(
        `PHP/geocode_google_places.php?q=${encodeURIComponent(
          `top universities in ${countryName}`
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          window.universityCluster.clearLayers();
          if (!data.results) return;
          data.results.slice(0, 20).forEach((result) => {
            const { lat, lng } = result.geometry.location;
            const marker = L.marker([lat, lng], {
              icon: L.icon({
                iconUrl: "images/university-marker.png",
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40],
              }),
            }).bindTooltip(
              `<strong>${result.name}</strong><br>${result.formatted_address}`,
              {
                direction: "top",
                offset: [0, -40],
                permanent: false,
                opacity: 0.9,
              }
            );
            window.universityCluster.addLayer(marker);
          });
        })
        .catch((err) => console.error(err));
    }

    function fetchAndDisplayWeirdAttractions(countryName) {
      fetch(
        `PHP/geocode_google_places.php?q=${encodeURIComponent(
          `weird attractions in ${countryName}`
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          window.weirdAttractionCluster.clearLayers();
          if (!data.results) return;
          data.results.slice(0, 20).forEach((result) => {
            const { lat, lng } = result.geometry.location;
            const marker = L.marker([lat, lng], {
              icon: L.icon({
                iconUrl: "images/weird-marker.png",
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40],
              }),
            }).bindTooltip(
              `<strong>${result.name}</strong><br>${result.formatted_address}`,
              {
                direction: "top",
                offset: [0, -40],
                permanent: false,
                opacity: 0.9,
              }
            );
            window.weirdAttractionCluster.addLayer(marker);
          });
        })
        .catch((err) => console.error(err));
    }

    function fetchAndDisplayNationalParks(countryName) {
      fetch(
        `PHP/geocode_google_places.php?q=${encodeURIComponent(
          `national parks in ${countryName}`
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          window.parkCluster.clearLayers();
          if (!data.results) return;
          data.results.slice(0, 20).forEach((result) => {
            const { lat, lng } = result.geometry.location;
            const marker = L.marker([lat, lng], {
              icon: L.icon({
                iconUrl: "images/park-marker.png",
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40],
              }),
            }).bindTooltip(
              `<strong>${result.name}</strong><br>${result.formatted_address}`,
              {
                direction: "top",
                offset: [0, -40],
                permanent: false,
                opacity: 0.9,
              }
            );
            window.parkCluster.addLayer(marker);
          });
        })
        .catch((err) => console.error(err));
    }

    // MODAL - LANGUAGES

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

    $("#exampleModal").modal("show");

    // -------------------------------------- WIKI MODAL INIT --------------------------------------
    const wikiModalEl = document.getElementById("wikiModal");

    // mirror your Weather/News handlers:
    $(wikiModalEl).on("show.bs.modal", () => {
      const idx = sel.selectedIndex;
      if (idx <= 0) return; // nothing selected
      const country = sel.options[idx].text;

      // prime the UI
      document.getElementById("modalWikiTitle").textContent = country;
      document.getElementById("modalWikiExtract").textContent = "Loading…";

      // fetch & display exactly as in showWiki()
      fetch(`PHP/get_wiki.php?country=${encodeURIComponent(country)}`)
        .then((resp) => {
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          return resp.json();
        })
        .then((data) => {
          const extractEl = document.getElementById("modalWikiExtract");
          if (data.source) {
            extractEl.innerHTML = `<a href="${data.source}" target="_blank" rel="noopener noreferrer">
                                 Read more on Wikipedia
                               </a>`;
          } else if (data.extract) {
            extractEl.textContent = data.extract;
          } else if (data.description) {
            extractEl.textContent = data.description;
          } else {
            extractEl.textContent = "No summary available.";
          }
        })
        .catch((err) => {
          console.error("Wiki fetch error:", err);
          document.getElementById("modalWikiExtract").textContent =
            "Could not load summary.";
        });
    });

    // --------------------------------------WIKI MODAL--------------------------------------

    async function showWiki(country) {
      const titleEl = document.getElementById("modalWikiTitle");
      const extractEl = document.getElementById("modalWikiExtract");
      const wikiModal = new bootstrap.Modal(
        document.getElementById("wikiModal")
      );

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

    // --- currency modal elements ---
    const currencyModalEl = document.getElementById("currencyModal");
    const amountInput = document.getElementById("inputAmount");
    const fromInput = document.getElementById("fromCurrency");
    const toSelect = document.getElementById("toCurrency");
    const rateInfo = document.getElementById("modalOtherLocationName");
    const resultEl = document.getElementById("conversionResult");

    // helper to get user locale currency (as you already had)
    async function getUserCurrency() {
      if (!navigator.geolocation) return "GBP";
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            const res = await fetch(`PHP/geocode.php?lat=${lat}&lng=${lng}`);
            const data = await res.json();
            const cc =
              data?.results?.[0]?.components?.country_code?.toUpperCase();
            if (cc) {
              // fetch the currency ISO for that country
              const curRes = await fetch(
                `PHP/get_currency_rest.php?countryCode=${cc}`
              );
              const curData = await curRes.json();
              return resolve(curData.iso || "GBP");
            }
            resolve("GBP");
          },
          () => resolve("GBP")
        );
      });
    }

    // main population + default-select routine
    currencyModalEl.addEventListener("show.bs.modal", async () => {
      // 1) fetch all rates
      const resRates = await fetch("PHP/currencies_proxy.php");
      const { rates } = await resRates.json();

      // 2) build BOTH “From” and “To” lists
      const displayName = new Intl.DisplayNames(["en"], { type: "currency" });
      const fromSelect = document.getElementById("fromCurrency");
      const toSelect = document.getElementById("toCurrency");
      fromSelect.innerHTML = "";
      toSelect.innerHTML = "";
      for (let code of Object.keys(rates)) {
        const label = `${code} — ${displayName.of(code)}`;
        let o1 = new Option(label, code);
        let o2 = new Option(label, code);
        fromSelect.add(o1);
        toSelect.add(o2);
      }

      // 3) default “From” to the user’s currency
      const userCurr = await getUserCurrency();
      if (rates[userCurr]) {
        fromSelect.value = userCurr;
      }

      // 4) default the “To” selection to the selected country’s currency
      const countryIdx = document.getElementById("countrySelect").selectedIndex;
      const countryName =
        document.getElementById("countrySelect").options[countryIdx].text;
      try {
        const resCurr = await fetch(
          `PHP/get_currency_rest.php?country=${encodeURIComponent(countryName)}`
        );
        const currData = await resCurr.json();
        // assume your PHP returns an `iso` field; if not, you can
        // fetch via restcountries.com/v3.1/name...
        if (currData.iso && rates[currData.iso]) {
          toSelect.value = currData.iso;
        }
      } catch (e) {
        console.warn("Could not default to country currency", e);
      }

      // 5) trigger an initial calc
      doConversion();
    });

    // recalc anytime the amount or “to” changes
    amountInput.addEventListener("input", doConversion);
    document
      .getElementById("fromCurrency")
      .addEventListener("change", doConversion);
    document
      .getElementById("toCurrency")
      .addEventListener("change", doConversion);

    // actual conversion logic
    async function doConversion() {
      const amount = parseFloat(amountInput.value) || 0;
      const from = document.getElementById("fromCurrency").value;
      const to = toSelect.value;

      // re-fetch rates each time (or cache outside if you prefer)
      const { rates } = await (await fetch("PHP/currencies_proxy.php")).json();

      // compute
      const rate = rates[to] / rates[from];
      const converted = amount * rate;

      rateInfo.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;

      // format with thousands separators AND exactly 2 decimal places:
      const amtFormatted = amount.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      const resFormatted = converted.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      resultEl.textContent = `${amtFormatted} ${from} = ${resFormatted} ${to}`;
    }

    // --------------------------------------FETCH AND DRAW COUNTRY BORDER GEOJSON--------------------------------------
    const borderUrl = `PHP/get_countries_border.php?iso=${encodeURIComponent(
      isoCode
    )}`;

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
        window.currentCountryLayer = L.geoJSON(featureGeoJSON, {
          style: {
            color: "#0072B2", // border color
            weight: 2, // border width (pixels)
            dashArray: "15,5", // dashed border: 5px dash, 5px gap
            fillColor: "#56B4E9", // semi-transparent fill
            fillOpacity: 0.2, // fill opacity (0.0–1.0)
          },
        }).addTo(map);
        map.fitBounds(window.currentCountryLayer.getBounds());
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

        document.getElementById("modalCountryName").textContent = countryName;
        document.getElementById(
          "modalCoordinates"
        ).textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
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
          ).textContent = `${Math.round(data.current.temp_c)}°C`;
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
          days.slice(1, 3).forEach((d, idx) => {
            if (!d) return; // no day object? skip
            const slot = idx + 1; // 1,2

            // 1) compute date & name
            const dateObj = new Date(d.date); // parse the ISO string
            const dayNameShort = dateObj.toLocaleDateString("en-GB", {
              weekday: "short", // “Mon”, “Tue”, etc.
            });
            const dayNumber = dateObj.getDate(); // 1–31

            // 2) update elements, but only if they exist
            const nameEl = document.getElementById(
              `modalForecastDay${slot}Name`
            );
            if (nameEl) nameEl.textContent = dayNameShort;

            const dateEl = document.getElementById(
              `modalForecastDay${slot}Date`
            );
            if (dateEl) dateEl.textContent = dayNumber;

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

    // --------------------------------------NEWS MODAL--------------------------------------
    const newsModalEl = document.getElementById("newsModal");
    function fetchCountryNews(countryName) {
      const body = document.getElementById("newsModalBody");
      body.innerHTML = '<p class="text-muted">Loading…</p>';
      fetch(`PHP/news_proxy.php?country=${encodeURIComponent(countryName)}`)
        .then((res) => {
          if (!res.ok) throw new Error(res.statusText);
          return res.json();
        })
        .then((data) => {
          // 1) ensure `articles` is an array
          const articles = Array.isArray(data.articles) ? data.articles : [];
          // 2) optionally log unexpected shapes
          if (data.error) {
            console.warn("News proxy returned error:", data.error);
          }
          // 3) early-exit if empty
          if (articles.length === 0) {
            body.innerHTML = "<p>No recent news found.</p>";
            return;
          }

          // dedupe by link (if needed)
          const seen = new Set();
          const unique = articles.filter((a) => {
            if (seen.has(a.link)) return false;
            seen.add(a.link);
            return true;
          });

          // render each article as a Bootstrap card
          body.innerHTML = "";
          unique.forEach((article) => {
            const imgUrl = article.image_url || "images/stock-news.png";
            const cardHTML = `
              <div class="card mb-3">
                <div class="row g-0">
                  <div class="col-md-4">
                    <img src="${imgUrl}"
                         onerror="this.onerror=null;this.src='images/stock-news.png';"
                         class="img-fluid rounded-start"
                         alt="Article image">
                  </div>
                  <div class="col-md-8">
                    <div class="card-body">
                      <h5 class="card-title">
                        <a href="${article.link}"
                           target="_blank"
                           rel="noopener"
                           style="text-decoration:none; color:inherit;">
                          ${article.title}
                        </a>
                      </h5>
                      <p class="card-text">
                        ${article.description || ""}
                      </p>
                      <p class="card-text">
                        <small class="text-muted">
                          ${new Date(article.pubDate).toLocaleString()}
                        </small>
                      </p>
                    </div>
                  </div>
                </div>
              </div>`;
            body.insertAdjacentHTML("beforeend", cardHTML);
          });
        })
        .catch((err) => {
          console.error("News fetch error:", err);
          body.innerHTML = '<p class="text-danger">Failed to load news.</p>';
        });
    }

    // wire up your existing country-select handlers...
    countrySelect.addEventListener("change", () => {
      const idx = countrySelect.selectedIndex;
      if (idx <= 0) return;
      fetchCountryNews(countrySelect.options[idx].text);
    });
    $("#newsModal").on("show.bs.modal", () => {
      const idx = countrySelect.selectedIndex;
      if (idx > 0) {
        fetchCountryNews(countrySelect.options[idx].text);
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

        const phpReverseUrl = `PHP/geocode.php?lat=${lat}&lng=${lng}`;
        fetch(phpReverseUrl)
          .then((res) => {
            if (!res.ok) throw new Error(res.statusText);
            return res.json();
          })
          .then((data) => {
            if (!(data.results && data.results.length)) return;
            const first = data.results[0];

            // 2) Extract the ISO country code (we assume your PHP/OpenCage proxy returns components.country_code)
            const countryCode = (
              first.components && first.components.country_code
            )?.toUpperCase(); // e.g. "GB", "FR", "US"

            if (countryCode) {
              // 3) Select that country in your <select id="countrySelect">
              const sel = document.getElementById("countrySelect");
              sel.value = countryCode;

              // 4) Trigger the change handler so all your modals / markers / etc. load
              sel.dispatchEvent(new Event("change"));
            }
          })
          .catch((err) => console.error("Reverse-geocode (user) error:", err));
      },
      (err) => console.error("Geolocation error:", err)
    );
  }
  window.addEventListener("load", function () {
    const pre = document.getElementById("preloader");

    pre.style.transition = "opacity 0.5s";
    pre.style.opacity = 0;
    setTimeout(() => pre.remove(), 2000);
  });
});
