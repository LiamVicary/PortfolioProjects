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

// ---------- Delete Department (delegated) ----------
function isOk(res) {
  return res?.success === true || String(res?.status?.code) === "200";
}

// ---------- Data Loaders ----------
function loadPersonnel() {
  $.getJSON("libs/php/getAll.php", function (res) {
    if (!res || res.status.code !== 200)
      $("#errorLoadPersonnelModal").modal("show");

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

    // build rows via DocumentFragment
    const tbody = document.getElementById("personnelTableBody");
    tbody.textContent = "";
    const frag = document.createDocumentFragment();

    list.forEach((p) => {
      const tr = document.createElement("tr");

      const tdName = document.createElement("td");
      tdName.className = "align-middle text-nowrap";
      tdName.textContent = `${p.lastName}, ${p.firstName}`;
      tr.append(tdName);

      const tdDept = document.createElement("td");
      tdDept.className = "align-middle text-nowrap d-none d-md-table-cell";
      tdDept.textContent = p.department;
      tr.append(tdDept);

      const tdLoc = document.createElement("td");
      tdLoc.className = "align-middle text-nowrap d-none d-md-table-cell";
      tdLoc.textContent = p.location;
      tr.append(tdLoc);

      const tdEmail = document.createElement("td");
      tdEmail.className = "align-middle text-nowrap d-none d-md-table-cell";
      tdEmail.textContent = p.email;
      tr.append(tdEmail);

      const tdActions = document.createElement("td");
      tdActions.className = "text-end text-nowrap";

      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-primary btn-sm me-2";
      editBtn.setAttribute("data-bs-toggle", "modal");
      editBtn.setAttribute("data-bs-target", "#editPersonnelModal");
      editBtn.dataset.id = p.id;
      const editIcon = document.createElement("i");
      editIcon.className = "fa-solid fa-pencil fa-fw";
      editBtn.append(editIcon);
      tdActions.append(editBtn);

      const delBtn = document.createElement("button");
      delBtn.className = "btn btn-primary btn-sm deletePersonnelBtn";
      delBtn.dataset.id = p.id;
      const delIcon = document.createElement("i");
      delIcon.className = "fa-solid fa-trash fa-fw";
      delBtn.append(delIcon);
      tdActions.append(delBtn);

      tr.append(tdActions);
      frag.append(tr);
    });

    tbody.append(frag);
  });
}

function loadDepartments() {
  $.getJSON("libs/php/listDepartments.php", function (res) {
    if (!res || res.status.code !== 200)
      $("#errorLoadDepartmentsModal").modal("show");
    const tbody = document.getElementById("departmentTableBody");
    tbody.textContent = "";
    const frag = document.createDocumentFragment();

    (res.data || []).forEach((d) => {
      const tr = document.createElement("tr");

      const tdName = document.createElement("td");
      tdName.className = "align-middle text-nowrap";
      tdName.textContent = d.name;
      tr.append(tdName);

      const tdLoc = document.createElement("td");
      tdLoc.className = "align-middle text-nowrap d-none d-md-table-cell";
      tdLoc.textContent = d.location;
      tr.append(tdLoc);

      const tdActions = document.createElement("td");
      tdActions.className = "text-end text-nowrap";

      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-primary btn-sm me-2";
      editBtn.setAttribute("data-bs-toggle", "modal");
      editBtn.setAttribute("data-bs-target", "#editDepartmentModal");
      editBtn.dataset.id = d.id;
      const editIcon = document.createElement("i");
      editIcon.className = "fa-solid fa-pencil fa-fw";
      editBtn.append(editIcon);
      tdActions.append(editBtn);

      const delBtn = document.createElement("button");
      delBtn.className = "btn btn-primary btn-sm deleteDepartmentBtn";
      delBtn.dataset.id = d.id;
      const delIcon = document.createElement("i");
      delIcon.className = "fa-solid fa-trash fa-fw";
      delBtn.append(delIcon);
      tdActions.append(delBtn);

      tr.append(tdActions);
      frag.append(tr);
    });

    tbody.append(frag);
  });
}

