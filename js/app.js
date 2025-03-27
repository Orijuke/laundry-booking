document.addEventListener('DOMContentLoaded', function() {
  // Инициализация хранилища и расписания
  const storage = new StorageService();
  const schedule = new ScheduleService();
  const currentUser = storage.getUser();

  // Пастельная палитра (16 цветов)
  const PASTEL_COLORS = [
    "#FFD1DC", "#FFECB8", "#E1F7D5", "#C9E4FF", 
    "#F0D1FF", "#D1FFFD", "#FFD1D1", "#FFE8D1",
    "#D1FFE4", "#D1D1FF", "#E8D1FF", "#FFFBD1",
    "#D1F0FF", "#D1FFD1", "#FFD1F0", "#D1E0FF"
  ];

  // Главная страница
  if (document.getElementById('schedule-table')) {
    initMainPage();
  }

  // Страница профиля
  if (document.getElementById('profile-form')) {
    initProfilePage();
  }

  function initMainPage() {
    const profileBtn = document.getElementById('profile-btn');
    const datePicker = document.getElementById('date-picker');

    // Инициализация кнопки профиля
    if (profileBtn) {
      if (currentUser) {
        profileBtn.textContent = `👤 ${currentUser.name} | ${currentUser.room}`;
      }
      profileBtn.addEventListener('click', () => window.location.href = 'profile.html');
    }

    // Инициализация расписания
    schedule.initSchedule();

    // Обработчики событий
    datePicker.addEventListener('change', function(e) {
      const selectedDate = e.target.value;
      document.getElementById('current-date').textContent = schedule.formatDisplayDate(selectedDate);
      schedule.renderSchedule(selectedDate);
    });

    // Модальные окна
    document.getElementById('confirm-booking')?.addEventListener('click', function() {
      const selectedDate = document.getElementById('date-picker').value;
      schedule.handleConfirmBooking(selectedDate);
    });

    document.getElementById('cancel-booking')?.addEventListener('click', function() {
      document.getElementById('booking-modal').classList.remove('visible');
    });

    document.getElementById('confirm-cancel')?.addEventListener('click', function() {
      schedule.handleConfirmCancel();
    });

    document.getElementById('deny-cancel')?.addEventListener('click', function() {
      document.getElementById('cancel-modal').classList.remove('visible');
    });
  }

  function initProfilePage() {
    const profileForm = document.getElementById('profile-form');
    const colorOptionsContainer = document.querySelector('.color-options');
    const colorInput = document.getElementById('color');

    // Заполнение данных пользователя
    if (currentUser) {
      document.getElementById('name').value = currentUser.name;
      document.getElementById('room').value = currentUser.room;
      colorInput.value = currentUser.color || PASTEL_COLORS[0];
    }

    // Инициализация цветового пикера
    PASTEL_COLORS.forEach(color => {
      const colorBox = document.createElement('div');
      colorBox.className = 'color-option';
      colorBox.style.backgroundColor = color;
      colorBox.dataset.color = color;

      if (color === colorInput.value) {
        colorBox.classList.add('active');
      }

      colorBox.addEventListener('click', function() {
        document.querySelectorAll('.color-option').forEach(el => el.classList.remove('active'));
        this.classList.add('active');
        colorInput.value = this.dataset.color;
      });

      colorOptionsContainer.appendChild(colorBox);
    });

    // Обработка отправки формы
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const user = {
        name: document.getElementById('name').value.trim(),
        room: document.getElementById('room').value,
        color: colorInput.value
      };

      if (!user.name || !user.room) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
      }

      storage.saveUser(user);
      window.location.href = 'index.html';
    });
  }

  // Инициализация текущей даты
  function initCurrentDate() {
    const today = new Date();
    const options = { day: 'numeric', month: 'long', weekday: 'long' };
    const dateString = today.toLocaleDateString('ru-RU', options);
    const dateElement = document.getElementById('current-date');
    
    if (dateElement) {
      dateElement.textContent = dateString;
    }
  }

  initCurrentDate();
});
    });
  }
});
