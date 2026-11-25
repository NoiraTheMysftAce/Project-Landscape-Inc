/* =========================
   LANDSCAPE INC. CALENDAR
========================= */

const calendarMonth = document.getElementById("calendarMonth");
const calendarGrid = document.getElementById("calendarGrid");

const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");
/* =========================
   LOAD SAVED JOBS
========================= */

function getScheduledJobs() {
    try {
        const jobs = JSON.parse(
            localStorage.getItem("landscape-created-jobs") || "[]"
        );

        return Array.isArray(jobs) ? jobs : [];
    } catch (error) {
        return [];
    }
}

// Start with the current month
let currentDate = new Date();

function renderCalendar() {
    calendarGrid.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Display month and year
    calendarMonth.textContent =
        currentDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });

    // First weekday of the month (0 = Sunday)
    const firstDay = new Date(year, month, 1).getDay();

    // Number of days in this month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add empty cells before the first day
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "calendar-day empty";
        emptyCell.setAttribute("aria-hidden", "true");

        calendarGrid.appendChild(emptyCell);
    }

    // Get jobs saved from the Jobs tab
const scheduledJobs = getScheduledJobs();

    // Generate each day
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement("div");
        dayCell.className = "calendar-day";

        // Highlight today's date
const today = new Date();

if (
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()
) {
    dayCell.classList.add("today");
    dayCell.setAttribute("aria-current", "date");
}

        const dayNumber = document.createElement("span");
        dayNumber.textContent = day;

        dayCell.appendChild(dayNumber);

// Match jobs to this calendar date
const dateString =
    year + "-" +
    String(month + 1).padStart(2, "0") + "-" +
    String(day).padStart(2, "0");

const jobsForDay = scheduledJobs.filter(function (job) {
    return job.date === dateString;
});

// Display each scheduled job
jobsForDay.forEach(function (job) {
    const jobLabel = document.createElement("button");

    jobLabel.type = "button";
    jobLabel.className = "calendar-job";

    jobLabel.textContent =
        job.location + " — " + job.type;

    jobLabel.addEventListener("click", function () {
    document.getElementById("calendarJobLocation").textContent =
        "Panda Express - " + job.location;

    document.getElementById("calendarJobType").textContent =
        job.type;

    document.getElementById("calendarJobDate").textContent =
        new Date(job.date + "T00:00:00").toLocaleDateString(
            "en-US",
            {
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );

    const savedStatus = localStorage.getItem(
        "landscape-job-status:" + job.id
    );

    document.getElementById("calendarJobStatus").textContent =
        savedStatus || job.status || "Scheduled";

    document.getElementById("calendarJobModal").hidden = false;
});

    dayCell.appendChild(jobLabel);
});

calendarGrid.appendChild(dayCell);
    }
}

// Previous month
prevMonth.addEventListener("click", function () {
    currentDate.setDate(1);
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

// Next month
nextMonth.addEventListener("click", function () {
    currentDate.setDate(1);
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Display calendar when page loads
renderCalendar();

/* =========================
   CLOSE CALENDAR JOB DETAILS
========================= */

const calendarJobModal =
    document.getElementById("calendarJobModal");

const closeCalendarJob =
    document.getElementById("closeCalendarJob");

function closeCalendarJobModal() {
    calendarJobModal.hidden = true;
}

// Close using the X button
closeCalendarJob.addEventListener("click", closeCalendarJobModal);

// Close by clicking outside the window
calendarJobModal.addEventListener("click", function (event) {
    if (event.target === calendarJobModal) {
        closeCalendarJobModal();
    }
});

// Close using the Escape key
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !calendarJobModal.hidden) {
        closeCalendarJobModal();
    }
});