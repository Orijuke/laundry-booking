import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getDatabase, ref, set, get, remove, onValue } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";

const firebaseConfig = {
  databaseURL: "https://laundry-booking-sedova-91k6-default-rtdb.europe-west1.firebasedatabase.app"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

class StorageService {
  constructor() {
    this.USER_KEY = 'laundryUserLocal'; // Для хранения текущего пользователя локально
    this.db = db;
  }

  // Генерация читаемого ID
  generateReadableId() {
    const randomPart = Math.random().toString(36).substr(2, 6);
    return `user-${randomPart}`;
  }

  // Сохраняем пользователя (локально и в Firebase)
  async saveUser(userData) {
    let user = this.getUser();
    
    if (!user || !user.id) {
      user = { ...userData, id: this.generateReadableId() };
    } else {
      user = { ...user, ...userData };
    }
    
    // Сохраняем локально
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    // Сохраняем в Firebase
    try {
      await set(ref(this.db, `users/${user.id}`), user);
    } catch (error) {
      console.error("Ошибка сохранения пользователя в Firebase:", error);
    }
    
    return user;
  }

  // Получаем текущего пользователя (только из локального хранилища)
  getUser() {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  // Обновляем все брони пользователя при изменении профиля
  async updateUserBookings(userId, updates) {
    try {
      const snapshot = await get(ref(this.db, 'bookings'));
      const allBookings = snapshot.val() || {};
      let changed = false;

      for (const date in allBookings) {
        for (const timeSlot in allBookings[date]) {
          for (const machine in allBookings[date][timeSlot]) {
            if (allBookings[date][timeSlot][machine]?.userId === userId) {
              await set(ref(this.db, `bookings/${date}/${timeSlot}/${machine}`), {
                ...allBookings[date][timeSlot][machine],
                ...updates
              });
              changed = true;
            }
          }
        }
      }

      return changed;
    } catch (error) {
      console.error("Ошибка обновления броней пользователя:", error);
      return false;
    }
  }

  // Получаем все бронирования
  async getBookings() {
    try {
      const snapshot = await get(ref(this.db, 'bookings'));
      return snapshot.val() || {};
    } catch (error) {
      console.error("Ошибка получения бронирований:", error);
      return {};
    }
  }

  // Получаем бронирования для конкретной даты
  async getBookingsForDate(date) {
    try {
      const snapshot = await get(ref(this.db, `bookings/${date}`));
      return snapshot.val() || {};
    } catch (error) {
      console.error(`Ошибка получения бронирований на дату ${date}:`, error);
      return {};
    }
  }

  // Сохраняем бронирование
  async saveBooking(date, timeSlot, machine, user) {
    try {
      await set(ref(this.db, `bookings/${date}/${timeSlot}/${machine}`), {
        userId: user.id,
        userName: user.name,
        room: user.room,
        color: user.color,
        timestamp: Date.now()
      });
      return true;
    } catch (error) {
      console.error("Ошибка сохранения бронирования:", error);
      return false;
    }
  }

  // Отменяем бронирование
  async cancelBooking(date, timeSlot, machine) {
    try {
      await remove(ref(this.db, `bookings/${date}/${timeSlot}/${machine}`));
      return true;
    } catch (error) {
      console.error("Ошибка отмены бронирования:", error);
      return false;
    }
  }

  // Реализация для совместимости (если где-то используется)
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

const storage = new StorageService();

// Экспорт для использования в других модулях
export { storage };
