// ---------- State ----------
const personnelFilters = {
  empSort: [],
  deptFilter: [],
  locFilter: [],
};

let editFormBusy = false; // prevent double-submits

// ---------- Utilities ----------
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ---------- Data Loaders ----------
function loadPersonnel() {
  $.getJSON("libs/php/getAll.php", function (res) {
    if (!res || res.status.code !== 200)
      return alert("Error loading personnel");

    // get the raw array
    let list = res.data || [];

    // apply department-filter (if any)
    if (personnelFilters.deptFilter.length) {
      list = list.filter((p) =>
        personnelFilters.deptFilter.includes(p.department)
      );
    }

    // apply location-filter (if any)
    if (personnelFilters.locFilter.length) {
      list = list.filter((p) =>
        personnelFilters.locFilter.includes(p.location)
      );
    }

    // apply alphabetical sort (if any)
    if (personnelFilters.empSort.includes("AZ")) {
      list.sort((a, b) => a.lastName.localeCompare(b.lastName));
    } else if (personnelFilters.empSort.includes("ZA")) {
      list.sort((a, b) => b.lastName.localeCompare(a.lastName));
    }

    // build HTML
    let html = "";
    list.forEach((p) => {
      html += `
      <tr>
        <td class="align-middle text-nowrap">${p.lastName}, ${p.firstName}</td>
        <td class="align-middle text-nowrap d-none d-md-table-cell">${p.department}</td>
        <td class="align-middle text-nowrap d-none d-md-table-cell">${p.location}</td>
        <td class="align-middle text-nowrap d-none d-md-table-cell">${p.email}</td>
        <td class="text-end text-nowrap">
          <button class="btn btn-primary btn-sm"
                  data-bs-toggle="modal"
                  data-bs-target="#editPersonnelModal"
                  data-id="${p.id}">
            <i class="fa-solid fa-pencil fa-fw"></i>
          </button>
          <button class="btn btn-primary btn-sm deletePersonnelBtn" data-id="${p.id}">
            <i class="fa-solid fa-trash fa-fw"></i>
          </button>
        </td>
      </tr>`;
    });
    $("#personnelTableBody").html(html);
  });
}

function loadDepartments() {
  $.getJSON("libs/php/listDepartments.php", function (res) {
    if (!res || res.status.code !== 200)
      return alert("Error loading departments");
    let html = "";
    (res.data || []).forEach((d) => {
      html += `
        <tr>
          <td class="align-middle text-nowrap">${d.name}</td>
          <td class="align-middle text-nowrap d-none d-md-table-cell">${d.location}</td>
          <td class="text-end text-nowrap">
            <button class="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#editDepartmentModal"
                    data-id="${d.id}">
              <i class="fa-solid fa-pencil fa-fw"></i>
            </button>
            <button class="btn btn-primary btn-sm deleteDepartmentBtn" data-id="${d.id}">
              <i class="fa-solid fa-trash fa-fw"></i>
            </button>
          </td>
        </tr>`;
    });
    $("#departmentTableBody").html(html);
  });
}

function loadLocations() {
  $.get("libs/php/listLocations.php", function (html) {
    $("#locationTableBody").html(html);
  });
}

// ---------- Filters & Search ----------
$("#applyFilterBtn")
  .off("click")
  .on("click", () => {
    personnelFilters.empSort = $("input[name='empSort']:checked")
      .map((_, cb) => cb.value)
      .get();
    personnelFilters.deptFilter = $("input[name='deptFilter']:checked")
      .map((_, cb) => cb.value)
      .get();
    personnelFilters.locFilter = $("input[name='locFilter']:checked")
      .map((_, cb) => cb.value)
      .get();

    $("#filterModal").modal("hide");
    loadPersonnel();
  });

$("#filterBtn")
  .off("click")
  .on("click", () => {
    refreshFilterOptions();
    $("#filterModal").modal("show");
  });

$("#searchInp")
  .off("keyup")
  .on(
    "keyup",
    debounce(function () {
      const txt = $(this).val().trim();

      if (!txt) {
        loadPersonnel();
        return;
      }

      $.getJSON("libs/php/searchAll.php", { txt }, function (res) {
        if (!res || res.status.code != 200) {
          return alert(
            "Search error: " + (res?.status?.description || "unknown")
          );
        }
        let html = "";
        (res.data?.found || []).forEach((p) => {
          html += `
        <tr>
          <td class="align-middle text-nowrap">${p.lastName}, ${p.firstName}</td>
          <td class="align-middle text-nowrap d-none d-md-table-cell">${p.departmentName}</td>
          <td class="align-middle text-nowrap d-none d-md-table-cell">${p.locationName}</td>
          <td class="align-middle text-nowrap d-none d-md-table-cell">${p.email}</td>
          <td class="text-end text-nowrap">
            <button class="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#editPersonnelModal"
                    data-id="${p.id}">
              <i class="fa-solid fa-pencil fa-fw"></i>
            </button>
            <button class="btn btn-primary btn-sm deletePersonnelBtn" data-id="${p.id}">
              <i class="fa-solid fa-trash fa-fw"></i>
            </button>
          </td>
        </tr>`;
        });
        $("#personnelTableBody").html(html);
      });
    }, 250)
  );

