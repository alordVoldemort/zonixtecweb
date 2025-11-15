const aboutToggle = document.querySelector(".about-toggle");
const aboutDropdown = document.querySelector(".about-dropdown");
const aboutClose = document.querySelector(".about-close");

aboutToggle.addEventListener("click", (e) => {
  e.preventDefault();
  aboutDropdown.classList.toggle("active");
});

// Close button
aboutClose.addEventListener("click", () => {
  aboutDropdown.classList.remove("active");
});

// Close on outside click
document.addEventListener("click", (e) => {
  if (!aboutDropdown.contains(e.target) && !aboutToggle.contains(e.target)) {
    aboutDropdown.classList.remove("active");
  }
});
