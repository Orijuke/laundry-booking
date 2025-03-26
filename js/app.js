document.addEventListener('DOMContentLoaded', function() {
  const currentUser = storage.getUser();
  
  // Главная страница
  if (document.getElementById('schedule-table')) {
    const profileBtn = document.getElementById('profile-btn');
    
    // Инициализация кнопки профиля
    if (profileBtn) {
      if (currentUser) {
        profileBtn.textContent = `👤 ${currentUser.name} | ${currentUser.room}`;
      }
      
      profileBtn.addEventListener('click', function() {
        window.location.href = 'profile.html';
      });
    }

    // Инициализация расписания
    schedule.initSchedule();
    
    // Обработчики событий
    document.getElementById('date-picker').addEventListener('change', function(e) {
      const selectedDate = e.target.value;
      document.getElementById('current-date').textContent = schedule.formatDisplayDate(selectedDate);
      schedule.renderSchedule(selectedDate);
    });
    
    document.getElementById('confirm-booking')?.addEventListener('click', function() {
      const selectedDate = document.getElementById('date-picker').value;
      schedule.handleConfirmBooking(selectedDate);
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
