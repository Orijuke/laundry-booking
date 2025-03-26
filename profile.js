import { ProfileManager } from './storage.js';
import { Calendar } from './calendar.js';
import { UI } from './ui.js';

/**
 * Модуль для работы с профилем пользователя
 */
export const Profile = {
  // Конфигурация
  config: {
    minNameLength: 2,
    maxNameLength: 20,
    minRoom: 1,
    maxRoom: 12
  },

  // Элементы DOM
  elements: {
    form: null,
    nameInput: null,
    roomInput: null,
    colorInput: null,
    profileBtn: null,
    profileName: null
  },

  /**
   * Инициализация модуля
   */
  init() {
    this._cacheElements();
    this._setupEventListeners();

    if (this.elements.form) {
      this._loadProfileData();
    }

    if (this.elements.profileBtn) {
      this._updateProfileButton();
    }
  },

  /**
   * Сохранение профиля
   * @param {Event} event - Событие формы
   */
  async handleProfileSubmit(event) {
    event.preventDefault();

    const profileData = {
      name: this.elements.nameInput.value.trim(),
      room: this.elements.roomInput.value,
      color: this.elements.colorInput.value
    };

    if (!this._validateProfile(profileData)) {
      UI.showAlert('Пожалуйста, заполните все поля корректно', 'error');
      return;
    }

    try {
      const success = ProfileManager.saveProfile(profileData);
      
      if (success) {
        UI.showAlert('Профиль успешно сохранён!', 'success');
        this._updateProfileButton();
        
        // Перенаправляем на главную, если это страница профиля
        if (this.elements.form) {
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1000);
        }
      } else {
        throw new Error('Ошибка сохранения');
      }
    } catch (error) {
      console.error('Profile save error:', error);
      UI.showAlert('Произошла ошибка при сохранении', 'error');
    }
  },

  /**
   * Удаление профиля
   */
  handleProfileDelete() {
    if (confirm('Вы уверены, что хотите удалить профиль? Все ваши бронирования будут отменены.')) {
      ProfileManager.removeProfile();
      UI.showAlert('Профиль удалён', 'info');
      this._updateProfileButton();
      
      if (this.elements.form) {
        this.elements.form.reset();
      }
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
      form: document.getElementById('profile-form'),
      nameInput: document.getElementById('name'),
      roomInput: document.getElementById('room'),
      colorInput: document.getElementById('color'),
      profileBtn: document.getElementById('profile-btn'),
      profileName: document.getElementById('profile-name'),
      deleteBtn: document.getElementById('delete-profile-btn')
    };
  },

  /**
   * Настройка обработчиков событий
   */
  _setupEventListeners() {
    if (this.elements.form) {
      this.elements.form.addEventListener('submit', (e) => this.handleProfileSubmit(e));
    }

    if (this.elements.deleteBtn) {
      this.elements.deleteBtn.addEventListener('click', () => this.handleProfileDelete());
    }

    // Валидация в реальном времени
    if (this.elements.nameInput) {
      this.elements.nameInput.addEventListener('input', () => {
        this._validateNameField();
      });
    }

    if (this.elements.roomInput) {
      this.elements.roomInput.addEventListener('input', () => {
        this._validateRoomField();
      });
    }
  },

  /**
   * Загрузка данных профиля в форму
   */
  _loadProfileData() {
    const profile = ProfileManager.getCurrentProfile();

    if (profile) {
      this.elements.nameInput.value = profile.name;
      this.elements.roomInput.value = profile.room;
      this.elements.colorInput.value = profile.color;
    }
  },

  /**
   * Обновление кнопки профиля
   */
  _updateProfileButton() {
    if (!this.elements.profileBtn || !this.elements.profileName) return;

    const profile = ProfileManager.getCurrentProfile();

    if (profile) {
      this.elements.profileName.textContent = profile.name;
      this.elements.profileBtn.style.setProperty('--profile-color', profile.color);
    } else {
      this.elements.profileName.textContent = 'Профиль';
      this.elements.profileBtn.style.removeProperty('--profile-color');
    }
  },

  /**
   * Валидация данных профиля
   */
  _validateProfile(profile) {
    return (
      profile.name.length >= this.config.minNameLength &&
      profile.name.length <= this.config.maxNameLength &&
      /^[а-яА-ЯёЁa-zA-Z\s]+$/.test(profile.name) &&
      !isNaN(profile.room) &&
      parseInt(profile.room) >= this.config.minRoom &&
      parseInt(profile.room) <= this.config.maxRoom &&
      /^#[0-9A-F]{6}$/i.test(profile.color)
    );
  },

  /**
   * Валидация поля имени
   */
  _validateNameField() {
    const value = this.elements.nameInput.value.trim();
    const isValid = (
      value.length >= this.config.minNameLength &&
      value.length <= this.config.maxNameLength &&
      /^[а-яА-ЯёЁa-zA-Z\s]+$/.test(value)
    );

    this._toggleFieldValidity(this.elements.nameInput, isValid);
    return isValid;
  },

  /**
   * Валидация поля комнаты
   */
  _validateRoomField() {
    const value = this.elements.roomInput.value;
    const numericValue = parseInt(value);
    const isValid = (
      !isNaN(numericValue) &&
      numericValue >= this.config.minRoom &&
      numericValue <= this.config.maxRoom
    );

    this._toggleFieldValidity(this.elements.roomInput, isValid);
    return isValid;
  },

  /**
   * Переключение состояния валидации поля
   */
  _toggleFieldValidity(field, isValid) {
    if (isValid) {
      field.classList.remove('invalid');
      field.classList.add('valid');
    } else {
      field.classList.remove('valid');
      field.classList.add('invalid');
    }
  }
};

// Инициализация на странице профиля
if (document.getElementById('profile-form')) {
  document.addEventListener('DOMContentLoaded', () => {
    Profile.init();
  });
}
