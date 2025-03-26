class StorageService {
  constructor() {
    this.USER_KEY = 'laundryUser';
    this.BOOKINGS_KEY = 'laundryBookings';
  }

  getUser() {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  saveUser(user) {
    if (!user.id) {
      user.id = this.generateId();
    }
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    return user;
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
