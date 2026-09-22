document.addEventListener("click", function (e) {
  if (e.target.classList.contains("copy-icon")) {
    e.stopPropagation();
    copyAddress(e.target);
  }
});

function copyAddress(copyIcon) {
  const addressContainer = copyIcon.closest(".event-adress-container");
  if (!addressContainer) return;

  let addressText = "";

  const addressLink = addressContainer.querySelector(".event-adress-link a");
  if (addressLink) {
    addressText = addressLink.textContent.trim();
  } else {
    const addressSpan = addressContainer.querySelector(".event-adress-link");
    if (addressSpan) {
      addressText = addressSpan.textContent.trim();
    }
  }

  if (!addressText) return;

  navigator.clipboard
    .writeText(addressText)
    .then(() => showCopyNotification())
    .catch((err) => {
      console.error("Ошибка при копировании:", err);
      const textarea = document.createElement("textarea");
      textarea.value = addressText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showCopyNotification();
    });
}

function showCopyNotification() {
  const notification = document.getElementById("copy-notification");
  if (notification) {
    notification.style.display = "block";
    setTimeout(() => {
      notification.style.display = "none";
    }, 2000);
  }
}
