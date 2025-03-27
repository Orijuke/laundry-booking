// app.js - упрощенная версия

document.addEventListener('DOMContentLoaded', function() {
  // Проверяем, на какой странице находимся
  const isIndexPage = document.getElementById('schedule-table');
  const isProfilePage = document.getElementById('profile-form');
  
  // Получаем текущего пользователя
  const currentUser = storage.getUser();
  
  // Инициализация главной страницы
  if (isIndexPage) {
    // Настройка кнопки профиля
    const profileBtn = document.getElementById('profile-btn');
    if (currentUser) {
      profileBtn.textContent = `👤 ${currentUser.name} | ${currentUser.room}`;
    }
    profileBtn.addEventListener('click', function() {
      window.location.href = 'profile.html';
    });
    
    // Инициализация расписания
    schedule.initSchedule();
    
    // Обработчик изменения даты
    document.getElementById('date-picker').addEventListener('change', function(e) {
      const selectedDate = e.target.value;
      document.getElementById('current-date').textContent = schedule.formatDisplayDate(selectedDate);
      schedule.renderSchedule(selectedDate);
    });
    
    // Обработчики модального окна бронирования
    document.getElementById('confirm-booking').addEventListener('click', function() {
      const selectedDate = document.getElementById('date-picker').value;
      schedule.handleConfirmBooking(selectedDate);
    });
    
    document.getElementById('cancel-booking').addEventListener('click', function() {
      document.getElementById('booking-modal').classList.add('hidden');
    });
    
    // Обработчики модального окна отмены
    document.getElementById('confirm-cancel').addEventListener('click', function() {
      schedule.handleConfirmCancel();
    });
    
    document.getElementById('deny-cancel').addEventListener('click', function() {
      document.getElementById('cancel-modal').classList.add('hidden');
    });
  }
  
  // Инициализация страницы профиля
  if (isProfilePage) {
    // Заполняем форму, если пользователь уже есть
    if (currentUser) {
      document.getElementById('name').value = currentUser.name;
      document.getElementById('room').value = currentUser.room;
      document.getElementById('color').value = currentUser.color;
    }
    
    // Обработчик отправки формы
    document.getElementById('profile-form').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const user = {
        name: document.getElementById('name').value.trim(),
        room: document.getElementById('room').value,
        color: document.getElementById('color').value
      };
      
      if (!user.name || !user.room) {
        alert('Пожалуйста, заполните все поля');
        return;
      }
      
      storage.saveUser(user);
      window.location.href = 'index.html';
    });
  }
});
