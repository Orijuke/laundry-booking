import { BookingManager, ProfileManager } from './storage.js';

/**
 * Модуль для работы с календарем бронирований
 */
export const Calendar = {
  // Конфигурация
  config: {
    timeSlots: [
      '8:00 - 8:30', '8:45 - 9:15', '9:30 - 10:00', '10:15 - 10:45',
      '11:00 - 11:30', '11:45 - 12:15', '12:30 - 13:00', '13:15 - 13:45',
      '14:00 - 14:30', '14:45 - 15:15', '15:30 - 16:00', '16:15 - 16:45',
      '17:00 - 17:30', '17:45 - 18:15', '18:30 - 19:00', '19:15 - 19:45',
      '20:00 - 20:30', '20:45 - 21:15', '21:30 - 22:00', '22:15 - 23:00'
    ],
    machines: ['У стены', 'У двери']
  },

  // Состояние
  state: {
    currentDate: new Date().toISOString().split('T')[0] // YYYY-MM-DD
  },

  /**
   * Инициализация календаря
   */
  init() {
    this._renderDatePicker();
    this._renderSchedule();
    this._setupEventListeners();
  },

  /**
   * Обновить текущую дату
   * @param {string} date - Дата в формате YYYY-MM-DD
   */
  setDate(date) {
    if (!this._validateDate(date)) return;
    
    this.state.currentDate = date;
    this._renderSchedule();
    this._updateDateDisplay();
  },

  // ==============================================
  // ПРИВАТНЫЕ МЕТОДЫ
  // ==============================================

  /**
   * Рендер расписания
   */
  _renderSchedule() {
    const tableBody = document.querySelector('#schedule-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    const bookings = BookingManager.getBookingsByDate(this.state.currentDate);
    const currentUser = ProfileManager.getCurrentProfile();

    this.config.timeSlots.forEach(timeSlot => {
      const row = document.createElement('tr');
      
      // Колонка времени
      const timeCell = document.createElement('td');
      timeCell.textContent = timeSlot;
      row.appendChild(timeCell);

      // Колонки для машин
      this.config.machines.forEach(machine => {
        const cell = document.createElement('td');
        const booking = bookings.find(b => 
          b.time === timeSlot.split(' - ')[0] && 
          b.machine === machine
        );

        this._setupCell(cell, timeSlot, machine, booking, currentUser);
        row.appendChild(cell);
      });

      tableBody.appendChild(row);
    });
  },

  /**
   * Настройка ячейки расписания
   */
  _setupCell(cell, timeSlot, machine, booking, currentUser) {
    const [startTime] = timeSlot.split(' - ');
    const isCurrentUserBooking = booking?.userId === currentUser?.id;

    // Базовые классы
    cell.classList.add('schedule-cell');
    if (booking) cell.classList.add('booked');
    if (!booking) cell.classList.add('available');

    // Обработчик клика
    cell.addEventListener('click', () => {
      this._handleCellClick(cell, startTime, machine, booking, currentUser);
    });

    // Отображение содержимого
    if (booking) {
      const userProfile = this._getUserProfile(booking.userId);
      cell.innerHTML = this._getBookingContent(userProfile, isCurrentUserBooking);
    } else {
      cell.textContent = 'Свободно';
    }
  },

  /**
   * Обработка клика по ячейке
   */
  _handleCellClick(cell, time, machine, booking, currentUser) {
    // Если нет профиля - перенаправляем
    if (!currentUser) {
      if (confirm('Для бронирования необходимо создать профиль. Перейти?')) {
        window.location.href = 'profile.html';
      }
      return;
    }

    // Если это наша бронь - отменяем
    if (booking?.userId === currentUser.id) {
      if (confirm('Отменить бронирование?')) {
        BookingManager.removeBooking(booking.id);
        this._renderSchedule();
      }
      return;
    }

    // Если ячейка занята другим пользователем
    if (booking) {
      const userProfile = this._getUserProfile(booking.userId);
      alert(`Занято: ${userProfile.name} (к.${userProfile.room})`);
      return;
    }

    // Бронирование свободной ячейки
    if (confirm(`Забронировать ${time} (${machine})?`)) {
      const bookingData = {
        date: this.state.currentDate,
        time,
        machine,
        userId: currentUser.id
      };

      if (BookingManager.addBooking(bookingData)) {
        this._renderSchedule();
      } else {
        alert('Не удалось забронировать. Попробуйте другое время.');
      }
    }
  },

  /**
   * Рендер date picker
   */
  _renderDatePicker() {
    const datePicker = document.getElementById('date-picker');
    if (!datePicker) return;

    // Установка минимальной (сегодня) и максимальной (3 месяца вперед) дат
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 3);

    datePicker.min = today.toISOString().split('T')[0];
    datePicker.max = maxDate.toISOString().split('T')[0];
    datePicker.value = this.state.currentDate;
  },

  /**
   * Обновление отображения даты
   */
  _updateDateDisplay() {
    const dateElement = document.getElementById('current-date');
    if (!dateElement) return;

    const date = new Date(this.state.currentDate);
    const options = { 
      day: 'numeric', 
      month: 'long', 
      weekday: 'long',
      year: 'numeric'
    };

    dateElement.textContent = date.toLocaleDateString('ru-RU', options);
  },

  /**
   * Настройка обработчиков событий
   */
  _setupEventListeners() {
    // Изменение даты
    document.getElementById('date-picker')?.addEventListener('change', (e) => {
      this.setDate(e.target.value);
    });

    // Кнопки навигации по датам
    document.getElementById('prev-day')?.addEventListener('click', () => {
      this._navigateDays(-1);
    });

    document.getElementById('next-day')?.addEventListener('click', () => {
      this._navigateDays(1);
    });
  },

  /**
   * Навигация по дням
   */
  _navigateDays(days) {
    const date = new Date(this.state.currentDate);
    date.setDate(date.getDate() + days);
    
    const newDate = date.toISOString().split('T')[0];
    this.setDate(newDate);
    document.getElementById('date-picker').value = newDate;
  },

  /**
   * Получить профиль пользователя
   */
  _getUserProfile(userId) {
    // В реальном приложении здесь может быть запрос к API
    return ProfileManager.getCurrentProfile(); // Упрощенно
  },

  /**
   * Генерация HTML для занятой ячейки
   */
  _getBookingContent(profile, isCurrentUser) {
    return `
      <div class="booking-user" style="color: ${profile.color}">
        ${profile.name} (к.${profile.room})
      </div>
      ${isCurrentUser ? '<div class="booking-hint">[Клик для отмены]</div>' : ''}
    `;
  },

  /**
   * Валидация даты
   */
  _validateDate(date) {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
  }
};
