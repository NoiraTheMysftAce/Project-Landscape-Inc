/* Landscape Inc. — Jobs management
   Replaces the previous jobs.js.
   Existing localStorage keys are preserved. */

const $ = (id) => document.getElementById(id);

const jobsTableBody = $("jobsTableBody");
const manageJobModal = $("manageJobModal");
const closeManageJob = $("closeManageJob");

const manageJobLocation = $("manageJobLocation");
const manageJobType = $("manageJobType");
const manageJobStatus = $("manageJobStatus");

const jobInstructions = $("jobInstructions");
const saveJobInstructions = $("saveJobInstructions");
const instructionsSaveMessage = $("instructionsSaveMessage");

const jobAssignee = $("jobAssignee");
const saveJobAssignment = $("saveJobAssignment");
const assignmentSaveMessage = $("assignmentSaveMessage");

const beforeJobPhoto = $("beforeJobPhoto");
const afterJobPhoto = $("afterJobPhoto");
const beforePhotoPreview = $("beforePhotoPreview");
const afterPhotoPreview = $("afterPhotoPreview");

const jobIssue = $("jobIssue");
const jobIssueStatus = $("jobIssueStatus");
const saveJobIssue = $("saveJobIssue");
const issueSaveMessage = $("issueSaveMessage");

const approveJobButton = $("approveJobButton");
const approvalDescription = $("approvalDescription");
const approvalMessage = $("approvalMessage");

const jobStatusSelect = $("jobStatusSelect");
const saveJobStatus = $("saveJobStatus");
const statusSaveMessage = $("statusSaveMessage");

const newJobButton = document.querySelector(".new-job-button");
const newJobModal = $("newJobModal");
const closeNewJob = $("closeNewJob");
const newJobForm = $("newJobForm");

const JOBS_STORAGE_KEY = "landscape-created-jobs";

const STATUS_CLASSES = {
    "Scheduled": "scheduled",
    "In Progress": "in-progress",
    "Awaiting Review": "awaiting-review",
    "Approved": "approved"
};

let currentJobRow = null;
let currentJobKey = null;
let lastManageButton = null;

let beforePhotoURL = null;
let afterPhotoURL = null;

/* =========================
   JOB STORAGE
========================= */

function getCreatedJobs() {
    try {
        const jobs = JSON.parse(
            localStorage.getItem(JOBS_STORAGE_KEY) || "[]"
        );

        return Array.isArray(jobs) ? jobs : [];
    } catch (error) {
        return [];
    }
}

function saveCreatedJobs(jobs) {
    localStorage.setItem(
        JOBS_STORAGE_KEY,
        JSON.stringify(jobs)
    );
}

// Original sample jobs keep their existing storage keys.
// Newly created jobs use their unique IDs.

function getJobKey(row) {
    if (row.dataset.jobId) {
        return row.dataset.jobId;
    }

    const cells = row.querySelectorAll("td");

    return JSON.stringify([
        cells[0].textContent.trim(),
        cells[1].textContent.trim()
    ]);
}

/* =========================
   JOB STATUS
========================= */

function getStoredStatus(row) {
    const saved = localStorage.getItem(
        "landscape-job-status:" + getJobKey(row)
    );

    const badge = row.querySelector(".job-status");

    const fallback = badge
        ? badge.textContent.trim()
        : "Scheduled";

    return STATUS_CLASSES[saved]
        ? saved
        : STATUS_CLASSES[fallback]
            ? fallback
            : "Scheduled";
}

function setRowStatus(row, status, persist = false) {
    if (!STATUS_CLASSES[status]) return;

    const badge = row.querySelector(".job-status");

    badge.textContent = status;
    badge.className = "job-status " + STATUS_CLASSES[status];

    if (persist) {
        localStorage.setItem(
            "landscape-job-status:" + getJobKey(row),
            status
        );
    }
}

/* =========================
   CREATE TABLE ROW
========================= */

function createJobRow(job) {
    const row = document.createElement("tr");

    row.dataset.jobId = job.id;

    // LOCATION
    const locationCell = document.createElement("td");
    locationCell.textContent =
        "Panda Express - " + job.location;

    // JOB TYPE
    const typeCell = document.createElement("td");
    typeCell.textContent = job.type;

    // SCHEDULED DATE
    const dateCell = document.createElement("td");

    dateCell.textContent = job.date
        ? new Date(job.date + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        })
        : "—";

    const statusCell = document.createElement("td");

    const badge = document.createElement("span");
    badge.className = "job-status scheduled";
    badge.textContent = "Scheduled";

    statusCell.appendChild(badge);

    const actionCell = document.createElement("td");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "manage-job-button";
    button.textContent = "Manage";

