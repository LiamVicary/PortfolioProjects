document.addEventListener("DOMContentLoaded", () => {
  const sel = document.getElementById("countrySelect");

  fetch("get_countries.php")
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not OK");
      return response.json();
    })
    .then((countries) => {
      sel.innerHTML = "";
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
});
