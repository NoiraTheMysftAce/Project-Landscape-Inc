/* =========================
   SERVICE REQUEST REVIEW
========================= */

// Find our HTML elements
const reviewButton = document.getElementById("reviewButton");
const requestCount = document.getElementById("requestCount");
const newRequestsCount = document.getElementById("newRequestsCount");
const modalJobInstructions = document.getElementById("modalJobInstructions");
const modalJobAssignment = document.getElementById("modalJobAssignment");

// Check if the request was previously reviewed
let isReviewed = localStorage.getItem("requestReviewed") === "true";

// Update the dashboard based on the saved status
function updateRequestStatus() {

    if (isReviewed) {
        requestCount.textContent = "0 Pending";
        newRequestsCount.textContent = "0";

        reviewButton.textContent = "Reviewed";
        reviewButton.disabled = true;
        reviewButton.classList.add("reviewed");

    } else {
        requestCount.textContent = "1 Pending";
        newRequestsCount.textContent = "1";

        reviewButton.textContent = "Mark as Reviewed";
        reviewButton.disabled = false;
        reviewButton.classList.remove("reviewed");
    }
}

// Load the saved status when the page opens
updateRequestStatus();

// Handle the review button click
reviewButton.addEventListener("click", function () {

    // Mark the request as reviewed
    isReviewed = true;

    // Save the status in the browser
    localStorage.setItem("requestReviewed", "true");

    // Update the dashboard
    updateRequestStatus();

});

/* =========================
   DASHBOARD TIME FILTER
========================= */

const filterButtons = document.querySelectorAll(".filter-button");

filterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        // Remove active state from all buttons
        filterButtons.forEach(function (filter) {
            filter.classList.remove("active");
            filter.setAttribute("aria-pressed", "false");
        });

        // Activate the selected button
        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");

        // Read the selected time period
        const selectedPeriod = button.dataset.period;

        console.log("Selected period:", selectedPeriod);

    });

});

/* =========================
   DASHBOARD STATISTICS
========================= */

// Sample statistics for each time period
const dashboardData = {
    week: {
        jobsComingUp: 4,
        jobsToday: 2,
        jobsFinished: 8,
        needsApproval: 1,
        delayedJobs: 1,
        maintenanceDue: 3,
        recentUpdates: 3
    },

    month: {
        jobsComingUp: 12,
        jobsToday: 2,
        jobsFinished: 24,
        needsApproval: 3,
        delayedJobs: 2,
        maintenanceDue: 5,
        recentUpdates: 9
    }
};

// Update the dashboard numbers
function updateDashboardStats(period) {

    const stats = dashboardData[period];

    Object.keys(stats).forEach(function (statId) {

        const element = document.getElementById(statId);

        if (element) {
            element.textContent = stats[statId];
        }

    });
}

// Connect the existing filter buttons
filterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const selectedPeriod = button.dataset.period;

        updateDashboardStats(selectedPeriod);

        // Remember the selected period
        localStorage.setItem("dashboardPeriod", selectedPeriod);

    });

});

/* =========================
   REMEMBER SELECTED FILTER
========================= */

// Get the saved filter, or use "week" by default
const savedPeriod =
    localStorage.getItem("dashboardPeriod") === "month"
        ? "month"
        : "week";

// Update the statistics
updateDashboardStats(savedPeriod);

// Update the active button
filterButtons.forEach(function (button) {

    const isActive = button.dataset.period === savedPeriod;

    button.classList.toggle("active", isActive);

    button.setAttribute(
        "aria-pressed",
        String(isActive)
    );

});

/* =========================
   JOB INFORMATION
========================= */

// Sample job details for our prototype
const jobDetails = {
    "Panda Express - Eubank / Lomas": {
        instructions:
            "Mow grass, trim edges, remove weeds, and clean up landscaping debris.",
        assignedTo:
            "Miguel - Field Operations"
    },

    "Panda Express - Eubank / Montgomery": {
        instructions:
            "Inspect landscaping areas, trim shrubs, remove weeds, and clear debris from walkways.",
        assignedTo:
            "Miguel - Field Operations"
    },

    "Panda Express - Rio Bravo / Coors": {
        instructions:
            "Trim overgrown tree branches, remove fallen branches, and clean the surrounding area.",
        assignedTo:
            "Miguel - Field Operations"
    }
};