const editButton = document.createElement("button");
editButton.type = "button";
editButton.className = "edit-job-button";
editButton.textContent = "Edit";

const deleteButton = document.createElement("button");
deleteButton.type = "button";
deleteButton.className = "delete-job-button";
deleteButton.textContent = "Delete";

actionCell.append(button, editButton, deleteButton);


    row.append(
        locationCell,
        typeCell,
        dateCell,
        statusCell,
        actionCell
    );

    setRowStatus(
        row,
        STATUS_CLASSES[job.status]
            ? job.status
            : "Scheduled"
    );

    setRowStatus(row, getStoredStatus(row));

    return row;
}

/* =========================
   RESTORE SAVED JOBS
========================= */

getCreatedJobs().forEach(function (job) {
    jobsTableBody.appendChild(createJobRow(job));
});

jobsTableBody.querySelectorAll("tr").forEach(function (row) {
    setRowStatus(row, getStoredStatus(row));
});

/* =========================
   PHOTO PREVIEWS
========================= */

function clearPhotoPreviews() {
    beforeJobPhoto.value = "";
    afterJobPhoto.value = "";

    if (beforePhotoURL) {
        URL.revokeObjectURL(beforePhotoURL);
    }

    if (afterPhotoURL) {
        URL.revokeObjectURL(afterPhotoURL);
    }

    beforePhotoURL = null;
    afterPhotoURL = null;

    beforePhotoPreview.textContent =
        "No before photo selected";

    afterPhotoPreview.textContent =
        "No after photo selected";
}

function previewJobPhoto(input, preview, type) {
    const file = input.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        input.value = "";
        return;
    }

    const url = URL.createObjectURL(file);

    if (type === "before") {
        if (beforePhotoURL) {
            URL.revokeObjectURL(beforePhotoURL);
        }

        beforePhotoURL = url;
    } else {
        if (afterPhotoURL) {
            URL.revokeObjectURL(afterPhotoURL);
        }

        afterPhotoURL = url;
    }

    const image = document.createElement("img");
    image.src = url;

    image.alt = type === "before"
        ? "Before landscaping work"
        : "After landscaping work";

    preview.replaceChildren(image);
}

beforeJobPhoto.addEventListener("change", function () {
    previewJobPhoto(
        beforeJobPhoto,
        beforePhotoPreview,
        "before"
    );
});

afterJobPhoto.addEventListener("change", function () {
    previewJobPhoto(
        afterJobPhoto,
        afterPhotoPreview,
        "after"
    );
});

/* =========================
   APPROVAL CONTROLS
========================= */

function refreshStatusControls(status) {
    const approved = status === "Approved";

    jobStatusSelect.value = status;
    jobStatusSelect.disabled = approved;
    saveJobStatus.disabled = approved;

    approveJobButton.disabled =
        status !== "Awaiting Review";

    approvalDescription.textContent = approved
        ? "This job has already been approved."
        : status === "Awaiting Review"
            ? "Review the completed work before approving this job."
            : "Only jobs awaiting review can be approved.";
}

/* =========================
   OPEN MANAGE JOB
========================= */

function openManageJob(row, button) {
    currentJobRow = row;
    currentJobKey = getJobKey(row);
    lastManageButton = button;

    const cells = row.querySelectorAll("td");
    const status = getStoredStatus(row);

    manageJobLocation.textContent =
        cells[0].textContent.trim();

    manageJobType.textContent =
        "Job Type: " + cells[1].textContent.trim();

    manageJobStatus.textContent =
        "Status: " + status;

    jobInstructions.value =
        localStorage.getItem(
            "landscape-job-instructions:" + currentJobKey
        ) || "";

    jobAssignee.value =
        localStorage.getItem(
            "landscape-job-assignment:" + currentJobKey
        ) || "";

    try {
        const issue = JSON.parse(
            localStorage.getItem(
                "landscape-job-issue:" + currentJobKey
            ) || "{}"
        );

        jobIssue.value = issue.description || "";

        jobIssueStatus.value =
            ["none", "open", "resolved"].includes(issue.status)
                ? issue.status
                : "none";

    } catch (error) {
        jobIssue.value = "";
        jobIssueStatus.value = "none";
    }

    instructionsSaveMessage.textContent = "";
    assignmentSaveMessage.textContent = "";
    issueSaveMessage.textContent = "";
    approvalMessage.textContent = "";

    statusSaveMessage.textContent =
        status === "Approved"
            ? "Approved jobs cannot change status."
            : "";

    clearPhotoPreviews();
    refreshStatusControls(status);

    manageJobModal.hidden = false;
    closeManageJob.focus();
}

