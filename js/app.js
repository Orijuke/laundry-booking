document.addEventListener('DOMContentLoaded', function() {
  // Проверка доступности storage
  if (typeof storage === 'undefined') {
    console.error('Storage service is not available');
    return;
  }

  const currentUser = storage.getUser();
  
  // Главная страница
  if (document.getElementById('schedule-table')) {
    try {
      const profileBtn = document.getElementById('profile-btn');
      
      // Инициализация кнопки профиля
      if (profileBtn) {
        if (currentUser) {
          profileBtn.textContent = `👤 ${currentUser.name || 'Профиль'} | ${currentUser.room || ''}`;
        }
        
        profileBtn.addEventListener('click', function() {
          window.location.href = 'profile.html';
        });
      }

      // Проверка доступности schedule перед использованием
      if (typeof schedule !== 'undefined') {
        // Инициализация расписания
        schedule.initSchedule();
        
        // Обработчики событий
        const datePicker = document.getElementById('date-picker');
        if (datePicker) {
          datePicker.addEventListener('change', function(e) {
            const selectedDate = e.target.value;
            const currentDateElement = document.getElementById('current-date');
            if (currentDateElement) {
              currentDateElement.textContent = schedule.formatDisplayDate(selectedDate);
            }
            schedule.renderSchedule(selectedDate);
          });
        }
        
        // Обработчики модальных окон
        const confirmBookingBtn = document.getElementById('confirm-booking');
        if (confirmBookingBtn) {
          confirmBookingBtn.addEventListener('click', function() {
            const selectedDate = document.getElementById('date-picker')?.value;
            if (selectedDate) {
              schedule.handleConfirmBooking(selectedDate);
            }
          });
        }
        
        const cancelBookingBtn = document.getElementById('cancel-booking');
        if (cancelBookingBtn) {
          cancelBookingBtn.addEventListener('click', function() {
            document.getElementById('booking-modal')?.classList.add('hidden');
          });
        }

        // Обработчики для модального окна отмены брони
        const confirmCancelBtn = document.getElementById('confirm-cancel');
        if (confirmCancelBtn) {
          confirmCancelBtn.addEventListener('click', function() {
            schedule.handleConfirmCancel();
          });
        }
        
        const denyCancelBtn = document.getElementById('deny-cancel');
        if (denyCancelBtn) {
          denyCancelBtn.addEventListener('click', function() {
            document.getElementById('cancel-modal')?.classList.add('hidden');
          });
        }
      } else {
        console.error('Schedule service is not available');
      }
    } catch (error) {
      console.error('Error initializing main page:', error);
    }
  }
  
  // Страница профиля
  if (document.getElementById('profile-form')) {
    try {
      const profileForm = document.getElementById('profile-form');
      
      if (currentUser) {
        document.getElementById('name').value = currentUser.name || '';
        document.getElementById('room').value = currentUser.room || '';
        document.getElementById('color').value = currentUser.color || '#ffffff';
      }
      
      profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('name');
        const roomInput = document.getElementById('room');
        const colorInput = document.getElementById('color');
        
        if (!nameInput || !roomInput || !colorInput) {
          alert('Ошибка: не все поля формы найдены');
          return;
        }
        
        const user = {
          name: nameInput.value.trim(),
          room: roomInput.value.trim(),
          color: colorInput.value
        };
        
        if (!user.name || !user.room) {
          alert('Пожалуйста, заполните все обязательные поля');
          return;
        }
        
        try {
          storage.saveUser(user);
          window.location.href = 'index.html';
        } catch (error) {
          console.error('Error saving user:', error);
          alert('Произошла ошибка при сохранении профиля');
        }
      });
    } catch (error) {
      console.error('Error initializing profile page:', error);
    }
  }
});
