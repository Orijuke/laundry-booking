class StorageManager {
    constructor() {
        this.usersKey = 'laundryUsers';
        this.bookingsKey = 'laundryBookings';
        this.currentUserKey = 'currentLaundryUser';
    }

    // Работа с пользователями
    getUsers() {
        return JSON.parse(localStorage.getItem(this.usersKey)) || {};
    }

    saveUser(user) {
        const users = this.getUsers();
        users[user.id] = user;
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem(this.currentUserKey));
    }

    setCurrentUser(user) {
        localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    }

    // Работа с бронированиями
    getBookings() {
        return JSON.parse(localStorage.getItem(this.bookingsKey)) || {};
    }

    saveBooking(date, timeSlot, machine, user) {
        const bookings = this.getBookings();
        
        if (!bookings[date]) {
            bookings[date] = {};
        }
        
        if (!bookings[date][timeSlot]) {
            bookings[date][timeSlot] = {};
        }
        
        bookings[date][timeSlot][machine] = {
            userId: user.id,
            userName: user.name,
            room: user.room,
            color: user.color
        };
        
        localStorage.setItem(this.bookingsKey, JSON.stringify(bookings));
    }

    cancelBooking(date, timeSlot, machine) {
        const bookings = this.getBookings();
        
        if (bookings[date] && bookings[date][timeSlot] && bookings[date][timeSlot][machine]) {
            delete bookings[date][timeSlot][machine];
            localStorage.setItem(this.bookingsKey, JSON.stringify(bookings));
        }
    }

    // Генерация ID
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
}
