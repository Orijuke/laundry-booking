/**
 * Главный модуль приложения
 * Инициализирует все компоненты и управляет их взаимодействием
 */

import { UI } from './ui.js';
import { Calendar } from './calendar.js';
import { Profile } from './profile.js';
import { BookingManager, ProfileManager } from './storage.js';

class LaundryApp {
  constructor() {
    // Инициализация состояния приложения
    this.state = {
      isLoading: false,
      currentView: null
    };

    // Основные элементы интерфейса
    this.elements = {
      mainContent: document.getElementById('main-content'),
      profileSection: document.getElementById('profile-section'),
      bookingSection: document.getElementById('booking-section')
    };

    // Инициализация модулей
    this.initModules();
    this.setupEventListeners();
    this.checkAuthState();
  }

  /**
   * Инициализация всех модулей приложения
   */
  initModules() {
    // Инициализация UI компонентов
    UI.init();

    // Проверяем текущую страницу и инициализируем соответствующие модули
    if (document.getElementById('schedule-table')) {
      this.state.currentView = 'booking';
      Calendar.init();
      this.setupBookingHandlers();
    }

    if (document.getElementById('profile-form')) {
      this.state.currentView = 'profile';
      Profile.init();
    }
  }

  /**
   * Настройка обработчиков событий
   */
  setupEventListeners() {
    // Глобальные обработчики
    document.addEventListener('click', this.handleGlobalClick.bind(this));

    // Навигация
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', this.handleNavigation.bind(this));
    });
  }

  /**
   * Проверка состояния аутентификации
   */
  checkAuthState() {
    const profile = ProfileManager.getCurrentProfile();
    
    if (!profile && this.state.currentView === 'booking') {
      UI.showModal(`
        <p>Для бронирования необходимо создать профиль.</p>
      `, {
        title: 'Требуется профиль',
        buttons: [{
          text: 'Создать профиль',
          action: 'navigate',
          target: 'profile.html',
          class: 'btn-primary'
        }]
      });
    }
  }

  /**
   * Настройка обработчиков для бронирований
   */
  setupBookingHandlers() {
    // Обработчик для кнопки "Мои бронирования"
    document.getElementById('my-bookings-btn')?.addEventListener('click', () => {
      this.showUserBookings();
    });

    // Обработчик для кнопки "Все бронирования"
    document.getElementById('all-bookings-btn')?.addEventListener('click', () => {
      Calendar.init(); // Перезагружаем полное расписание
    });
  }

  /**
   * Показать бронирования текущего пользователя
   */
  showUserBookings() {
    const profile = ProfileManager.getCurrentProfile();
    if (!profile) return;

    const bookings = BookingManager.getUserBookings(profile.id);
    this.renderBookingsList(bookings);
  }

  /**
   * Рендер списка бронирований
   */
  renderBookingsList(bookings) {
    if (bookings.length === 0) {
      this.elements.bookingSection.innerHTML = `
        <div class="empty-state">
          <p>У вас нет активных бронирований</p>
        </div>
      `;
      return;
    }

    let html = `
      <div class="bookings-header">
        <h2>Мои бронирования</h2>
        <button id="back-to-calendar" class="btn-text">
          ← Вернуться к расписанию
        </button>
      </div>
      <ul class="bookings-list">
    `;

    bookings.forEach(booking => {
      html += `
        <li class="booking-item">
          <div class="booking-info">
            <span class="booking-date">${this.formatDate(booking.date)}</span>
            <span class="booking-time">${booking.time}</span>
            <span class="booking-machine">${booking.machine}</span>
          </div>
          <button 
            class="btn-icon cancel-booking" 
            data-booking-id="${booking.id}"
            title="Отменить бронирование"
          >
            🗑️
          </button>
        </li>
      `;
    });

    html += `</ul>`;
    this.elements.bookingSection.innerHTML = html;

    // Назначение обработчиков для кнопок отмены
    document.querySelectorAll('.cancel-booking').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.handleCancelBooking(e.target.dataset.bookingId);
      });
    });

    // Обработчик для кнопки возврата
    document.getElementById('back-to-calendar')?.addEventListener('click', () => {
      Calendar.init();
    });
  }

  /**
   * Обработчик отмены бронирования
   */
  handleCancelBooking(bookingId) {
    UI.showModal(`
      <p>Вы уверены, что хотите отменить это бронирование?</p>
    `, {
      title: 'Отмена бронирования',
      buttons: [
        {
          text: 'Нет',
          action: 'close',
          class: 'btn-secondary'
        },
        {
          text: 'Да, отменить',
          action: 'confirm',
          callback: () => {
            BookingManager.removeBooking(bookingId);
            this.showUserBookings();
            UI.showAlert('Бронирование отменено', 'success');
          },
          class: 'btn-danger'
        }
      ]
    });
  }

  /**
   * Глобальный обработчик кликов
   */
  handleGlobalClick(e) {
    // Обработка действий в модальных окнах
    if (e.target.closest('[data-action]')) {
      const actionElement = e.target.closest('[data-action]');
      const action = actionElement.dataset.action;

      switch (action) {
        case 'navigate':
          window.location.href = actionElement.dataset.target;
          break;
          
        case 'confirm':
          if (actionElement.dataset.callback) {
            const callback = new Function(actionElement.dataset.callback);
            callback();
          }
          UI.closeModal();
          break;
          
        case 'close':
          UI.closeModal();
          break;
      }
    }
  }

  /**
   * Обработчик навигации
   */
  handleNavigation(e) {
    e.preventDefault();
    const target = e.target.closest('.nav-link').dataset.target;
    this.navigateTo(target);
  }

  /**
   * Навигация между страницами
   */
  navigateTo(page) {
    if (this.state.isLoading) return;
    
    this.state.isLoading = true;
    UI.toggleLoader(true, 'Загрузка...');

    setTimeout(() => {
      window.location.href = page;
    }, 300);
  }

  /**
   * Форматирование даты
   */
  formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', weekday: 'long' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  }
}

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  new LaundryApp();
});
