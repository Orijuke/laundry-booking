// Проверяем, есть ли профиль при загрузке
function checkProfile() {
  const profile = localStorage.getItem('laundryProfile');
  if (!profile && !window.location.pathname.endsWith('profile.html')) {
    window.location.href = 'profile.html';
  }
}

// Сохраняем профиль
document.getElementById('profile-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const profile = {
    name: document.getElementById('name').value,
    room: document.getElementById('room').value
  };
  localStorage.setItem('laundryProfile', JSON.stringify(profile));
  window.location.href = 'index.html';
});

// Показываем информацию о профиле
function displayProfile() {
  const profile = JSON.parse(localStorage.getItem('laundryProfile'));
  if (profile) {
    document.getElementById('profile-info').innerHTML = `
      <span>${profile.name}, комната ${profile.room}</span>
    `;
  }
}

// === Хранилище данных === //
const storage = {
  // Получить все профили
  getProfiles() {
    return JSON.parse(localStorage.getItem('laundryProfiles')) || [];
  },

  // Добавить/обновить профиль
  saveProfile(profile) {
    const profiles = this.getProfiles();
    const existing = profiles.find(p => p.id === profile.id);
    if (existing) {
      Object.assign(existing, profile); // Обновляем
    } else {
      profile.id = Date.now().toString(); // Генерируем ID
      profiles.push(profile);
    }
    localStorage.setItem('laundryProfiles', JSON.stringify(profiles));
    return profile;
  },

  // Получить расписание
  getSchedule() {
    return JSON.parse(localStorage.getItem('laundrySchedule')) || [];
  },

  // Забронировать окно
  // Новый формат брони:
  // { date, time, machine, userId }
  bookSlot(date, time, machine, userId) {
    const schedule = this.getSchedule();
    schedule.push({ date, time, machine, userId });
    localStorage.setItem('laundrySchedule', JSON.stringify(schedule));
  },

  // Получить брони для конкретного дня
  getDaySchedule(date) {
    return this.getSchedule().filter(slot => slot.date === date);
  }
};

// Фиксированные временные слоты
const TIME_SLOTS = [
  '8:00 - 8:30', '8:45 - 9:15', '9:30 - 10:00', '10:15 - 10:45',
  '11:00 - 11:30', '11:45 - 12:15', '12:30 - 13:00', '13:15 - 13:45',
  '14:00 - 14:30', '14:45 - 15:15', '15:30 - 16:00', '16:15 - 16:45',
  '17:00 - 17:30', '17:45 - 18:15', '18:30 - 19:00', '19:15 - 19:45',
  '20:00 - 20:30', '20:45 - 21:15', '21:30 - 22:00', '22:15 - 23:00'
];

// Генерация таблицы
function generateSchedule(date) {
  const tbody = document.querySelector('#schedule-table tbody');
  tbody.innerHTML = '';
  const daySchedule = storage.getDaySchedule(date);

  TIME_SLOTS.forEach(time => {
    const row = document.createElement('tr');
    
    // Колонка времени
    const timeCell = document.createElement('td');
    timeCell.textContent = time;
    row.appendChild(timeCell);

    // Колонки для машин
    ['У стены', 'У двери'].forEach(machine => {
      const cell = document.createElement('td');
      const booking = daySchedule.find(s => s.time === time && s.machine === machine);
      
      if (booking) {
        const user = storage.getProfiles().find(p => p.id === booking.userId);
        cell.innerHTML = `
          <span style="color: ${user.color}; font-weight: bold">
            ${user.name} (к.${user.room})
          </span>
        `;
      } else {
        cell.classList.add('bookable');
        cell.dataset.time = time;
        cell.dataset.machine = machine;
      }
      
      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });
}

// Модальное окно бронирования
let selectedSlot = null;

document.querySelectorAll('#schedule-table .bookable').forEach(cell => {
  cell.addEventListener('click', () => {
    selectedSlot = {
      time: cell.dataset.time,
      machine: cell.dataset.machine
    };
    
    document.getElementById('modal-time').textContent = selectedSlot.time;
    document.getElementById('modal-machine').textContent = selectedSlot.machine;
    document.getElementById('booking-modal').classList.remove('hidden');
  });
});

document.getElementById('confirm-booking').addEventListener('click', () => {
  if (selectedSlot) {
    const date = document.getElementById('date-picker').value;
    const profile = storage.getProfiles()[0];
    
    storage.bookSlot(
      date,
      selectedSlot.time,
      selectedSlot.machine,
      profile.id
    );
    
    document.getElementById('booking-modal').classList.add('hidden');
    generateSchedule(date);
  }
});

// Обновляем дату при выборе
document.getElementById('date-picker').addEventListener('change', (e) => {
  generateSchedule(e.target.value);
  updateDateDisplay(e.target.value);
});

// Показываем текущую дату
function updateDateDisplay(dateString) {
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'long', weekday: 'long' };
  document.getElementById('current-date').textContent = 
    date.toLocaleDateString('ru-RU', options);
}

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date-picker').value = today;
  updateDateDisplay(today);
  generateSchedule(today);
});

// Общие функции для всех страниц
const ProfileManager = {
  // Загрузить профиль
  loadProfile() {
    const profile = JSON.parse(localStorage.getItem('laundryProfile')) || {};
    if (profile.name) {
      document.getElementById('profile-name').textContent = profile.name;
    }
    return profile;
  },

  // Сохранить профиль
  saveProfile(profile) {
    localStorage.setItem('laundryProfile', JSON.stringify(profile));
    this.loadProfile(); // Обновляем отображение
  }
};

// Для index.html
if (document.getElementById('profile-name')) {
  ProfileManager.loadProfile();
}

// Для profile.html
if (document.getElementById('profile-form')) {
  // Заполняем форму текущими данными
  const profile = ProfileManager.loadProfile();
  document.getElementById('name').value = profile.name || '';
  document.getElementById('room').value = profile.room || '';
  document.getElementById('color').value = profile.color || '#5e9c76';

  // Обработка сохранения
  document.getElementById('profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newProfile = {
      name: document.getElementById('name').value.trim(),
      room: document.getElementById('room').value,
      color: document.getElementById('color').value
    };
    
    ProfileManager.saveProfile(newProfile);
    window.location.href = 'index.html'; // Возвращаем на главную
  });
}
