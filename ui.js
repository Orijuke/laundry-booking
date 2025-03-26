import { ProfileManager, BookingManager } from './storage.js';

/**
 * Модуль пользовательского интерфейса
 */
export const UI = {
  // Конфигурация
  config: {
    animationDuration: 300,
    colors: {
      success: '#4CAF50',
      error: '#F44336',
      info: '#2196F3',
      warning: '#FF9800'
    }
  },

  // Состояние
  state: {
    activeModal: null
  },

  // Элементы DOM
  elements: {
    modal: null,
    modalContent: null,
    alertContainer: null
  },

  /**
   * Инициализация UI модуля
   */
  init() {
    this._cacheElements();
    this._setupEventListeners();
    this._setupProfileButton();
  },

  // ==============================================
  // МОДАЛЬНЫЕ ОКНА
  // ==============================================

  /**
   * Показать модальное окно
   * @param {string} content - HTML содержимое
   * @param {Object} options - {title, buttons}
   */
  showModal(content, options = {}) {
    const { title = '', buttons = [] } = options;

    this.elements.modalContent.innerHTML = `
      ${title ? `<h2>${title}</h2>` : ''}
      <div class="modal-body">${content}</div>
      ${this._renderModalButtons(buttons)}
    `;

    this.elements.modal.classList.remove('hidden');
    this.state.activeModal = { options };
    document.body.style.overflow = 'hidden';
  },

  /**
   * Закрыть модальное окно
   */
  closeModal() {
    this.elements.modal.classList.add('hidden');
    this.state.activeModal = null;
    document.body.style.overflow = '';
    setTimeout(() => {
      this.elements.modalContent.innerHTML = '';
    }, this.config.animationDuration);
  },

  // ==============================================
  // УВЕДОМЛЕНИЯ И TOASTS
  // ==============================================

  /**
   * Показать уведомление
   * @param {string} message - Текст сообщения
   * @param {string} type - Тип (success|error|info|warning)
   * @param {number} duration - Длительность в ms (0 для ручного закрытия)
   */
  showAlert(message, type = 'info', duration = 3000) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
      <span>${message}</span>
      <button class="alert-close">&times;</button>
    `;

    this.elements.alertContainer.appendChild(alert);
    alert.classList.add('show');

    // Автозакрытие
    if (duration > 0) {
      setTimeout(() => {
        this._removeAlert(alert);
      }, duration);
    }

    // Обработчик закрытия
    alert.querySelector('.alert-close').addEventListener('click', () => {
      this._removeAlert(alert);
    });

    return alert;
  },

  // ==============================================
  // КОМПОНЕНТЫ ИНТЕРФЕЙСА
  // ==============================================

  /**
   * Обновить кнопку профиля в шапке
   */
  updateProfileButton() {
    const profile = ProfileManager.getCurrentProfile();
    const btn = document.getElementById('profile-btn');
    if (!btn) return;

    if (profile) {
      btn.innerHTML = `
        <span class="profile-avatar" style="background-color: ${profile.color}">
          ${profile.name.charAt(0).toUpperCase()}
        </span>
        <span class="profile-name">${profile.name}</span>
      `;
    } else {
      btn.innerHTML = `
        <span class="profile-avatar default">
          <i class="icon-user"></i>
        </span>
        <span class="profile-name">Профиль</span>
      `;
    }
  },

  /**
   * Показать индикатор загрузки
   * @param {boolean} show - Показать/скрыть
   * @param {string} message - Сообщение
   */
  toggleLoader(show = true, message = 'Загрузка...') {
    const loader = document.getElementById('loader') || this._createLoader();
    if (show) {
      loader.querySelector('.loader-message').textContent = message;
      loader.classList.add('active');
    } else {
      loader.classList.remove('active');
    }
  },

  // ==============================================
  // ПРИВАТНЫЕ МЕТОДЫ
  // ==============================================

  /**
   * Кэширование элементов DOM
   */
  _cacheElements() {
    this.elements = {
      modal: document.getElementById('modal'),
      modalContent: document.getElementById('modal-content'),
      alertContainer: document.getElementById('alerts')
    };
  },

  /**
   * Настройка обработчиков событий
   */
  _setupEventListeners() {
    // Закрытие модального окна
    document.addEventListener('click', (e) => {
      if (e.target === this.elements.modal) {
        this.closeModal();
      }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.activeModal) {
        this.closeModal();
      }
    });
  },

  /**
   * Настройка кнопки профиля
   */
  _setupProfileButton() {
    const btn = document.getElementById('profile-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'profile.html';
      });
      this.updateProfileButton();
    }
  },

  /**
   * Создать элемент загрузки
   */
  _createLoader() {
    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.innerHTML = `
      <div class="loader-content">
        <div class="loader-spinner"></div>
        <div class="loader-message">Загрузка...</div>
      </div>
    `;
    document.body.appendChild(loader);
    return loader;
  },

  /**
   * Удалить уведомление
   */
  _removeAlert(alert) {
    alert.classList.remove('show');
    setTimeout(() => {
      alert.remove();
    }, this.config.animationDuration);
  },

  /**
   * Сгенерировать кнопки для модального окна
   */
  _renderModalButtons(buttons) {
    if (!buttons.length) return '';

    return `
      <div class="modal-actions">
        ${buttons.map(btn => `
          <button 
            class="${btn.class || 'btn'}" 
            data-action="${btn.action || 'close'}"
          >
            ${btn.text}
          </button>
        `).join('')}
      </div>
    `;
  }
};

// Инициализация UI при загрузке
document.addEventListener('DOMContentLoaded', () => {
  UI.init();
});
