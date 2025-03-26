document.addEventListener('DOMContentLoaded', function() {
  const currentUser = storage.getUser();
  
  // Главная страница
  if (document.getElementById('schedule-table')) {
    const datePicker = document.getElementById('date-picker');
    const currentDateEl = document.getElementById('current-date');
    const profileBtn = document.getElementById('profile-btn');
    const tableBody = document.querySelector('#schedule-table tbody');
    
    // Инициализация даты
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0];
    datePicker.value = currentDate;
    datePicker.min = currentDate;
    currentDateEl.textContent = schedule.formatDisplayDate(today);
    
    // Инициализация кнопки профиля
    if (profileBtn) {
      if (currentUser) {
        profileBtn.textContent = `👤 ${currentUser.name} (к.${currentUser.room})`;
      } else {
        profileBtn.textContent = '👤 Создать профиль';
      }
      
      profileBtn.addEventListener('click', function() {
        window.location.href = 'profile.html';
      });
    }
    
    // Инициализация расписания
    schedule.renderSchedule(currentDate, tableBody);
    
    // Обработчики событий
    datePicker.addEventListener('change', function(e) {
      const selectedDate = e.target.value;
      const date = new Date(selectedDate);
      currentDateEl.textContent = schedule.formatDisplayDate(date);
      schedule.renderSchedule(selectedDate, tableBody);
    });
    
    document.getElementById('confirm-booking')?.addEventListener('click', function() {
      schedule.handleConfirmBooking(datePicker.value);
    });
    
    document.getElementById('cancel-booking')?.addEventListener('click', function() {
      document.getElementById('booking-modal').classList.remove('visible');
    });
  }
  
  // Страница профиля
  if (document.getElementById('profile-form')) {
    const profileForm = document.getElementById('profile-form');
    
    if (currentUser) {
      document.getElementById('name').value = currentUser.name;
      document.getElementById('room').value = currentUser.room;
      document.getElementById('color').value = currentUser.color;
    }
    
    profileForm.addEventListener('submit', function(e) {
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