// ---------- Refresh ----------
$("#refreshBtn")
  .off("click")
  .on("click", function () {
    $("#searchInp").val("");
    $("#filterForm")[0].reset();

    // keep types consistent
    personnelFilters.empSort = [];
    personnelFilters.deptFilter = [];
    personnelFilters.locFilter = [];

    if ($("#personnelBtn").hasClass("active")) loadPersonnel();
    else if ($("#departmentsBtn").hasClass("active")) loadDepartments();
    else loadLocations();
  });

// ---------- Add / Edit Personnel ----------
$("#addBtn")
  .off("click")
  .on("click", function () {
    if ($("#personnelBtn").hasClass("active")) {
      const $modal = $("#editPersonnelModal");
      const $form = $("#editPersonnelForm");
      const $dept = $("#editPersonnelDepartment");

      // reset to "Add" state
      $form[0].reset();
      $("#editPersonnelEmployeeID").val("");
      $modal.find(".modal-title").text("Add Employee");

      // load departments then show modal
      $.getJSON("libs/php/listDepartments.php", function (res) {
        if (!res || res.status.code !== 200) {
          alert("Error loading departments");
          return;
        }
        $dept
          .empty()
          .append(
            '<option value="" disabled selected>Select department…</option>'
          );
        (res.data || []).forEach((d) => $dept.append(new Option(d.name, d.id)));
        $modal.modal("show");
      });

      return;
    }

    if ($("#departmentsBtn").hasClass("active")) {
      $("#editDepartmentModal").find("form")[0].reset();
      $("#editDepartmentModal [data-id]").removeAttr("data-id");
      $("#editDepartmentModal .modal-title").text("Add Department");
      $("#editDepartmentModal").modal("show");
      return;
    }

    // Locations tab
    $("#locationModal").find("form")[0].reset();
    $("#locationModal [data-id]").removeAttr("data-id");
    $("#locationModal .modal-title").text("Add Location");
    $("#locationModal").modal("show");
  });

$("#editPersonnelModal")
  .off("show.bs.modal")
  .on("show.bs.modal", function (e) {
    const id = $(e.relatedTarget)?.attr("data-id");
    if (!id) return;

    $.ajax({
      url: "libs/php/getPersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: { id },
      success: function (result) {
        const resultCode = result?.status?.code;
        if (resultCode == 200) {
          const p = result.data.personnel[0];

          $("#editPersonnelEmployeeID").val(p.id);
          $("#editPersonnelFirstName").val(p.firstName);
          $("#editPersonnelLastName").val(p.lastName);
          $("#editPersonnelJobTitle").val(p.jobTitle);
          $("#editPersonnelEmailAddress").val(p.email);

          const $dept = $("#editPersonnelDepartment");
          $dept.empty();
          $.each(result.data.department, function () {
            $dept.append($("<option>", { value: this.id, text: this.name }));
          });
          $dept.val(p.departmentID);
          $(this).find(".modal-title").text("Edit employee");
        } else {
          alert("Error retrieving data");
        }
      },
      error: function () {
        alert("Error retrieving data");
      },
    });
  });

// Release lock if modal is closed
$("#editPersonnelModal")
  .off("hidden.bs.modal")
  .on("hidden.bs.modal", () => {
    editFormBusy = false;
  });

$(document)
  .off("submit.editForm")
  .on("submit.editForm", "#editPersonnelForm", function (e) {
    e.preventDefault();

    if (editFormBusy) return;
    editFormBusy = true;

    const $form = $(this);
    const $modal = $form.closest(".modal");
    const $saveBtn = $modal.find(
      "button[form='editPersonnelForm'][type='submit']"
    );
    $saveBtn.prop("disabled", true);

    const payload = $form.serialize();

    $.post("libs/php/savePersonnel.php", payload, null, "json")
      .done(function (res) {
        if (res && res.success) {
          $modal.modal("hide");
          loadPersonnel();
        } else {
          alert("Error saving: " + (res?.message || "Unknown error"));
        }
      })
      .fail(function () {
        alert("Network/server error while saving.");
      })
      .always(function () {
        editFormBusy = false;
        $saveBtn.prop("disabled", false);
      });
  });

