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

var infoBtn = L.easyButton("fa-info fa-xl", function (btn, map) {
  $("#exampleModal").modal("show");
});

// SINGLE DOMCONTENTLOADED HANDLER FOR EVERYTHING

document.addEventListener("DOMContentLoaded", () => {
  // INITIALISE MAP & LAYERS

  map = L.map("map", {
    layers: [streets],
  }).setView([54.5, -4], 6);

  L.control.layers(basemaps).addTo(map);
  infoBtn.addTo(map);

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

  // 3) WHEN USER CHOOSES A COUNTRY → FETCH BORDER + GEOCODE
  const OPENCAGE_KEY = "64babd120bf641ba8d7387a9e0519c0d";

  sel.addEventListener("change", (e) => {
    const isoCode = e.target.value;
    const countryName = sel.options[sel.selectedIndex].text;
    if (!isoCode) {
      console.warn("User selected the blank option; skipping.");
      return;
    }

    console.log("User selected ISO =", isoCode, "name =", countryName);

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

    const geocodeUrl = new URL("https://api.opencagedata.com/geocode/v1/json");
    geocodeUrl.searchParams.set("q", countryName);
    geocodeUrl.searchParams.set("key", OPENCAGE_KEY);
    geocodeUrl.searchParams.set("limit", "1");

    console.log("Requesting OpenCage geocode:", geocodeUrl.toString());

    fetch(geocodeUrl.toString())
      .then((res) => {
        if (!res.ok) {
          throw new Error("OpenCage HTTP " + res.status + " " + res.statusText);
        }
        return res.json();
      })
      .then((data) => {
        if (!data.results || data.results.length === 0) {
          console.warn(
            "OpenCage returned no results for",
            countryName,
            "full response:",
            data
          );
          return;
        }

        const { lat, lng } = data.results[0].geometry;
        console.log(`Geocoded ${countryName} → lat=${lat}, lng=${lng}`);
      })
      .catch((err) => {
        console.error("Failed to geocode", countryName, err);
      });
  });
});
