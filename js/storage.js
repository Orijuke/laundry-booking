// storage.js - полная реализация с исправлениями

// Используем compat-версии для совместимости
import firebase from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/9.6.0/firebase-database-compat.js";

class StorageService {
  constructor() {
    // Инициализация Firebase
    const firebaseConfig = {
      databaseURL: "https://laundry-booking-sedova-91k6-default-rtdb.europe-west1.firebasedatabase.app"
    };
    
    this.app = firebase.initializeApp(firebaseConfig);
    this.db = firebase.database();
    this.currentUser = null;
    this.loadUserFromLocalStorage();
  }

  // Загрузка пользователя из localStorage
  loadUserFromLocalStorage() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  // Сохранение пользователя
  async saveUser(user) {
    if (!user.id) {
      user.id = this.generateUserId();
    }
    
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    try {
      await firebase.database().ref(`users/${user.id}`).set(user);
      return true;
    } catch (error) {
      console.error('Ошибка сохранения пользователя:', error);
      return false;
    }
  }

  // Получение текущего пользователя
  getUser() {
    return this.currentUser;
  }

  // Генерация ID пользователя
  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  // Получение бронирований на дату
  async getBookingsForDate(date) {
    try {
      const snapshot = await firebase.database().ref(`bookings/${date}`).get();
      return snapshot.val() || {};
    } catch (error) {
      console.error('Ошибка загрузки бронирований:', error);
      return {};
    }
  }

  // Сохранение бронирования
  async saveBooking(date, timeSlot, machine, user) {
    try {
      await firebase.database().ref(`bookings/${date}/${timeSlot}/${machine}`).set({
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

  // Отмена бронирования
  async cancelBooking(date, timeSlot, machine) {
    try {
      await firebase.database().ref(`bookings/${date}/${timeSlot}/${machine}`).remove();
      return true;
    } catch (error) {
      console.error('Ошибка отмены бронирования:', error);
      return false;
    }
  }
}

// Создаем экземпляр хранилища и делаем его глобально доступным
const storage = new StorageService();
window.storage = storage;
