// app.js - полностью переработанный рабочий вариант

document.addEventListener('DOMContentLoaded', function() {
  // Проверяем доступность storage и schedule
  if (!window.storage || !window.schedule) {
    console.error('Ошибка: storage или schedule не загружены');
    return;
  }

  // Инициализация главной страницы
  if (document.getElementById('schedule-table')) {
    initIndexPage();
  }

  // Инициализация страницы профиля
  if (document.getElementById('profile-form')) {
    initProfilePage();
  }
});

function initIndexPage() {
  const currentUser = storage.getUser();
  const profileBtn = document.getElementById('profile-btn');
  const datePicker = document.getElementById('date-picker');

  // Настройка кнопки профиля
  profileBtn.addEventListener('click', function() {
    window.location.href = 'profile.html';
  });

  if (currentUser) {
    profileBtn.textContent = `👤 ${currentUser.name} | ${currentUser.room}`;
  }

  // Инициализация расписания
  const today = new Date().toISOString().split('T')[0];
  datePicker.value = today;
  datePicker.min = today;
  
  schedule.renderSchedule(today)
    .catch(error => {
      console.error('Ошибка загрузки расписания:', error);
      alert('Не удалось загрузить расписание');
    });

  // Обработчик изменения даты
  datePicker.addEventListener('change', function(e) {
    const selectedDate = e.target.value;
    document.getElementById('current-date').textContent = schedule.formatDisplayDate(selectedDate);
    schedule.renderSchedule(selectedDate)
      .catch(error => console.error('Ошибка обновления расписания:', error));
  });

  // Модальное окно бронирования
  document.getElementById('confirm-booking').addEventListener('click', function() {
    const selectedDate = datePicker.value;
    schedule.handleConfirmBooking(selectedDate)
      .catch(error => console.error('Ошибка бронирования:', error));
  });

  document.getElementById('cancel-booking').addEventListener('click', function() {
    document.getElementById('booking-modal').classList.add('hidden');
  });

  // Модальное окно отмены
  document.getElementById('confirm-cancel').addEventListener('click', function() {
    schedule.handleConfirmCancel()
      .catch(error => console.error('Ошибка отмены брони:', error));
  });

  document.getElementById('deny-cancel').addEventListener('click', function() {
    document.getElementById('cancel-modal').classList.add('hidden');
  });
}

function initProfilePage() {
  const currentUser = storage.getUser();
  const form = document.getElementById('profile-form');

  if (currentUser) {
    document.getElementById('name').value = currentUser.name || '';
    document.getElementById('room').value = currentUser.room || '';
    document.getElementById('color').value = currentUser.color || '#3498db';
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const user = {
      id: currentUser?.id || Date.now().toString(),
      name: document.getElementById('name').value.trim(),
      room: document.getElementById('room').value,
      color: document.getElementById('color').value
    };

    if (!user.name || !user.room) {
      alert('Пожалуйста, заполните имя и номер комнаты');
      return;
    }

    storage.saveUser(user)
      .then(() => window.location.href = 'index.html')
      .catch(error => {
        console.error('Ошибка сохранения профиля:', error);
        alert('Не удалось сохранить профиль');
      });
  });
}
