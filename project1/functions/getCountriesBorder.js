document.addEventListener("DOMContentLoaded", () => {
  const sel = document.getElementById("countrySelect");
  if (!sel) return;

  const OPENCAGE_KEY = "64babd120bf641ba8d7387a9e0519c0d";

  sel.addEventListener("change", (e) => {
    const isoCode = e.target.value;
    if (!isoCode) return;

    fetch(
      `functions/get_countries_border.php?iso=${encodeURIComponent(isoCode)}`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((featureGeoJSON) => {
        if (window.currentCountryLayer) {
          map.removeLayer(window.currentCountryLayer);
        }

        window.currentCountryLayer = L.geoJSON(featureGeoJSON).addTo(map);

        map.fitBounds(window.currentCountryLayer.getBounds());
      })
      .catch((err) => {
        console.error("Failed to load border for", isoCode, err);
      });

    const geocodeUrl =
      "https://api.opencagedata.com/geocode/v1/json" +
      `?q=${encodeURIComponent(countryName)}` +
      `&key=${OPENCAGE_KEY}` +
      `&limit=1`;

    fetch(geocodeUrl)
      .then((res) => {
        if (!res.ok)
          throw new Error(`OpenCage error: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (!data.results || data.results.length === 0) {
          console.warn("OpenCage returned no results for", countryName);
          return;
        }

        // Extract lat/lng from the first result
        const { lat, lng } = data.results[0].geometry;
        console.log(`Geocoded ${countryName} → lat=${lat}, lng=${lng}`);
      });
  });
});
