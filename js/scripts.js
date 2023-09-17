document.addEventListener("DOMContentLoaded", function() {
  const photo = document.getElementById("clickable-photo");

  if (photo) {
    photo.addEventListener("click", toggleClickEffect);
  }
});

function toggleClickEffect() {
  const photo = document.getElementById("clickable-photo");
  photo.classList.toggle("clicked");
}