/* =========================
   EDIT JOB WINDOW
========================= */

const editJobModal = document.getElementById("editJobModal");
const closeEditJob = document.getElementById("closeEditJob");
const editJobForm = document.getElementById("editJobForm");

const editJobLocation = document.getElementById("editJobLocation");
const editJobType = document.getElementById("editJobType");
const editJobDate = document.getElementById("editJobDate");

let editingJobRow = null;

function closeEditJobModal() {
    editJobModal.hidden = true;
    editingJobRow = null;
}

closeEditJob.addEventListener("click", closeEditJobModal);
document.getElementById("cancelEditJob")
    .addEventListener("click", closeEditJobModal);

editJobModal.addEventListener("click", function (event) {
    if (event.target === editJobModal) {
        closeEditJobModal();
    }
});

function openEditJob(row) {
    // Only user-created jobs have a unique ID.
    if (!row.dataset.jobId) {
        alert("Editing sample jobs is not available yet.");
        return;
    }

    const job = getCreatedJobs().find(function (item) {
        return item.id === row.dataset.jobId;
    });

    if (!job) return;

    editingJobRow = row;

    editJobLocation.value = job.location;
    editJobType.value = job.type;
    editJobDate.value = job.date;

    editJobModal.hidden = false;
    editJobLocation.focus();
}

/* =========================
   SAVE EDITED JOB
========================= */

editJobForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!editingJobRow) return;

    const jobId = editingJobRow.dataset.jobId;

    const location = editJobLocation.value;
    const type = editJobType.value.trim();
    const date = editJobDate.value;

    if (!location || !type || !date) return;

    const jobs = getCreatedJobs();

    const job = jobs.find(function (item) {
        return item.id === jobId;
    });

    if (!job) return;

    // Update saved job information
    job.location = location;
    job.type = type;
    job.date = date;

    saveCreatedJobs(jobs);

    // Update the table immediately
    editingJobRow.cells[0].textContent =
        "Panda Express - " + location;

    editingJobRow.cells[1].textContent = type;

    editingJobRow.cells[2].textContent =
        new Date(date + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });

    closeEditJobModal();
});
/* =========================
   MANAGE, EDIT & DELETE BUTTONS
========================= */

// Works for original AND newly created jobs.

jobsTableBody.addEventListener("click", function (event) {

    // DELETE JOB
    const deleteButton = event.target.closest(".delete-job-button");

    if (deleteButton && jobsTableBody.contains(deleteButton)) {
        const row = deleteButton.closest("tr");
        const jobId = row.dataset.jobId;

        if (!jobId) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this job? This action cannot be undone."
        );

        if (!confirmed) return;

        const updatedJobs = getCreatedJobs().filter(
            job => job.id !== jobId
        );

        saveCreatedJobs(updatedJobs);

        localStorage.removeItem("landscape-job-instructions:" + jobId);
        localStorage.removeItem("landscape-job-assignment:" + jobId);
        localStorage.removeItem("landscape-job-issue:" + jobId);
        localStorage.removeItem("landscape-job-status:" + jobId);

        row.remove();
        return;
    }

    // EDIT JOB
    const editButton = event.target.closest(".edit-job-button");

    if (editButton && jobsTableBody.contains(editButton)) {
        openEditJob(editButton.closest("tr"));
        return;
    }

    // MANAGE JOB
    const button = event.target.closest(".manage-job-button");

    if (!button || !jobsTableBody.contains(button)) {
        return;
    }

    openManageJob(
        button.closest("tr"),
        button
    );

});

/* =========================
   CLOSE MANAGE WINDOW
========================= */

function closeManageModal() {
    manageJobModal.hidden = true;

    if (lastManageButton && lastManageButton.isConnected) {
        lastManageButton.focus();
    }
}

closeManageJob.addEventListener(
    "click",
    closeManageModal
);

manageJobModal.addEventListener("click", function (event) {
    if (event.target === manageJobModal) {
        closeManageModal();
    }
});

/* =========================
   SAVE INSTRUCTIONS
========================= */

saveJobInstructions.addEventListener("click", function () {
    if (!currentJobKey) return;

    localStorage.setItem(
        "landscape-job-instructions:" + currentJobKey,
        jobInstructions.value
    );

    instructionsSaveMessage.textContent =
        "Instructions saved successfully!";
});

