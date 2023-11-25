// document.addEventListener("DOMContentLoaded", function () {
//   // Get all the 'Next' buttons
//   const nextButtons = document.querySelectorAll(".next-button");

//   // Add click event listener to each button
//   nextButtons.forEach(function (button, index) {
//     button.addEventListener("click", function (event) {
//       // Get the current project and hide it
//       const currentProject = event.target.closest(".project");
//       currentProject.classList.add("hidden");

//       // Show the next project if it exists
//       if (index + 1 < nextButtons.length) {
//         const nextProject = document.getElementById(`project-${index + 2}`);
//         if (nextProject) {
//           nextProject.classList.remove("hidden");
//         }
//       }
//     });
//   });
// });