// ---------- Edit Department (open + populate) ----------
$("#editDepartmentModal")
  .off("show.bs.modal")
  .on("show.bs.modal", function (e) {
    const id = $(e.relatedTarget).attr("data-id"); // present for Edit, absent for Add
    const $modal = $(this);
    const $form = $("#editDepartmentForm")[0];
    const $name = $("#editDepartmentName");
    const $id = $("#editDepartmentID");
    const $loc = $("#editDepartmentLocation");

    // reset form each time
    $form.reset();
    $id.val("");
    $name.val("");
    $loc.empty().append('<option value="" disabled selected>Loading…</option>');

    $.getJSON("libs/php/listLocationsJSON.php", function (locRes) {
      if (String(locRes?.status?.code) !== "200") {
        console.warn("Locations error:", locRes);
        alert("Error loading locations");
        return;
      }

      const locations = locRes.data || [];
      $loc
        .empty()
        .append('<option value="" disabled selected>Select location…</option>');
      locations.forEach((l) => $loc.append(new Option(l.name, String(l.id))));

      if (id) {
        $modal.find(".modal-title").text("Edit Department");
        $.ajax({
          url: "libs/php/getDepartmentByID.php",
          type: "POST",
          dataType: "json",
          data: { id },
          success: function (res) {
            if (
              String(res?.status?.code) === "200" &&
              (res.data || []).length
            ) {
              const d = res.data[0];
              // Fill form fields
              $id.val(d.id);
              $name.val(d.name);

              // Preselect the location
              const locValue = String(d.locationID);
              if ($loc.find(`option[value="${locValue}"]`).length) {
                $loc.val(locValue);
              } else {
                console.warn(
                  "Department location not found in locations list:",
                  locValue
                );
                $loc.prop("selectedIndex", 0);
              }

              $loc.trigger("change");
            } else {
              console.warn("Dept fetch error:", res);
              alert("Error retrieving department details");
            }
          },
          error: function (xhr) {
            console.warn("Dept fetch XHR error:", xhr);
            alert("Error retrieving department details");
          },
        });
      } else {
        $modal.find(".modal-title").text("Add Department");
      }
    }).fail(function (xhr) {
      console.warn("Locations XHR error:", xhr);
      alert("Error loading locations");
    });
  });

// ---------- Edit Department (submit) ----------
$(document)
  .off("submit.editDeptForm")
  .on("submit.editDeptForm", "#editDepartmentForm", function (e) {
    e.preventDefault();
    const payload = $(this).serialize();
    $.post(
      "libs/php/saveDepartment.php",
      payload,
      function (res) {
        if (String(res?.status?.code) === "200") {
          $("#editDepartmentModal").modal("hide");
          loadDepartments();
          refreshFilterOptions();
        } else {
          alert(
            "Error saving: " + (res?.status?.description || "Unknown error")
          );
        }
      },
      "json"
    ).fail(function () {
      alert("Network/server error while saving department.");
    });
  });

// Open modal and prefill from server
$("#locationModal")
  .off("show.bs.modal")
  .on("show.bs.modal", function (e) {
    const id = $(e.relatedTarget).data("id");
    const $modal = $(this);
    const $form = $("#locationForm")[0];

    // reset
    $form.reset();
    $("#locationId").val("");
    $("#locationName").val("");

    if (id) {
      $modal.find(".modal-title").text("Edit Location");
      $.getJSON("libs/php/getLocation.php", { id }, function (data) {
        if (data && data.id) {
          $("#locationId").val(data.id);
          $("#locationName").val(data.name);
        } else {
          alert("Location not found.");
        }
      }).fail(function () {
        alert("Error retrieving location details.");
      });
    } else {
      $modal.find(".modal-title").text("Add Location");
    }
  });

// Save (for both Add and Edit depending on hidden id)
$("#locationForm")
  .off("submit")
  .on("submit", function (e) {
    e.preventDefault();
    const payload = $(this).serialize();
    $.post(
      "libs/php/saveLocation.php",
      payload,
      function (res) {
        if (res && res.success) {
          $("#locationModal").modal("hide");
          loadLocations(); // refresh table
          refreshFilterOptions();
        } else {
          alert(res?.message || "Error saving location");
        }
      },
      "json"
    ).fail(function () {
      alert("Network/server error while saving location.");
    });
  });

// ---------- Locations CRUD ----------
$("#locationModal")
  .off("show.bs.modal")
  .on("show.bs.modal", function (e) {
    const btn = $(e.relatedTarget);
    const id = btn?.data("id");
    const modal = $(this);

    if (id) {
      modal.find(".modal-title").text("Edit Location");
      $.getJSON("libs/php/getLocation.php", { id }, function (data) {
        modal.find("#locationId").val(data.id);
        modal.find("#locationName").val(data.name);
      });
    } else {
      modal.find(".modal-title").text("Add Location");
      modal.find("#locationForm")[0].reset();
      modal.find("#locationId").val("");
    }
  });