function loadLocations() {
  $.getJSON("libs/php/listLocationsJSON.php", function (res) {
    if (String(res?.status?.code) !== "200") {
      console.warn("Locations response:", res);
      $("#errorNetworkLoadLocationsModal").modal("show");
      return;
    }
    const tbody = document.getElementById("locationTableBody");
    tbody.textContent = "";
    const frag = document.createDocumentFragment();

    (res.data || []).forEach((l) => {
      const tr = document.createElement("tr");

      const tdName = document.createElement("td");
      tdName.className = "align-middle text-nowrap";
      tdName.textContent = l.name;
      tr.append(tdName);

      const tdActions = document.createElement("td");
      tdActions.className = "text-end text-nowrap";

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "btn btn-primary btn-sm me-2";
      editBtn.setAttribute("data-bs-toggle", "modal");
      editBtn.setAttribute("data-bs-target", "#locationModal");
      editBtn.dataset.id = l.id;
      const editIcon = document.createElement("i");
      editIcon.className = "fa-solid fa-pencil fa-fw";
      editBtn.append(editIcon);
      tdActions.append(editBtn);

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn btn-primary btn-sm delete-location";
      delBtn.dataset.id = l.id;
      const delIcon = document.createElement("i");
      delIcon.className = "fa-solid fa-trash fa-fw";
      delBtn.append(delIcon);
      tdActions.append(delBtn);

      tr.append(tdActions);
      frag.append(tr);
    });

    tbody.append(frag);
  }).fail(function (xhr) {
    console.warn("Locations XHR fail:", xhr?.responseText);
    $("#errorNetworkLoadLocationsModal").modal("show");
  });
}

// 1) Helper: enable/disable the Filter button based on active tab
function updateFilterBtnState() {
  const onPersonnel = $("#personnelBtn").hasClass("active");
  const $btn = $("#filterBtn");

  // availability
  $btn.prop("disabled", !onPersonnel).toggleClass("disabled", !onPersonnel);

  // color: green when any filter is active
  const hasFilter =
    (personnelFilters.deptFilter && personnelFilters.deptFilter.length > 0) ||
    (personnelFilters.locFilter && personnelFilters.locFilter.length > 0);

  $btn
    .toggleClass("btn-success", hasFilter)
    .toggleClass("btn-primary", !hasFilter);
}

// 2) Guard the Filter button click (no modal unless Personnel is active)
$("#filterBtn")
  .off("click")
  .on("click", () => {
    if ($("#filterBtn").prop("disabled")) return; // do nothing if not on Personnel
    refreshFilterOptions();
    $("#filterModal").modal("show");
  });

// 3) Update the button state whenever tabs change
$('#myTab button[data-bs-toggle="tab"]').on(
  "shown.bs.tab",
  updateFilterBtnState
);

// 4) Initialize on page load
$(function () {
  loadPersonnel(); // default tab
  updateFilterBtnState(); // Filter starts enabled & opaque only on Personnel
});

// ---------- Filters & Search ----------

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
          $("#errorSearchDetail").text(
            res?.status?.description || "Unknown error"
          );
          $("#errorSearchModal").modal("show");
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
            <button class="btn btn-primary btn-sm me-2"
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
    updateFilterBtnState();
  });

