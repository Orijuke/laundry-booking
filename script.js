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