/* =========================
   SAVE ASSIGNMENT
========================= */

saveJobAssignment.addEventListener("click", function () {
    if (!currentJobKey) return;

    localStorage.setItem(
        "landscape-job-assignment:" + currentJobKey,
        jobAssignee.value.trim()
    );

    assignmentSaveMessage.textContent =
        "Assignment saved successfully!";
});

/* =========================
   SAVE ISSUES
========================= */

saveJobIssue.addEventListener("click", function () {
    if (!currentJobKey) return;

    localStorage.setItem(
        "landscape-job-issue:" + currentJobKey,
        JSON.stringify({
            description: jobIssue.value.trim(),
            status: jobIssueStatus.value
        })
    );

    issueSaveMessage.textContent =
        "Issue information saved successfully!";
});

/* =========================
   UPDATE JOB STATUS
========================= */

saveJobStatus.addEventListener("click", function () {
    if (!currentJobKey || !currentJobRow) return;

    if (getStoredStatus(currentJobRow) === "Approved") {
        return;
    }

    const status = jobStatusSelect.value;

    if (!STATUS_CLASSES[status] || status === "Approved") {
        return;
    }

    setRowStatus(currentJobRow, status, true);

    manageJobStatus.textContent =
        "Status: " + status;

    refreshStatusControls(status);

    statusSaveMessage.textContent =
        "Job status updated successfully!";

    approvalMessage.textContent = "";
});

/* =========================
   APPROVE COMPLETED JOB
========================= */

approveJobButton.addEventListener("click", function () {
    if (!currentJobKey || !currentJobRow) return;

    if (getStoredStatus(currentJobRow) !== "Awaiting Review") {
        return;
    }

    // Photo uploads are temporary previews.
    // This is currently a prototype approval action.

    setRowStatus(currentJobRow, "Approved", true);

    manageJobStatus.textContent =
        "Status: Approved";

    refreshStatusControls("Approved");

    statusSaveMessage.textContent = "";

    approvalMessage.textContent =
        "Job approved successfully!";
});

/* =========================
   NEW JOB WINDOW
========================= */

function closeNewJobModal() {
    newJobModal.hidden = true;
    newJobButton.focus();
}

newJobButton.addEventListener("click", function () {
    newJobModal.hidden = false;
    $("newJobLocation").focus();
});

closeNewJob.addEventListener(
    "click",
    closeNewJobModal
);

newJobModal.addEventListener("click", function (event) {
    if (event.target === newJobModal) {
        closeNewJobModal();
    }
});

/* =========================
   ESCAPE KEY
========================= */

document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;

    if (!newJobModal.hidden) {
        closeNewJobModal();
    } else if (!manageJobModal.hidden) {
        closeManageModal();
    }
});

/* =========================
   CREATE NEW JOB
========================= */

newJobForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const location = $("newJobLocation").value;
    const type = $("newJobType").value.trim();
    const date = $("newJobDate").value;

    const instructions =
        $("newJobInstructions").value.trim();

    if (!location || !type || !date) return;

    const job = {
        id: crypto.randomUUID(),
        location,
        type,
        date,
        status: "Scheduled"
    };

    const jobs = getCreatedJobs();

    jobs.push(job);
    saveCreatedJobs(jobs);

    localStorage.setItem(
        "landscape-job-instructions:" + job.id,
        instructions
    );

    jobsTableBody.appendChild(createJobRow(job));

    newJobForm.reset();
    closeNewJobModal();
});

/* =========================
   SEARCH & FILTER JOBS
========================= */

const jobSearch = document.getElementById("jobSearch");
const jobStatusFilter = document.getElementById("jobStatusFilter");

function filterJobs() {
    const searchTerm = jobSearch.value.trim().toLowerCase();
    const selectedStatus = jobStatusFilter.value;

    const rows = jobsTableBody.querySelectorAll("tr");

    rows.forEach(function (row) {
        const location = row.cells[0].textContent.toLowerCase();
        const jobType = row.cells[1].textContent.toLowerCase();
        const status = row.querySelector(".job-status")
            .textContent.trim();

        const matchesSearch =
            location.includes(searchTerm) ||
            jobType.includes(searchTerm);

        const matchesStatus =
            selectedStatus === "all" ||
            status === selectedStatus;

        row.hidden = !(matchesSearch && matchesStatus);
    });
}

jobSearch.addEventListener("input", filterJobs);
jobStatusFilter.addEventListener("change", filterJobs);