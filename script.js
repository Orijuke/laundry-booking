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
