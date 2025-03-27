// app.js - полная обновленная версия

// Инициализация приложения после загрузки всех ресурсов
window.appInit = async function() {
  try {
    // Инициализация профиля
    const currentUser = storage.getUser();
    const profileBtn = document.getElementById('profile-btn');
    
    if (profileBtn) {
      if (currentUser) {
        profileBtn.textContent = `👤 ${currentUser.name} | кв.${currentUser.room}`;
        profileBtn.style.backgroundColor = currentUser.color;
        profileBtn.style.borderColor = currentUser.color;
      }
      
      profileBtn.addEventListener('click', function() {
        window.location.href = 'profile.html';
      });
    }

    // Инициализация расписания
    if (document.getElementById('schedule-table')) {
      await schedule.initSchedule();
      
      // Обработчики событий для главной страницы
      document.getElementById('date-picker').addEventListener('change', async function(e) {
        const selectedDate = e.target.value;
        document.getElementById('current-date').textContent = schedule.formatDisplayDate(selectedDate);
        await schedule.renderSchedule(selectedDate);
      });
      
      // Бронирование
      document.getElementById('confirm-booking')?.addEventListener('click', async function() {
        const selectedDate = document.getElementById('date-picker').value;
        await schedule.handleConfirmBooking(selectedDate);
      });
      
      document.getElementById('cancel-booking')?.addEventListener('click', function() {
        document.getElementById('booking-modal').classList.add('hidden');
      });

      // Отмена брони
      document.getElementById('confirm-cancel')?.addEventListener('click', async function() {
        await schedule.handleConfirmCancel();
      });
      
      document.getElementById('deny-cancel')?.addEventListener('click', function() {
        document.getElementById('cancel-modal').classList.add('hidden');
      });
    }
    
    // Обработчики для страницы профиля
    if (document.getElementById('profile-form')) {
      const profileForm = document.getElementById('profile-form');
      
      if (currentUser) {
        document.getElementById('name').value = currentUser.name;
        document.getElementById('room').value = currentUser.room;
        document.getElementById('color').value = currentUser.color || '#3498db';
      }
      
      profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const user = {
          id: currentUser?.id || 'user_' + Date.now(),
          name: document.getElementById('name').value.trim(),
          room: document.getElementById('room').value,
          color: document.getElementById('color').value
        };
        
        if (!user.name || !user.room) {
          alert('Пожалуйста, заполните все обязательные поля');
          return;
        }
        
        try {
          document.getElementById('loading-overlay').style.display = 'flex';
          await storage.saveUser(user);
          window.location.href = 'index.html';
        } catch (error) {
          console.error('Ошибка сохранения профиля:', error);
          alert('Не удалось сохранить профиль. Пожалуйста, попробуйте ещё раз.');
        } finally {
          document.getElementById('loading-overlay').style.display = 'none';
        }
      });
    }
    
    // Проверка авторизации при загрузке
    if (!currentUser && window.location.pathname.endsWith('index.html')) {
      if (confirm('Для бронирования необходимо создать профиль. Перейти к настройкам профиля?')) {
        window.location.href = 'profile.html';
      }
    }
  } catch (error) {
    console.error('Ошибка инициализации приложения:', error);
    alert('Произошла ошибка при загрузке приложения. Пожалуйста, обновите страницу.');
  } finally {
    document.getElementById('loading-overlay').style.display = 'none';
  }
};

// Запускаем инициализацию при полной загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  // Добавляем небольшую задержку для гарантированной загрузки всех скриптов
  setTimeout(() => {
    if (window.appInit) {
      window.appInit();
    }
  }, 100);
});
