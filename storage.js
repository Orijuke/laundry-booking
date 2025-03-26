/**
 * Модуль для работы с локальным хранилищем
 * Экспортирует два основных класса:
 * 1. BookingManager - управление бронированиями
 * 2. ProfileManager - управление профилями
 */

// ==============================================
// КЛАСС ДЛЯ РАБОТЫ С БРОНИРОВАНИЯМИ
// ==============================================
export class BookingManager {
  static STORAGE_KEY = 'laundryBookings';

  /**
   * Получить все бронирования
   * @returns {Array}
   */
  static getAllBookings() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    } catch (error) {
      console.error('Ошибка чтения бронирований:', error);
      return [];
    }
  }

  /**
   * Получить бронирования на конкретную дату
   * @param {string} date - Дата в формате YYYY-MM-DD
   * @returns {Array}
   */
  static getBookingsByDate(date) {
    if (!this._validateDate(date)) return [];
    
    const allBookings = this.getAllBookings();
    return allBookings.filter(booking => booking.date === date);
  }

  /**
   * Добавить новое бронирование
   * @param {Object} bookingData 
   * @returns {boolean} Успешность операции
   */
  static addBooking(bookingData) {
    if (!this._validateBooking(bookingData)) return false;

    try {
      const bookings = this.getAllBookings();
      const isSlotAvailable = !bookings.some(b => 
        b.date === bookingData.date && 
        b.time === bookingData.time && 
        b.machine === bookingData.machine
      );

      if (!isSlotAvailable) return false;

      bookings.push(bookingData);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));
      return true;
    } catch (error) {
      console.error('Ошибка добавления брони:', error);
      return false;
    }
  }

  /**
   * Удалить бронирование
   * @param {string} bookingId - ID бронирования
   * @returns {boolean}
   */
  static removeBooking(bookingId) {
    try {
      const bookings = this.getAllBookings();
      const updatedBookings = bookings.filter(b => b.id !== bookingId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedBookings));
      return true;
    } catch (error) {
      console.error('Ошибка удаления брони:', error);
      return false;
    }
  }

  // Валидация данных бронирования
  static _validateBooking(booking) {
    return (
      booking &&
      this._validateDate(booking.date) &&
      this._validateTime(booking.time) &&
      ['У стены', 'У двери'].includes(booking.machine) &&
      typeof booking.userId === 'string'
    );
  }

  static _validateDate(date) {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  }

  static _validateTime(time) {
    return /^\d{2}:\d{2}$/.test(time);
  }
}

// ==============================================
// КЛАСС ДЛЯ РАБОТЫ С ПРОФИЛЯМИ
// ==============================================
export class ProfileManager {
  static STORAGE_KEY = 'laundryProfiles';

  /**
   * Получить текущий профиль
   * @returns {Object|null}
   */
  static getCurrentProfile() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
    } catch (error) {
      console.error('Ошибка чтения профиля:', error);
      return null;
    }
  }

  /**
   * Сохранить профиль
   * @param {Object} profileData 
   * @returns {boolean}
   */
  static saveProfile(profileData) {
    if (!this._validateProfile(profileData)) return false;

    try {
      const profile = {
        id: this._generateId(),
        name: profileData.name.trim(),
        room: parseInt(profileData.room),
        color: profileData.color,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error('Ошибка сохранения профиля:', error);
      return false;
    }
  }

  /**
   * Удалить профиль
   * @returns {boolean}
   */
  static removeProfile() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Ошибка удаления профиля:', error);
      return false;
    }
  }

  // Валидация данных профиля
  static _validateProfile(profile) {
    return (
      profile &&
      typeof profile.name === 'string' &&
      profile.name.trim().length >= 2 &&
      !isNaN(parseInt(profile.room)) &&
      parseInt(profile.room) >= 1 &&
      parseInt(profile.room) <= 12 &&
      /^#[0-9A-F]{6}$/i.test(profile.color)
    );
  }

  // Генератор ID
  static _generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

// ==============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==============================================
export const StorageHelper = {
  /**
   * Очистить все данные приложения
   */
  clearAll() {
    try {
      localStorage.removeItem(BookingManager.STORAGE_KEY);
      localStorage.removeItem(ProfileManager.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Ошибка очистки хранилища:', error);
      return false;
    }
  },

  /**
   * Экспорт всех данных
   */
  exportData() {
    return {
      bookings: BookingManager.getAllBookings(),
      profile: ProfileManager.getCurrentProfile()
    };
  },

  /**
   * Импорт данных
   */
  importData(data) {
    if (!data) return false;
    
    try {
      if (data.bookings) {
        localStorage.setItem(BookingManager.STORAGE_KEY, JSON.stringify(data.bookings));
      }
      if (data.profile) {
        localStorage.setItem(ProfileManager.STORAGE_KEY, JSON.stringify(data.profile));
      }
      return true;
    } catch (error) {
      console.error('Ошибка импорта данных:', error);
      return false;
    }
  }
};
