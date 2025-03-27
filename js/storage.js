import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";

const firebaseConfig = {
  databaseURL: "https://laundry-booking-sedova-91k6-default-rtdb.europe-west1.firebasedatabase.app"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Тестовый запрос (уберите после проверки)
set(ref(db, 'testConnection'), {
  message: "Firebase подключен!",
  timestamp: Date.now()
})
.then(() => console.log("Тестовая запись отправлена"))
.catch((error) => console.error("Ошибка подключения:", error));

class StorageService {
  constructor() {
    this.db = db;
  }

  async saveUser(user) {
    await set(ref(this.db, `users/${user.id}`), user);
  }

  async getBookingsForDate(date) {
    const snapshot = await get(ref(this.db, `bookings/${date}`));
    return snapshot.val() || {};
  }

  async saveBooking(date, timeSlot, machine, user) {
    await set(ref(this.db, `bookings/${date}/${timeSlot}/${machine}`), {
      userId: user.id,
      userName: user.name,
      room: user.room,
      color: user.color,
      timestamp: Date.now()
    });
  }

  async cancelBooking(date, timeSlot, machine) {
    await remove(ref(this.db, `bookings/${date}/${timeSlot}/${machine}`));
  }
}

const storage = new StorageService();
