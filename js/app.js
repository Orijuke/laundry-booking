document.addEventListener('DOMContentLoaded', () => {
  // Common elements
  const currentUser = storage.getUser();
  
  // Index page logic
  if (document.getElementById('schedule-table')) {
    const datePicker = document.getElementById('date-picker');
    const currentDateEl = document.getElementById('current-date');
    const profileBtn = document.getElementById('profile-btn');
    const tableBody = document.querySelector('#schedule-table tbody');
    const bookingModal = document.getElementById('booking-modal');
    const confirmBookingBtn = document.getElementById('confirm-booking');
    const cancelBookingBtn = document.getElementById('cancel-booking');
    
    // Initialize date
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0];
    datePicker.value = currentDate;
    datePicker.min = currentDate;
    currentDateEl.textContent = schedule.formatDisplayDate(today);
    
    // Initialize profile button
    // В секции Index page logic заменим инициализацию кнопки профиля
    if (currentUser) {
      profileBtn.textContent = `👤 ${currentUser.name} (к.${currentUser.room})`;
      profileBtn.addEventListener('click', () => {
        window.location.href = 'profile.html';
      });
    } else {
      profileBtn.textContent = '👤 Создать профиль';
      profileBtn.addEventListener('click', () => {
        window.location.href = 'profile.html';
      });
    }
    
    // Render initial schedule
    schedule.renderSchedule(currentDate, tableBody);
    
    // Event listeners
    datePicker.addEventListener('change', (e) => {
      const selectedDate = e.target.value;
      const date = new Date(selectedDate);
      currentDateEl.textContent = schedule.formatDisplayDate(date);
      schedule.renderSchedule(selectedDate, tableBody);
    });
    
    profileBtn.addEventListener('click', () => {
      window.location.href = 'profile.html';
    });
    
    confirmBookingBtn.addEventListener('click', () => {
      schedule.handleConfirmBooking(datePicker.value);
    });
    
    cancelBookingBtn.addEventListener('click', () => {
      bookingModal.classList.remove('visible');
    });
  }
  
  // Profile page logic
  if (document.getElementById('profile-form')) {
    const profileForm = document.getElementById('profile-form');
    
    // Fill form if user exists
    if (currentUser) {
      document.getElementById('name').value = currentUser.name;
      document.getElementById('room').value = currentUser.room;
      document.getElementById('color').value = currentUser.color;
    }
    
    profileForm.addEventListener('submit', (e) => {
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
      
      // Save user and redirect
      storage.saveUser(user);
      window.location.href = 'index.html';
    });
  }
});
