
     // script3.js

document.addEventListener("DOMContentLoaded", function () {
  // Get the PDF button element
  var pdfButton = document.getElementById("pdf");

  // Add event listener to the button
  pdfButton.addEventListener("click", function () {
      // Toggle the 'animate' class to start or stop the animation
      pdfButton.classList.toggle("animate");
  });
});
