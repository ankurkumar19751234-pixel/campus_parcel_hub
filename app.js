"use strict";

const STORAGE_KEY = "campusParcelHub";
const statuses = ["At desk", "With courier", "Ready to collect", "Collected"];

const sampleParcels = [
  { id: "P001", studentName: "Aanya Sharma", studentId: "12345678", location: "Block C", status: "At desk" },
  { id: "P002", studentName: "Dev Mehta", studentId: "87654321", location: "Block A", status: "With courier" },
  { id: "P003", studentName: "Isha Kapoor", studentId: "11223344", location: "Block B", status: "Ready to collect" },
  { id: "P004", studentName: "Rohan Gill", studentId: "22004568", location: "Block D", status: "Collected" }
];

const parcelRows = document.getElementById("parcel-rows");
const parcelForm = document.getElementById("parcel-form");
const formMessage = document.getElementById("form-message");
const lookupForm = document.getElementById("lookup-form");
const lookupResults = document.getElementById("lookup-results");

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

function saveParcels() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parcels));
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
  parcelRows.innerHTML = "";

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

parcelForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const newParcel = {
    id: "P" + String(parcels.length + 1).padStart(3, "0"),
    studentName: parcelForm.elements.studentName.value.trim(),
    studentId: parcelForm.elements.studentId.value.trim(),
    location: parcelForm.elements.location.value.trim(),
    status: statuses[0]
  };

  parcels.push(newParcel);
  saveParcels();
  renderParcels();
  parcelForm.reset();
  formMessage.textContent = "Parcel " + newParcel.id + " added.";
});

parcelRows.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-parcel-index]");
  if (!button) return;

  const parcel = parcels[Number(button.dataset.parcelIndex)];
  const currentStatus = statuses.indexOf(parcel.status);
  if (currentStatus < statuses.length - 1) {
    parcel.status = statuses[currentStatus + 1];
    saveParcels();
    renderParcels();
  }
});

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

renderParcels();
