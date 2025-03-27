class StorageService {
  constructor() {
    this.USER_KEY = 'laundryUser';
    this.BOOKINGS_KEY = 'laundryBookings';
  }

  // Генерация читаемого ID (пример: "user-5a3b2c")
  generateReadableId() {
    const randomPart = Math.random().toString(36).substr(2, 6);
    return `user-${randomPart}`;
  }

  // Сохраняем пользователя с проверкой на существующий ID
  saveUser(userData) {
    let user = this.getUser();
    if (!user || !user.id) {
      user = { ...userData, id: this.generateReadableId() };
    } else {
      user = { ...user, ...userData };
    }
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    return user;
  }

  // Получаем текущего пользователя
  getUser() {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  // Обновляем все брони пользователя при изменении профиля
  updateUserBookings(userId, updates) {
    const allBookings = this.getBookings();
    let changed = false;

    for (const date in allBookings) {
      for (const time in allBookings[date]) {
        for (const machine in allBookings[date][time]) {
          if (allBookings[date][time][machine].userId === userId) {
            allBookings[date][time][machine] = { 
              ...allBookings[date][time][machine], 
              ...updates 
            };
            changed = true;
          }
        }
      }
    }

    if (changed) {
      localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(allBookings));
    }
  }

  getBookings() {
    const bookingsData = localStorage.getItem(this.BOOKINGS_KEY);
    return bookingsData ? JSON.parse(bookingsData) : {};
  }

  getBookingsForDate(date) {
    const allBookings = this.getBookings();
    return allBookings[date] || {};
  }

  saveBooking(date, timeSlot, machine, user) {
    const allBookings = this.getBookings();
    
    if (!allBookings[date]) {
      allBookings[date] = {};
    }
    
    if (!allBookings[date][timeSlot]) {
      allBookings[date][timeSlot] = {};
    }
    
    allBookings[date][timeSlot][machine] = {
      userId: user.id,
      userName: user.name,
      room: user.room,
      color: user.color
    };
    
    localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(allBookings));
  }

  cancelBooking(date, timeSlot, machine) {
    const allBookings = this.getBookings();
    
    if (allBookings[date] && allBookings[date][timeSlot] && allBookings[date][timeSlot][machine]) {
      delete allBookings[date][timeSlot][machine];
      localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(allBookings));
      return true;
    }
    return false;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

const storage = new StorageService();
