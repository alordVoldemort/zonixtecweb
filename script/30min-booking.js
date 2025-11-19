// ================= OPEN MODAL =================
function openBookingModal() {
    document.getElementById("bookingModal").style.display = "block";
    resetBookingModal();
}

// ================= CLOSE MODAL =================
function closeBookingModal() {
    document.getElementById("bookingModal").style.display = "none";
    resetBookingModal();
}

// =============== RESET ALL STEPS ===============
function resetBookingModal() {
    document.querySelectorAll(".booking-modal-step").forEach(step => {
        step.classList.remove("booking-active");
        step.style.display = "none";
    });

    document.getElementById("step1").classList.add("booking-active");
    document.getElementById("step1").style.display = "block";

    document.getElementById("bookingSuccessPage").style.display = "none";

    document.getElementById("bookingFormPage").reset();

    document.getElementById("dateInput").value = "";
    document.getElementById("dateNextBtn").disabled = true;

    document.querySelectorAll(".booking-time-slot").forEach(slot => slot.classList.remove("booking-selected"));
    document.getElementById("timeNextBtn").disabled = true;

    updateProgress(1);
}

// ================= UPDATE PROGRESS =================
function updateProgress(step) {
    for (let i = 1; i <= 4; i++) {
        const progressStep = document.getElementById(`progress${i}`);
        const progressLine = document.getElementById(`line${i}`);

        progressStep.classList.remove("booking-active", "booking-completed");
        if (progressLine) progressLine.classList.remove("booking-completed");

        if (i < step) {
            progressStep.classList.add("booking-completed");
            if (progressLine) progressLine.classList.add("booking-completed");
        } else if (i === step) {
            progressStep.classList.add("booking-active");
        }
    }
}

// ================= FLATPICKR =================
flatpickr("#dateInput", {
    minDate: "today",
    dateFormat: "F j, Y",
    onChange: () => {
        document.getElementById("dateNextBtn").disabled = false;
    }
});

// ================= NEXT STEP =================
function nextStep(step) {
    document.getElementById(`step${step}`).style.display = "none";
    document.getElementById(`step${step + 1}`).style.display = "block";

    updateProgress(step + 1);
}

// ================= PREVIOUS STEP =================
function previousStep(step) {
    document.getElementById(`step${step}`).style.display = "none";
    document.getElementById(`step${step - 1}`).style.display = "block";

    updateProgress(step - 1);
}

// ================= TIME SLOT SELECT =================
function initializeTimeSlots() {
    document.querySelectorAll(".booking-time-slot").forEach(slot => {
        slot.addEventListener("click", () => {
            document.querySelectorAll(".booking-time-slot").forEach(s => s.classList.remove("booking-selected"));
            slot.classList.add("booking-selected");
            document.getElementById("timeNextBtn").disabled = false;
        });
    });
}

// ================= LIVE VALIDATION =================

// FULL NAME — only letters
const nameField = document.getElementById("bookingName");
nameField.addEventListener("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, ""); 
});

// PHONE — only digits
const phoneField = document.getElementById("bookingPhone");
phoneField.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, ""); 
});

// ================= FINAL FORM SUBMIT + VALIDATION =================
document.getElementById("bookingFormPage").addEventListener("submit", async function (e) {
    e.preventDefault();
    let isValid = true;

    // ----------- NAME VALIDATION ------------
    const nameError = document.getElementById("nameError");
    if (nameField.value.trim() === "") {
        nameError.textContent = "Full Name is required.";
        isValid = false;
    } else {
        nameError.textContent = "";
    }

    // ----------- PHONE VALIDATION ------------
    const phoneError = document.getElementById("phoneError");
    if (!/^[0-9]{10}$/.test(phoneField.value.trim())) {
        phoneError.textContent = "Phone number must be 10 digits.";
        isValid = false;
    } else {
        phoneError.textContent = "";
    }

    // ----------- EMAIL VALIDATION ------------
    const emailField = document.getElementById("bookingEmail");
    const emailError = document.getElementById("emailError");

    if (!emailField.checkValidity()) {
        emailError.textContent = "Enter a valid email address.";
        isValid = false;
    } else {
        emailError.textContent = "";
    }

    if (!isValid) return;

    // ----------- PREPARE PAYLOAD ------------
    const payload = {
        name: nameField.value.trim(),
        email: emailField.value.trim(),
        phone: phoneField.value.trim(),
        company: document.getElementById("bookingCompany").value.trim(),
        message: document.getElementById("bookingMessage").value.trim(),
        bookingDate: new Date(document.getElementById("dateInput").value).toISOString().split("T")[0],
        bookingTime: document.querySelector(".booking-time-slot.booking-selected")?.dataset.time,
        service: "Consultation Call"
    };

    if (!payload.bookingTime) {
        alert("Please select a time slot");
        return;
    }

    // ----------- SEND TO PHP ------------
    try {
        const response = await fetch("https://zonixtec.com/server/booking/save-booking.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log("Response:", result);

        if (result.success) {
            document.getElementById("step4").style.display = "none";
            document.getElementById("bookingSuccessPage").style.display = "block";

            setTimeout(() => {
                closeBookingModal();
                resetBookingModal();
            }, 3000);
        } else {
            alert("Error: " + result.message);
        }
    } catch (err) {
        console.error("Request Error:", err);
        alert("Something went wrong while saving booking.");
    }
});

// ================= INITIALIZE WHEN PAGE LOADS =================
document.addEventListener("DOMContentLoaded", function () {
    initializeTimeSlots();

    document.getElementById("bookingModal").addEventListener("click", function (e) {
        if (e.target === this) closeBookingModal();
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeBookingModal();
    });
});

// ================= RE-INITIALIZE WHEN MODAL OPENS =================
const oldOpenModal = openBookingModal;
openBookingModal = function () {
    oldOpenModal();
    setTimeout(initializeTimeSlots, 100);
};
