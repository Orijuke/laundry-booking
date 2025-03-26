class ScheduleManager {
    constructor() {
        this.timeSlots = [
            '8:00 – 8:30', '8:45 – 9:15', '9:30 – 10:00', '10:15 – 10:45', 
            '11:00 – 11:30', '11:45 – 12:15', '12:30 – 13:00', '13:15 – 13:45', 
            '14:00 – 14:30', '14:45 – 15:15', '15:30 – 16:00', '16:15 – 16:45', 
            '17:00 – 17:30', '17:45 – 18:15', '18:30 – 19:00', '19:15 – 19:45', 
            '20:00 – 20:30', '20:45 – 21:15', '21:30 – 22:00', '22:15 – 23:00'
        ];
        this.machines = ['wall', 'door'];
    }

    renderSchedule(date) {
        const storage = new StorageManager();
        const currentUser = storage.getCurrentUser();
        const bookings = storage.getBookings()[date] || {};
        const tbody = document.querySelector('#scheduleTable tbody');
        
        tbody.innerHTML = '';
        
        this.timeSlots.forEach(timeSlot => {
            const row = document.createElement('tr');
            
            // Колонка времени
            const timeCell = document.createElement('td');
            timeCell.textContent = timeSlot;
            row.appendChild(timeCell);
            
            // Колонки для машин
            this.machines.forEach(machine => {
                const cell = document.createElement('td');
                const booking = bookings[timeSlot] && bookings[timeSlot][machine];
                
                if (booking) {
                    cell.textContent = `${booking.userName} (к.${booking.room})`;
                    cell.style.backgroundColor = booking.color;
                    
                    // Если это бронь текущего пользователя, добавляем возможность отмены
                    if (currentUser && booking.userId === currentUser.id) {
                        cell.classList.add('user-booking');
                        cell.addEventListener('click', () => this.cancelBooking(date, timeSlot, machine));
                    }
                } else {
                    cell.classList.add('available');
                    cell.addEventListener('click', () => this.showBookingModal(date, timeSlot, machine));
                }
                
                row.appendChild(cell);
            });
            
            tbody.appendChild(row);
        });
    }

    showBookingModal(date, timeSlot, machine) {
        const modal = document.getElementById('bookingModal');
        const modalTime = document.getElementById('modalTime');
        const confirmBtn = document.getElementById('confirmBooking');
        
        modalTime.textContent = `${timeSlot} (${machine === 'wall' ? 'У стены' : 'У двери'})`;
        
        confirmBtn.onclick = () => {
            this.bookTimeSlot(date, timeSlot, machine);
            modal.style.display = 'none';
        };
        
        modal.style.display = 'block';
        
        // Закрытие модального окна
        document.querySelector('.close').onclick = () => {
            modal.style.display = 'none';
        };
        
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    bookTimeSlot(date, timeSlot, machine) {
        const storage = new StorageManager();
        const user = storage.getCurrentUser();
        
        if (!user) {
            window.location.href = 'profile.html';
            return;
        }
        
        storage.saveBooking(date, timeSlot, machine, user);
        this.renderSchedule(date);
    }

    cancelBooking(date, timeSlot, machine) {
        if (confirm('Вы действительно хотите отменить бронирование?')) {
            const storage = new StorageManager();
            storage.cancelBooking(date, timeSlot, machine);
            this.renderSchedule(date);
        }
    }
}
