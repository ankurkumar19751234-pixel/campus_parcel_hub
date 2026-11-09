"use strict";

const STORAGE_KEY = "campusParcelHub";
const statuses = ["At desk", "With courier", "Ready to collect", "Collected"];

const sampleParcels = [
  { id: "P001", studentName: "Aanya Sharma", studentId: "12345678", location: "Block C", status: "At desk" },
  { id: "P002", studentName: "Dev Mehta", studentId: "87654321", location: "Block A", status: "With courier" },
  { id: "P003", studentName: "Isha Kapoor", studentId: "11223344", location: "Block B", status: "Ready to collect" },
  { id: "P004", studentName: "Rohan Gill", studentId: "22004568", location: "Block D", status: "Collected" }
];

function loadParcels() {
  try {
    const savedParcels = localStorage.getItem(STORAGE_KEY);
    if (savedParcels) {
      const parsedParcels = JSON.parse(savedParcels);
      if (Array.isArray(parsedParcels)) return parsedParcels;
    }
  } catch (error) {
    // If browser storage is unavailable, use the sample records.
  }
  return sampleParcels.slice();
}

const parcels = loadParcels();
const parcelRows = document.getElementById("parcel-rows");
const parcelForm = document.getElementById("parcel-form");
const formMessage = document.getElementById("form-message");
const lookupForm = document.getElementById("lookup-form");
const lookupResults = document.getElementById("lookup-results");

function saveParcels() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parcels));
    return true;
  } catch (error) {
    return false;
  }
}

function addCell(row, text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  row.appendChild(cell);
  return cell;
}

function addStatusLabel(parent, status) {
  const label = document.createElement("span");
  const statusNumber = statuses.indexOf(status);
  label.className = "status status-" + statusNumber;
  label.textContent = status;
  parent.appendChild(label);
}

function renderParcels() {
  if (!parcelRows) return;
  parcelRows.innerHTML = "";

  if (parcels.length === 0) {
    const row = document.createElement("tr");
    const cell = addCell(row, "No parcels have been added yet.");
    cell.colSpan = 6;
    parcelRows.appendChild(row);
    return;
  }

  parcels.forEach(function (parcel, index) {
    const row = document.createElement("tr");
    addCell(row, parcel.id);
    addCell(row, parcel.studentName);
    addCell(row, parcel.studentId);
    addCell(row, parcel.location);

    const statusCell = document.createElement("td");
    addStatusLabel(statusCell, parcel.status);
    row.appendChild(statusCell);

    const actionCell = document.createElement("td");
    const button = document.createElement("button");
    const nextStatus = statuses[statuses.indexOf(parcel.status) + 1];
    button.type = "button";
    button.className = "small-button";
    button.dataset.parcelIndex = index;
    button.textContent = nextStatus ? "Next step: " + nextStatus : "Completed";
    button.disabled = !nextStatus;
    actionCell.appendChild(button);
    row.appendChild(actionCell);

    parcelRows.appendChild(row);
  });
}

function updateHomeCounts() {
  const totalCount = document.getElementById("total-count");
  const readyCount = document.getElementById("ready-count");

  if (totalCount) totalCount.textContent = parcels.length;
  if (readyCount) {
    readyCount.textContent = parcels.filter(function (parcel) {
      return parcel.status === "Ready to collect";
    }).length;
  }
}

if (parcelForm) {
  parcelForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const nextNumber = parcels.length + 1;
    const newParcel = {
      id: "P" + String(nextNumber).padStart(3, "0"),
      studentName: parcelForm.elements.studentName.value.trim(),
      studentId: parcelForm.elements.studentId.value.trim(),
      location: parcelForm.elements.location.value.trim(),
      status: statuses[0]
    };

    parcels.push(newParcel);
    const saved = saveParcels();
    renderParcels();
    updateHomeCounts();
    parcelForm.reset();
    formMessage.textContent = saved
      ? "Parcel " + newParcel.id + " added."
      : "Parcel added, but browser storage was unavailable.";
  });
}

if (parcelRows) {
  parcelRows.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-parcel-index]");
    if (!button) return;

    const parcel = parcels[Number(button.dataset.parcelIndex)];
    if (!parcel) return;

    const currentStatus = statuses.indexOf(parcel.status);
    if (currentStatus < statuses.length - 1) {
      parcel.status = statuses[currentStatus + 1];
      saveParcels();
      renderParcels();
      updateHomeCounts();
    }
  });
}

if (lookupForm) {
  lookupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const studentId = lookupForm.elements.studentId.value.trim();
    const matches = parcels.filter(function (parcel) {
      return parcel.studentId === studentId;
    });

    lookupResults.innerHTML = "";

    if (matches.length === 0) {
      const message = document.createElement("p");
      message.className = "quiet-text";
      message.textContent = "No parcel was found for student ID " + studentId + ".";
      lookupResults.appendChild(message);
      return;
    }

    matches.forEach(function (parcel) {
      const result = document.createElement("div");
      result.className = "lookup-result";

      const id = document.createElement("p");
      id.textContent = "Parcel " + parcel.id + " · " + parcel.location;
      result.appendChild(id);

      const status = document.createElement("p");
      status.textContent = "Status: " + parcel.status;
      result.appendChild(status);

      lookupResults.appendChild(result);
    });
  });
}

renderParcels();
updateHomeCounts();
