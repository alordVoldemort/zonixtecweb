// =========================
//  GET URL SERVICE PARAM
// =========================
const urlParams = new URLSearchParams(window.location.search);
const serviceParam = urlParams.get("service");

// Mapping same as your URL
const serviceMapping = {
    "web-design-development": "Web Design & Development",
    "web-app-development": "Web App Development",
    "custom-software": "Custom Software Development",
    "crm-solutions": "CRM Solutions",
    "erp-solutions": "ERP Solutions",
    "billing-invoice": "Billing Software",
    "mobile-development": "Mobile App Development",
    "ai-services": "AI Solutions",
    "cloud-solutions": "Cloud Solutions",
    "digital-marketing": "Digital Marketing",
    "ui-ux-design": "UI/UX Design"
};

let selectedDate = null;
let selectedTime = null;
let currentStep = 1;

// =========================
// PAGE LOAD
// =========================
document.addEventListener("DOMContentLoaded", () => {
    const serviceHighlight = document.getElementById("serviceHighlight");
    const pageTitle = document.getElementById("pageTitle");

    if (serviceParam && serviceMapping[serviceParam]) {
        const serviceName = serviceMapping[serviceParam];
        serviceHighlight.textContent = `Consultation for ${serviceName}`;
        serviceHighlight.style.display = "inline-block";
        pageTitle.textContent = `Book Call for ${serviceName}`;
    } else {
        serviceHighlight.style.display = "none";
        pageTitle.textContent = "Book Your Free 30-Minute Consultation";
    }

    initializeCalendar();
    initializeTimeSlots();
});

// =========================
// STEP NAVIGATION
// =========================
function nextStep(step) {
    if (step < 4) {
        document.getElementById(`step${step}`).classList.remove("active");
        document.getElementById(`step${step}`).classList.add("completed");

        const next = document.getElementById(`step${step + 1}`);
        next.classList.add("active");

        updateProgress(step + 1);

        document.querySelector(".booking-main-container").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

function previousStep(step) {
    if (step > 1) {
        document.getElementById(`step${step}`).classList.remove("active");

        const prev = document.getElementById(`step${step - 1}`);
        prev.classList.remove("completed");
        prev.classList.add("active");

        updateProgress(step - 1);

        document.querySelector(".booking-main-container").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

function updateProgress(step) {
    for (let i = 1; i <= 4; i++) {
        const stepIndicator = document.getElementById(`progress${i}`);
        const line = document.getElementById(`line${i}`);

        stepIndicator.classList.remove("active", "completed");
        if (line) line.classList.remove("completed");

        if (i < step) {
            stepIndicator.classList.add("completed");
            if (line) line.classList.add("completed");
        } else if (i === step) {
            stepIndicator.classList.add("active");
        }
    }
}

// =========================
// DATE PICKER
// =========================
function initializeCalendar() {
    flatpickr("#dateInput", {
        minDate: "today",
        dateFormat: "F j, Y",
        theme: "dark",
        onChange: (dates) => {
            if (dates.length > 0) {
                selectedDate = dates[0];
                document.getElementById("dateNextBtn").disabled = false;
            }
        }
    });
}

// =========================
// TIME SLOT SELECTOR
// =========================
function initializeTimeSlots() {
    const timeSlots = document.querySelectorAll(".time-slot");

    timeSlots.forEach(slot => {
        slot.addEventListener("click", function () {
            timeSlots.forEach(s => s.classList.remove("selected"));
            this.classList.add("selected");

            selectedTime = this.dataset.time;
            document.getElementById("timeNextBtn").disabled = false;
        });
    });
}

// =========================
// LIVE VALIDATION
// =========================

// Only letters in name
document.getElementById("bookingName").addEventListener("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
});

// Only digits in phone
document.getElementById("bookingPhone").addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "");
});

// =========================
// FINAL SUBMIT (DATABASE SAVE) + AUTO CLOSE PAGE
// =========================
document.getElementById("bookingFormPage").addEventListener("submit", async function (e) {
    e.preventDefault();

    // ===== VALIDATION =====
    if (!selectedDate) return alert("Please select a date.");
    if (!selectedTime) return alert("Please select a time slot.");

    const name = document.getElementById("bookingName").value.trim();
    const email = document.getElementById("bookingEmail").value.trim();
    const phone = document.getElementById("bookingPhone").value.trim();
    const company = document.getElementById("bookingCompany").value.trim();
    const message = document.getElementById("bookingMessage").value.trim();

    if (!/^[A-Za-z\s]+$/.test(name)) return alert("Full Name must contain only letters.");
    if (!/^[0-9]{10}$/.test(phone)) return alert("Phone number must be 10 digits.");
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return alert("Enter a valid email.");

    const bookingDate = selectedDate.toISOString().split("T")[0];

    const selectedService =
        serviceParam && serviceMapping[serviceParam]
            ? serviceMapping[serviceParam]
            : "General Consultation";

    const payload = {
        name,
        email,
        phone,
        company,
        message,
        bookingDate,
        bookingTime: selectedTime,
        service: selectedService
    };

    console.log("Sending to PHP:", payload);

    // Disable submit UI
    const submitBtn = document.querySelector(".submit-btn-page");
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Booking...`;

    try {
        const response = await fetch("https://zonixtec.com/server/booking/save-booking.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log("PHP Response:", result);

        if (result.success) {
            // Show success message
            document.getElementById("bookingSuccessPage").style.display = "block";

            // AUTO CLOSE PAGE AFTER 1.5 SECONDS
            setTimeout(() => {
                window.location.href = "index.html";  // Redirect to home page
            }, 1500);
        } else {
            alert("Error: " + result.message);
        }
    } catch (err) {
        alert("Something went wrong.");
        console.error(err);
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fas fa-calendar-check"></i> Book My Free Consultation`;
});