// ---------- Add / Edit Personnel ----------
$("#addBtn")
  .off("click")
  .on("click", function () {
    // Personnel tab
    if ($("#personnelBtn").hasClass("active")) {
      // 👉 Let the modal's show.bs.modal handler do the fetching/populating
      $("#editPersonnelModal").modal("show");
      return;
    }

    // Departments tab
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
  .off("show.bs.modal.personnel")
  .on("show.bs.modal.personnel", function (e) {
    const id = $(e.relatedTarget)?.data("id"); // undefined for Add
    const $modal = $(this);
    const $form = $("#editPersonnelForm")[0];
    const $dept = $("#editPersonnelDepartment");

    // Always rebuild the department list fresh
    $dept
      .empty()
      .append('<option value="" disabled selected>Loading…</option>');

    $.getJSON("libs/php/listDepartments.php", function (res) {
      if (String(res?.status?.code) !== "200") {
        $("#errorLoadDepartmentsModal").modal("show");
        return;
      }

      const depts = res.data || [];
      const $saveBtn = $modal.find(
        "button[form='editPersonnelForm'][type='submit']"
      );

      // Build options (no placeholder)
      $dept.empty();
      depts.forEach((d) => $dept.append(new Option(d.name, String(d.id))));

      if (id) {
        // Edit: fetch & preselect employee's department
        $modal.find(".modal-title").text("Edit employee");
        $.post(
          "libs/php/getPersonnelByID.php",
          { id },
          function (result) {
            if (String(result?.status?.code) !== "200") {
              $("#errorRetrievingDataModal").modal("show");
              return;
            }
            const p = result.data.personnel?.[0];
            if (!p) {
              $("#errorRetrievingDataModal").modal("show");
              return;
            }
            $("#editPersonnelEmployeeID").val(p.id);
            $("#editPersonnelFirstName").val(p.firstName);
            $("#editPersonnelLastName").val(p.lastName);
            $("#editPersonnelJobTitle").val(p.jobTitle);
            $("#editPersonnelEmailAddress").val(p.email);
            $dept.val(String(p.departmentID)); // preselect employee’s dept
          },
          "json"
        ).fail(() => alert("Error retrieving data"));
      } else {
        // Add: default to the first department from the API
        $modal.find(".modal-title").text("Add Employee");
        $form.reset();
        $("#editPersonnelEmployeeID").val("");

        if (depts.length > 0) {
          $dept.val(String(depts[0].id)); // select first dept
          $saveBtn.prop("disabled", false);
        } else {
          // No departments available: show a non-selectable notice and disable Save
          $dept.append(
            '<option value="" disabled selected>No departments available</option>'
          );
          $saveBtn.prop("disabled", true);
        }
      }
    }).fail(() => alert("Error loading departments"));
  });

// Release lock if modal is closed
$("#editPersonnelModal")
  .off("hidden.bs.modal.personnel")
  .on("hidden.bs.modal.personnel", function () {
    const $form = $("#editPersonnelForm")[0];
    if ($form) $form.reset();
    $("#editPersonnelEmployeeID").val("");
    $("#editPersonnelDepartment").empty(); // rebuilt on next show
    $(
      "#editPersonnelForm .is-invalid, #editPersonnelForm .is-valid"
    ).removeClass("is-invalid is-valid");
    editFormBusy = false;
    $(this)
      .find("button[form='editPersonnelForm'][type='submit']")
      .prop("disabled", false);
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
        $("#errorNetworkSavePersonnelModal").modal("show");
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
        $("#errorNetworkLoadLocationsModal").modal("show");
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
              $("#errorDeptDetailsModal").modal("show");
            }
          },
          error: function (xhr) {
            console.warn("Dept fetch XHR error:", xhr);
            $("#errorDeptDetailsModal").modal("show");
          },
        });
      } else {
        $modal.find(".modal-title").text("Add Department");
      }
    }).fail(function (xhr) {
      console.warn("Locations XHR error:", xhr);
      $("#errorNetworkLoadLocationsModal").modal("show");
    });
  });

// ---------- Edit Department (submit) ----------
$(document)
  .off("submit.editDeptForm")
  .on("submit.editDeptForm", "#editDepartmentForm", function (e) {
    e.preventDefault();
    const payload = $(this).serialize();

    $.ajax({
      url: "libs/php/saveDepartment.php",
      type: "POST",
      data: payload,
      dataType: "json", // expect JSON, but we'll gracefully handle parsererror
    })
      .done(function (res) {
        if (isOk(res)) {
          $("#editDepartmentModal").modal("hide");
          loadDepartments();
          refreshFilterOptions();
        } else {
          alert(
            "Error saving: " +
              (res?.status?.description || res?.message || "Unknown error")
          );
        }
      })
      .fail(function (xhr, textStatus, errorThrown) {
        // If server returned 2xx but not valid JSON, jQuery calls this with parsererror.
        if (
          xhr.status >= 200 &&
          xhr.status < 300 &&
          textStatus === "parsererror"
        ) {
          console.warn(
            "saveDepartment returned non-JSON but HTTP",
            xhr.status,
            "— treating as success."
          );
          $("#editDepartmentModal").modal("hide");
          loadDepartments();
          refreshFilterOptions();
          return;
        }

        console.warn(
          "Save department fail:",
          textStatus,
          errorThrown,
          xhr?.responseText
        );
        alert("Network/server error while saving department.");
      });
  });

// Open modal and prefill from server
//$("#locationModal")
//.off("show.bs.modal")
//.on("show.bs.modal", function (e) {
//const id = $(e.relatedTarget).data("id");
//const $modal = $(this);
//const $form = $("#locationForm")[0];

// reset
//$form.reset();
// $("#locationId").val("");
// $("#locationName").val("");

// if (id) {
// $modal.find(".modal-title").text("Edit Location");
// $.getJSON("libs/php/getLocation.php", { id }, function (data) {
//   if (data && data.id) {
//    $("#locationId").val(data.id);
//    $("#locationName").val(data.name);
//  } else {
//    alert("Location not found.");
//  }
// }).fail(function () {
//   alert("Error retrieving location details.");
// });
//  } else {
//    $modal.find(".modal-title").text("Add Location");
//  }
// });

