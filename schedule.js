class ScheduleService {
  constructor() {
    this.timeSlots = [
      '8:00 – 8:30', '8:45 – 9:15', '9:30 – 10:00', '10:15 – 10:45',
      '11:00 – 11:30', '11:45 – 12:15', '12:30 – 13:00', '13:15 – 13:45',
      '14:00 – 14:30', '14:45 – 15:15', '15:30 – 16:00', '16:15 – 16:45',
      '17:00 – 17:30', '17:45 – 18:15', '18:30 – 19:00', '19:15 – 19:45',
      '20:00 – 20:30', '20:45 – 21:15', '21:30 – 22:00', '22:15 – 23:00'
    ];
    this.machines = ['У стены', 'У двери'];
    this.storage = storage;
  }

  renderSchedule(date, tableBody) {
    tableBody.innerHTML = '';
    
    const bookings = this.storage.getBookingsForDate(date);
    const currentUser = this.storage.getUser();
    
    this.timeSlots.forEach(timeSlot => {
      const row = document.createElement('tr');
      
      // Ячейка времени
      const timeCell = document.createElement('td');
      timeCell.textContent = timeSlot;
      timeCell.classList.add('time-slot');
      row.appendChild(timeCell);
      
      // Ячейки для машин
      this.machines.forEach(machine => {
        const cell = document.createElement('td');
        const booking = bookings[timeSlot] && bookings[timeSlot][machine];
        
        if (booking) {
          cell.textContent = `${booking.userName} (к.${booking.room})`;
          cell.style.backgroundColor = booking.color;
          cell.classList.add('booked');
          
          if (currentUser && booking.userId === currentUser.id) {
            cell.classList.add('my-booking');
            cell.addEventListener('click', () => this.handleCancelBooking(date, timeSlot, machine, tableBody));
          }
        } else {
          cell.textContent = 'Свободно';
          cell.classList.add('available', 'machine-slot');
          cell.addEventListener('click', () => this.handleSlotClick(timeSlot, machine));
        }
        
        row.appendChild(cell);
      });
      
      tableBody.appendChild(row);
    });
  }

  handleSlotClick(timeSlot, machine) {
    const currentUser = this.storage.getUser();
    if (!currentUser) {
      if (confirm('Для бронирования нужно создать профиль. Перейти к настройкам?')) {
        window.location.href = 'profile.html';
      }
      return;
    }
    
    document.getElementById('modal-time').textContent = timeSlot;
    document.getElementById('modal-machine').textContent = machine;
    document.getElementById('booking-modal').classList.add('visible');
    
    this.selectedSlot = { timeSlot, machine };
  }

  handleConfirmBooking(date) {
    if (!this.selectedSlot) return;
    
    const currentUser = this.storage.getUser();
    if (!currentUser) return;
    
    const { timeSlot, machine } = this.selectedSlot;
    this.storage.saveBooking(date, timeSlot, machine, currentUser);
    
    document.getElementById('booking-modal').classList.remove('visible');
    this.renderSchedule(date, document.querySelector('#schedule-table tbody'));
    this.selectedSlot = null;
  }

  handleCancelBooking(date, timeSlot, machine, tableBody) {
    if (confirm('Вы действительно хотите отменить бронирование?')) {
      if (this.storage.cancelBooking(date, timeSlot, machine)) {
        this.renderSchedule(date, tableBody);
      }
    }
  }

  formatDisplayDate(date) {
    const options = { day: 'numeric', month: 'long', weekday: 'long' };
    return date.toLocaleDateString('ru-RU', options);
  }
}

const schedule = new ScheduleService();
