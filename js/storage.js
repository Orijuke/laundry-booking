import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";

const firebaseConfig = {
  databaseURL: "https://laundry-booking-sedova-91k6-default-rtdb.europe-west1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

class StorageService {
  // Сохранение пользователя
  async saveUser(user) {
    await set(ref(db, `users/${user.id}`), user);
  }

  // Получение бронирований на дату
  async getBookingsForDate(date) {
    const snapshot = await get(ref(db, `bookings/${date}`));
    return snapshot.val() || {};
  }

  // Создание брони
  async saveBooking(date, timeSlot, machine, user) {
    await set(ref(db, `bookings/${date}/${timeSlot}/${machine}`), {
      userId: user.id,
      userName: user.name,
      room: user.room,
      color: user.color,
      timestamp: Date.now()
    });
  }

  // Отмена брони
  async cancelBooking(date, timeSlot, machine) {
    await remove(ref(db, `bookings/${date}/${timeSlot}/${machine}`));
  }
}

const storage = new StorageService();