// Save (for both Add and Edit depending on hidden id)
$("#locationModal")
  .off("show.bs.modal.location")
  .on("show.bs.modal.location", function (e) {
    const id = $(e.relatedTarget)?.data("id");
    const $modal = $(this);
    const $form = $("#locationForm")[0];

    $form.reset();
    $("#locationName").val("");

    if (id) {
      // Edit
      $("#locationId").prop("disabled", false).val(id);
      $modal.find(".modal-title").text("Edit Location");
      $.getJSON("libs/php/getLocation.php", { id }, function (data) {
        if (data && data.id) {
          $("#locationName").val(data.name);
        } else {
          $("#errorLocationNotFoundModal").modal("show");
        }
      }).fail(() => alert("Error retrieving location details."));
    } else {
      // Add (exception: no DB query needed)
      $("#locationId").prop("disabled", true).val(""); // disabled so it isn't posted
      $modal.find(".modal-title").text("Add Location");
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
    ).fail(() => alert("Network/server error while saving location."));
  });

// Delete modals — clear the IDs and names (optional but tidy)
$("#areYouSurePersonnelModal")
  .off("hidden.bs.modal.personnelDel")
  .on("hidden.bs.modal.personnelDel", function () {
    $("#areYouSurePersonnelID").val("");
    $("#areYouSurePersonnelName").text("");
  });

$("#areYouSureDeleteDepartmentModal")
  .off("hidden.bs.modal.deptDel")
  .on("hidden.bs.modal.deptDel", function () {
    $("#deleteDepartmentID").val("");
    $("#areYouSureDeptName").text("");
  });

$("#areYouSureDeleteLocationModal")
  .off("hidden.bs.modal.locDel")
  .on("hidden.bs.modal.locDel", function () {
    $("#deleteLocationID").val("");
    $("#areYouSureLocationName").text("");
  });

$("#cantDeleteDepartmentModal, #cantDeleteLocationModal")
  .off("hidden.bs.modal.cantDel")
  .on("hidden.bs.modal.cantDel", function () {
    // clear counts/names
    $("#cantDeleteDeptName, #cantDeleteLocationName").text("");
    $("#personnelCount, #departmentCount").text("");
  });

// Ask to delete (opens modal prefilled)
$(document)
  .off("click.askDeleteLocation")
  .on("click.askDeleteLocation", ".delete-location", function () {
    const id = $(this).data("id");
    const name = $(this).closest("tr").find("td").first().text().trim();

    $("#deleteLocationID").val(id);
    $("#areYouSureLocationName").text(name);
    $("#areYouSureDeleteLocationModal").modal("show");
  });

// Submit from the modal
$(document)
  .off("submit.deleteLocationForm")
  .on("submit.deleteLocationForm", "#deleteLocationForm", function (e) {
    e.preventDefault();
    const id = $("#deleteLocationID").val();
    const name = $("#areYouSureLocationName").text();

    $.post(
      "libs/php/deleteLocation.php",
      { id },
      function (res) {
        if (res && res.success) {
          loadLocations();
          refreshFilterOptions();
        } else {
          const count =
            res?.data?.departmentCount ?? res?.departmentCount ?? "one or more";
          $("#cantDeleteLocationName").text(name);
          $("#departmentCount").text(count);
          $("#cantDeleteLocationModal").modal("show");
        }
      },
      "json"
    ).fail(function () {
      $("#cantDeleteLocationName").text(name);
      $("#departmentCount").text("one or more");
      $("#cantDeleteLocationModal").modal("show");
    });
  });

// ---------- Delete Personnel (via modal) ----------
$(document)
  .off("click.deletePersonnel")
  .on("click.deletePersonnel", ".deletePersonnelBtn", function () {
    const id = $(this).data("id");

    // Prefill the modal with name (fallback to ID if fetch fails)
    $.ajax({
      url: "libs/php/getPersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: { id },
    })
      .done(function (res) {
        const p = res?.data?.personnel?.[0];
        const fullName = p ? `${p.firstName} ${p.lastName}` : `ID ${id}`;
        $("#areYouSurePersonnelID").val(id);
        $("#areYouSurePersonnelName").text(fullName);
        $("#areYouSurePersonnelModal").modal("show");
      })
      .fail(function () {
        $("#areYouSurePersonnelID").val(id);
        $("#areYouSurePersonnelName").text(`ID ${id}`);
        $("#areYouSurePersonnelModal").modal("show");
      });
  });

