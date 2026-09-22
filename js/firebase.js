const firebaseConfig = {
  apiKey: "AIzaSyB80f5g7oANki4mhGSTtf9BQ_q_FBVoyt0",
  authDomain: "sssueta-club.firebaseapp.com",
  projectId: "sssueta-club",
  storageBucket: "sssueta-club.firebasestorage.app",
  messagingSenderId: "243713908879",
  appId: "1:243713908879:web:36f19a718c7ee7584110fa",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function formatBalance(balance) {
  return balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatCode(code) {
  return code.slice(0, 4) + "-" + code.slice(4, 8);
}

async function generateUniqueCode(db) {
  const usersRef = db.collection("users");
  let code;
  let exists = true;

  while (exists) {
    code = Math.floor(10000000 + Math.random() * 90000000).toString();
    const querySnapshot = await usersRef.where("code", "==", code).get();
    exists = !querySnapshot.empty;
  }

  return code;
}

function initUser() {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;

  if (!user || !user.id) {
    document.getElementById("user-name").textContent = "Гость";
    document.getElementById("user-code").textContent = "XXXX-XXXX";
    document.querySelector(".balance-value").textContent = "0 С";
    return;
  }

  const userId = user.id.toString();
  const name = `${user.first_name} ${user.last_name || ""}`.trim();
  const photoUrl = user.photo_url || "./img/avatar.png";

  document.getElementById("user-name").textContent = name;
  document.getElementById("user-photo").src = photoUrl;

  const userRef = db.collection("users").doc(userId);

  userRef.onSnapshot(async (userSnap) => {
    if (userSnap.exists) {
      const data = userSnap.data();
      const balance = data.balance ?? 0;

      document.querySelector(".balance-value").textContent = `${formatBalance(balance)} С`;
      document.getElementById("user-code").textContent = formatCode(data.code || "00000000");
    } else {
      const code = await generateUniqueCode(db);
      await userRef.set({ name, photoUrl, code, balance: 0, tickets: [] });
    }
  });
}

async function loadEvents() {
  const eventContainer = document.querySelector(".event-container");

  if (!window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    db.collection("events").onSnapshot((snapshot) => {
      if (snapshot.empty) {
        return;
      }

      eventContainer.innerHTML = "";
      snapshot.forEach((doc) => {
        const event = doc.data();
        const eventId = doc.id;
        eventContainer.innerHTML += createEventHTML(event, eventId, false);
      });
    });
    return;
  }

  const userId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
  const userRef = db.collection("users").doc(userId);

  try {
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    const tickets = userData?.tickets || [];

    db.collection("events").onSnapshot((snapshot) => {
      if (snapshot.empty) {
        return;
      }

      eventContainer.innerHTML = "";
      snapshot.forEach((doc) => {
        const event = doc.data();
        const eventId = doc.id;
        const isPurchased = tickets.some(
          (ticket) => ticket.eventId === eventId
        );
        eventContainer.innerHTML += createEventHTML(
          event,
          eventId,
          isPurchased
        );
      });

      addBuyButtonListeners();
    });
  } catch (error) {
    console.error("Error loading events:", error);
  }
}

function createEventHTML(event, eventId, isPurchased) {
  const buttonText = isPurchased ? "Куплено" : "Купить билет";
  const buttonStyle = isPurchased
    ? "background-color: #777777; padding: 2.3vh 14vh;"
    : "background-color: #5541d9;";
  const buttonDisabled = isPurchased ? "disabled" : "";

  return `
    <div class="event-item" data-event-id="${eventId}">
      <img src="${event.image_url}" alt="" class="event-image">
      <div class="event-info">
        <div class="event-name-container">
          <span class="event-name">${event.name}</span>
          <span class="event-price">${event.price} ₽</span>
        </div>
        <div class="event-date-container">
          <span class="event-date">Дата проведения: ${event.date}</span>
          <div class="event-adress-container">
            <span class="event-adress">
              Адрес:
              <span class="event-adress-link">
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  event.address
                )}" target="_blank">
                  ${event.address}
                </a>
              </span>
            </span>
            <img src="./img/icons/copy.svg" class="copy-icon">
          </div>
        </div>
      </div>
      <div class="buy-button" style="${buttonStyle}" ${buttonDisabled}>${buttonText}</div>
    </div>
  `;
}

initUser();
loadEvents();