$("#locationForm")
  .off("submit")
  .on("submit", function (e) {
    e.preventDefault();
    const payload = $(this).serialize();
    $.post(
      "libs/php/saveLocation.php",
      payload,
      function (res) {
        if (res && res.success) {
          $("#locationModal").modal("hide");
          loadLocations();
          refreshFilterOptions();
        } else {
          alert(res?.message || "Error saving location");
        }
      },
      "json"
    );
  });

$(document)
  .off("click.deleteLocation")
  .on("click.deleteLocation", ".delete-location", function () {
    if (!confirm("Really delete this location?")) return;
    const id = $(this).data("id");
    $.post(
      "php/deleteLocation.php",
      { id },
      function (res) {
        if (res && res.success) loadLocations();
        else alert(res?.message || "Error deleting location");
      },
      "json"
    );
  });

// ---------- Delete Personnel (delegated) ----------
$(document)
  .off("click.deletePersonnel")
  .on("click.deletePersonnel", ".deletePersonnelBtn", function () {
    if (!confirm("Really delete this person?")) return;
    const id = $(this).data("id");
    $.post(
      "libs/php/deletePersonnel.php",
      { id },
      function (res) {
        if (res && res.success) loadPersonnel();
        else alert("Cannot delete: " + (res?.message || "Unknown error"));
      },
      "json"
    );
  });

// ---------- Delete Department (delegated) ----------
function isOk(res) {
  return String(res?.status?.code) === "200";
}

$(document)
  .off("click.deleteDepartment")
  .on("click.deleteDepartment", ".deleteDepartmentBtn", function () {
    const id = $(this).data("id");

    if (!confirm("Really delete this department?")) return;

    $.post(
      "libs/php/deleteDepartmentByID.php",
      { id },
      function (res) {
        if (isOk(res)) {
          loadDepartments();
          refreshFilterOptions();
        } else {
          const msg =
            res?.status?.description ||
            "Delete failed. The department may be in use.";
          alert(msg);
        }
      },
      "json"
    ).fail(function () {
      alert("Server error while deleting department.");
    });
  });

function sanitizeId(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

function refreshFilterOptions() {
  const $deptWrap = $("#deptFilterContainer");
  const $locWrap = $("#locFilterContainer");

  const selectedDepts = new Set(personnelFilters.deptFilter || []);
  const selectedLocs = new Set(personnelFilters.locFilter || []);

  // ---- Departments ----
  $.getJSON("libs/php/listDepartments.php", function (res) {
    if (String(res?.status?.code) !== "200") {
      console.warn("Department list error:", res);
      return;
    }

    const names = [
      ...new Set((res.data || []).map((d) => d.name).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b));

    // Clean up selections that no longer exist
    personnelFilters.deptFilter = personnelFilters.deptFilter.filter((n) =>
      names.includes(n)
    );

    $deptWrap.empty();
    names.forEach((name) => {
      const id = "dept-" + sanitizeId(name);
      const $row = $("<div>", { class: "form-check" });
      const $inp = $("<input>", {
        class: "form-check-input",
        type: "checkbox",
        id,
        name: "deptFilter",
      }).val(name);
      if (selectedDepts.has(name)) $inp.prop("checked", true);
      const $lbl = $("<label>", {
        class: "form-check-label",
        for: id,
        text: name,
      });
      $row.append($inp, $lbl);
      $deptWrap.append($row);
    });
  });

  // ---- Locations ----
  $.getJSON("libs/php/listLocationsJSON.php", function (res) {
    if (String(res?.status?.code) !== "200") {
      console.warn("Location list error:", res);
      return;
    }

    const names = [
      ...new Set((res.data || []).map((l) => l.name).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b));

    // Clean selections that no longer exist
    personnelFilters.locFilter = personnelFilters.locFilter.filter((n) =>
      names.includes(n)
    );

    $locWrap.empty();
    names.forEach((name) => {
      const id = "loc-" + sanitizeId(name);
      const $row = $("<div>", { class: "form-check" });
      const $inp = $("<input>", {
        class: "form-check-input",
        type: "checkbox",
        id,
        name: "locFilter",
      }).val(name);
      if (selectedLocs.has(name)) $inp.prop("checked", true);
      const $lbl = $("<label>", {
        class: "form-check-label",
        for: id,
        text: name,
      });
      $row.append($inp, $lbl);
      $locWrap.append($row);
    });
  });
}

// ---------- Tab Buttons ----------
$("#personnelBtn").off("click").on("click", loadPersonnel);
$("#departmentsBtn").off("click").on("click", loadDepartments);
$("#locationsBtn").off("click").on("click", loadLocations);

// ---------- Init ----------
$(function () {
  loadPersonnel(); // default tab
});
