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
    this.selectedSlot = null;
    this.cancelSlot = null;
  }

  initSchedule() {
    // Проверка существования элементов DOM
    if (!document.getElementById('date-picker') || !document.getElementById('current-date')) {
      console.error('Required DOM elements not found');
      return;
    }

    try {
      const datePicker = document.getElementById('date-picker');
      const currentDate = new Date().toISOString().split('T')[0];
      
      datePicker.value = currentDate;
      datePicker.min = currentDate;
      datePicker.addEventListener('change', (e) => {
        this.renderSchedule(e.target.value);
        document.getElementById('current-date').textContent = this.formatDisplayDate(e.target.value);
      });
      
      document.getElementById('current-date').textContent = this.formatDisplayDate(currentDate);
      this.renderSchedule(currentDate);
    } catch (error) {
      console.error('Error initializing schedule:', error);
    }
  }

  renderSchedule(date) {
    const tableBody = document.querySelector('#schedule-table tbody');
    if (!tableBody) {
      console.error('Table body not found');
      return;
    }

    try {
      tableBody.innerHTML = '';
      
      const bookings = this.storage.getBookingsForDate(date) || {};
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
          const booking = bookings[timeSlot]?.[machine];
          
          if (booking) {
            cell.textContent = `${booking.userName} | ${booking.room}`;
            cell.style.backgroundColor = booking.color || '#f0f0f0';
            cell.classList.add('booked');
            
            if (currentUser && booking.userId === currentUser.id) {
              cell.classList.add('my-booking');
              cell.addEventListener('click', () => this.handleCancelBooking(date, timeSlot, machine));
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
    } catch (error) {
      console.error('Error rendering schedule:', error);
    }
  }

  handleSlotClick(timeSlot, machine) {
    try {
      const currentUser = this.storage.getUser();
      if (!currentUser) {
        if (confirm('Для бронирования нужно создать профиль. Перейти к настройкам?')) {
          window.location.href = 'profile.html';
        }
        return;
      }

      const modalTime = document.getElementById('modal-time');
      const modalMachine = document.getElementById('modal-machine');
      const bookingModal = document.getElementById('booking-modal');
      
      if (!modalTime || !modalMachine || !bookingModal) {
        console.error('Modal elements not found');
        return;
      }

      modalTime.textContent = timeSlot;
      modalMachine.textContent = machine === 'У стены' ? 'у стены' : 'у двери';
      bookingModal.classList.remove('hidden');
      
      this.selectedSlot = { timeSlot, machine };
    } catch (error) {
      console.error('Error handling slot click:', error);
    }
  }

  handleConfirmBooking(date) {
    if (!this.selectedSlot) return;
    
    try {
      const currentUser = this.storage.getUser();
      if (!currentUser) return;
      
      const { timeSlot, machine } = this.selectedSlot;
      this.storage.saveBooking(date, timeSlot, machine, currentUser);
      
      document.getElementById('booking-modal').classList.add('hidden');
      this.renderSchedule(date);
      this.selectedSlot = null;
    } catch (error) {
      console.error('Error confirming booking:', error);
    }
  }

  handleCancelBooking(date, timeSlot, machine) {
    try {
      const cancelModalTime = document.getElementById('cancel-modal-time');
      const cancelModalMachine = document.getElementById('cancel-modal-machine');
      const cancelModal = document.getElementById('cancel-modal');
      
      if (!cancelModalTime || !cancelModalMachine || !cancelModal) {
        console.error('Cancel modal elements not found');
        return;
      }

      cancelModalTime.textContent = timeSlot;
      cancelModalMachine.textContent = machine === 'У стены' ? 'у стены' : 'у двери';
      cancelModal.classList.remove('hidden');
      
      this.cancelSlot = { date, timeSlot, machine };
    } catch (error) {
      console.error('Error handling cancel booking:', error);
    }
  }

  handleConfirmCancel() {
    if (!this.cancelSlot) return;
    
    try {
      const { date, timeSlot, machine } = this.cancelSlot;
      if (this.storage.cancelBooking(date, timeSlot, machine)) {
        this.renderSchedule(date);
      }
      
      document.getElementById('cancel-modal').classList.add('hidden');
      this.cancelSlot = null;
    } catch (error) {
      console.error('Error confirming cancel:', error);
    }
  }

  formatDisplayDate(dateStr) {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      const options = { day: 'numeric', month: 'long', weekday: 'long' };
      return date.toLocaleDateString('ru-RU', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr;
    }
  }
}

// Проверяем, что storage существует перед созданием экземпляра
if (typeof storage !== 'undefined') {
  const schedule = new ScheduleService();
  
  // Делаем schedule глобально доступной после полной загрузки
  document.addEventListener('DOMContentLoaded', () => {
    window.schedule = schedule;
    schedule.initSchedule();
  });
} else {
  console.error('Storage service is not available');
}
