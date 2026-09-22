function formatDate(date) {
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

const userNameEl = document.getElementById("user-name");
const userPhotoEl = document.getElementById("user-photo");
const regDateEl = document.getElementById("reg-date");

const savedDate = localStorage.getItem("firstVisitDate");
if (!savedDate) {
  const now = new Date();
  localStorage.setItem("firstVisitDate", now.toISOString());
  regDateEl.textContent = "Дата регистрации: " + formatDate(now);
} else {
  regDateEl.textContent =
    "Дата регистрации: " + formatDate(new Date(savedDate));
}

try {
  const tg = window.Telegram.WebApp;
  tg.expand();

  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    const user = tg.initDataUnsafe.user;

    let fullName = user.first_name || "";
    if (user.last_name) {
      fullName += " " + user.last_name;
    }

    if (fullName.trim() !== "") {
      userNameEl.textContent = fullName;
    }

    if (user.photo_url) {
      userPhotoEl.src = user.photo_url;
    }
  }
} catch (e) {
  console.warn("Не удалось получить данные из Telegram:", e);
}
