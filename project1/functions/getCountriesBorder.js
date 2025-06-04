document.addEventListener("DOMContentLoaded", () => {
  const sel = document.getElementById("countrySelect");
  if (!sel) return;

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
  });
});
