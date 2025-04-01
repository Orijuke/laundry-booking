// storage.js - исправленная версия
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";

class StorageService {
  constructor() {
    const firebaseConfig = {
      databaseURL: "https://laundry-booking-sedova-91k6-default-rtdb.europe-west1.firebasedatabase.app/"
    };
    
    this.app = initializeApp(firebaseConfig);
    this.db = getDatabase(this.app);
    this.currentUser = null;
    this.loadUserFromLocalStorage();
  }

  loadUserFromLocalStorage() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  async saveUser(user) {
    if (!user.id) {
      user.id = this.generateUserId();
    }
    
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    try {
      await set(ref(this.db, `users/${user.id}`), user);
      return true;
    } catch (error) {
      console.error('Ошибка сохранения пользователя:', error);
      return false;
    }
  }

  getUser() {
    return this.currentUser;
  }

  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  async getBookingsForDate(date) {
    try {
      const snapshot = await get(ref(this.db, `bookings/${date}`));
      return snapshot.val() || {};
    } catch (error) {
      console.error('Ошибка загрузки бронирований:', error);
      return {};
    }
  }

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
      console.error('Ошибка сохранения бронирования:', error);
      return false;
    }
  }

  async cancelBooking(date, timeSlot, machine) {
    try {
      await remove(ref(this.db, `bookings/${date}/${timeSlot}/${machine}`));
      return true;
    } catch (error) {
      console.error('Ошибка отмены бронирования:', error);
      return false;
    }
  }
}

const storage = new StorageService();
window.storage = storage;