/* =========================
   JOB DETAILS MODAL
========================= */

// Find the modal elements
const jobModal = document.getElementById("jobModal");
const closeJobModal = document.getElementById("closeJobModal");

const modalJobLocation = document.getElementById("modalJobLocation");
const modalJobType = document.getElementById("modalJobType");
const modalJobStatus = document.getElementById("modalJobStatus");

// Find all View Details links inside Upcoming Jobs
const jobLinks = document.querySelectorAll(
    ".upcoming-jobs .job-link"
);

// Remember which link opened the modal
let lastClickedJobLink = null;

// Open the selected job
jobLinks.forEach(function (link) {

    link.addEventListener("click", function (event) {

        // Prevent the link from jumping to the top
        event.preventDefault();

        // Find the job row that was clicked
        const jobItem = link.closest(".job-item");

        // Get the information from that job
        const location = jobItem.querySelector(
            ".job-info h4"
        ).textContent.trim();

        const jobType = jobItem.querySelector(
            ".job-info p"
        ).textContent.trim();

        const status = jobItem.querySelector(
            ".job-status"
        ).textContent.trim();

        // Display the selected job's information
        modalJobLocation.textContent = location;
        modalJobType.textContent = "Job Type: " + jobType;
        modalJobStatus.textContent = "Status: " + status;

        // Find the additional details for this location
const selectedJob = jobDetails[location];

// Display the job's instructions and assignment
if (selectedJob) {
    modalJobInstructions.textContent =
        selectedJob.instructions;

    modalJobAssignment.textContent =
        selectedJob.assignedTo;
} else {
    modalJobInstructions.textContent =
        "No instructions available.";

    modalJobAssignment.textContent =
        "Not assigned.";
}

currentJobLocation = location;
displayJobPhotos(location);

        // Remember the clicked link
        lastClickedJobLink = link;

        // Show the popup
        jobModal.hidden = false;

        // Move keyboard focus to the close button
        closeJobModal.focus();

    });

});

// Close the popup
function closeModal() {
    jobModal.hidden = true;

    // Return focus to the selected job link
    if (lastClickedJobLink) {
        lastClickedJobLink.focus();
    }
}

// Close when clicking the X button
closeJobModal.addEventListener("click", closeModal);

// Close when clicking outside the popup
jobModal.addEventListener("click", function (event) {

    if (event.target === jobModal) {
        closeModal();
    }

});

// Close when pressing Escape
document.addEventListener("keydown", function (event) {

    if (event.key === "Escape" && !jobModal.hidden) {
        closeModal();
    }

});

/* =========================
   JOB PHOTOS - VIEW ONLY
========================= */

// Temporary photo data
// Later, these will come from the Jobs page
const jobPhotos = {};

let currentJobLocation = null;

// Find the photo display elements
const beforePhotoPreview = document.getElementById("beforePhotoPreview");
const beforePhotoPlaceholder = document.getElementById("beforePhotoPlaceholder");

const afterPhotoPreview = document.getElementById("afterPhotoPreview");
const afterPhotoPlaceholder = document.getElementById("afterPhotoPlaceholder");

// Display photos belonging to the selected job
function displayJobPhotos(location) {

    const photos = jobPhotos[location] || {};

    // Before photo
    if (photos.before) {
        beforePhotoPreview.src = photos.before;
        beforePhotoPreview.hidden = false;
        beforePhotoPlaceholder.hidden = true;
    } else {
        beforePhotoPreview.removeAttribute("src");
        beforePhotoPreview.hidden = true;
        beforePhotoPlaceholder.hidden = false;
    }

    // After photo
    if (photos.after) {
        afterPhotoPreview.src = photos.after;
        afterPhotoPreview.hidden = false;
        afterPhotoPlaceholder.hidden = true;
    } else {
        afterPhotoPreview.removeAttribute("src");
        afterPhotoPreview.hidden = true;
        afterPhotoPlaceholder.hidden = false;
    }

}