$(document)
  .off("submit.areYouSurePersonnelForm")
  .on(
    "submit.areYouSurePersonnelForm",
    "#areYouSurePersonnelForm",
    function (e) {
      e.preventDefault();
      const id = $("#areYouSurePersonnelID").val();
      const $modal = $("#areYouSurePersonnelModal");
      const $yesBtn = $modal.find(
        "button[form='areYouSurePersonnelForm'][type='submit']"
      );

      $yesBtn.prop("disabled", true);

      $.post(
        "libs/php/deletePersonnel.php",
        { id },
        function (res) {
          if (res && res.success) {
            $modal.modal("hide");
            loadPersonnel();
          } else {
            alert("Cannot delete: " + (res?.message || "Unknown error"));
          }
        },
        "json"
      ).always(function () {
        $yesBtn.prop("disabled", false);
      });
    }
  );

// ---------- Delete Department (show "can't delete" modal on failure) ----------
// Ask to delete (opens modal prefilled)
$(document)
  .off("click.askDeleteDept")
  .on("click.askDeleteDept", ".deleteDepartmentBtn", function () {
    const id = $(this).data("id");
    const name = $(this).closest("tr").find("td").first().text().trim();

    $("#deleteDepartmentID").val(id);
    $("#areYouSureDeptName").text(name);
    $("#areYouSureDeleteDepartmentModal").modal("show");
  });

// Submit from the modal
$(document)
  .off("submit.deleteDeptForm")
  .on("submit.deleteDeptForm", "#deleteDepartmentForm", function (e) {
    e.preventDefault();
    const id = $("#deleteDepartmentID").val();
    const name = $("#areYouSureDeptName").text();

    $.post(
      "libs/php/deleteDepartmentByID.php",
      { id },
      function (res) {
        if (isOk(res)) {
          loadDepartments();
          refreshFilterOptions();
        } else {
          // Use count if backend provides it; otherwise “one or more”
          const count =
            res?.data?.personnelCount ?? res?.personnelCount ?? "one or more";
          $("#cantDeleteDeptName").text(name);
          $("#personnelCount").text(count);
          $("#cantDeleteDepartmentModal").modal("show");
        }
      },
      "json"
    ).fail(function () {
      // Network/server error — show a friendly modal message
      $("#cantDeleteDeptName").text(name);
      $("#personnelCount").text("one or more");
      $("#cantDeleteDepartmentModal").modal("show");
    });
  });

function sanitizeId(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

function refreshFilterOptions() {
  const $deptSel = $("#filterDepartment");
  const $locSel = $("#filterLocation");

  // Use current state (names) or "All"
  const currentDept = personnelFilters.deptFilter[0] || "0";
  const currentLoc = personnelFilters.locFilter[0] || "0";

  // ---- Departments ----
  $.getJSON("libs/php/listDepartments.php", function (res) {
    if (String(res?.status?.code) !== "200") return;

    const names = [
      ...new Set((res.data || []).map((d) => d.name).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b));

    $deptSel.empty().append('<option value="0">All</option>');
    names.forEach((name) => $deptSel.append(new Option(name, name)));

    // restore selection
    $deptSel.val(currentDept !== "0" ? currentDept : "0");
  });

  // ---- Locations ----
  $.getJSON("libs/php/listLocationsJSON.php", function (res) {
    if (String(res?.status?.code) !== "200") return;

    const names = [
      ...new Set((res.data || []).map((l) => l.name).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b));

    $locSel.empty().append('<option value="0">All</option>');
    names.forEach((name) => $locSel.append(new Option(name, name)));

    // restore selection
    $locSel.val(currentLoc !== "0" ? currentLoc : "0");
  });
}

$("#filterDepartment")
  .off("change")
  .on("change", function () {
    const v = $(this).val(); // name or "0"
    if (v !== "0") {
      // selecting a dept clears location
      $("#filterLocation").val("0");
      personnelFilters.deptFilter = [v];
      personnelFilters.locFilter = [];
    } else {
      personnelFilters.deptFilter = [];
    }
    loadPersonnel();
    updateFilterBtnState();
  });

$("#filterLocation")
  .off("change")
  .on("change", function () {
    const v = $(this).val(); // name or "0"
    if (v !== "0") {
      // selecting a location clears department
      $("#filterDepartment").val("0");
      personnelFilters.locFilter = [v];
      personnelFilters.deptFilter = [];
    } else {
      personnelFilters.locFilter = [];
    }
    loadPersonnel();
    updateFilterBtnState();
  });

// Populate options each time the modal opens
$("#filterModal")
  .off("show.bs.modal")
  .on("show.bs.modal", refreshFilterOptions);

// ---------- Tab Buttons ----------
$("#personnelBtn").off("click").on("click", loadPersonnel);
$("#departmentsBtn").off("click").on("click", loadDepartments);
$("#locationsBtn").off("click").on("click", loadLocations);

// ---------- Init ----------
$(function () {
  loadPersonnel(); // default tab
});
