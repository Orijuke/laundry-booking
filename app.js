document.addEventListener('DOMContentLoaded', () => {
    const storage = new StorageManager();
    const schedule = new ScheduleManager();
    
    // Проверяем, есть ли текущий пользователь
    const currentUser = storage.getCurrentUser();
    if (!currentUser && window.location.pathname.endsWith('index.html')) {
        window.location.href = 'profile.html';
    }
    
    // Инициализация главной страницы
    if (document.getElementById('scheduleTable')) {
        // Устанавливаем текущую дату по умолчанию
        const datePicker = document.getElementById('datePicker');
        const today = new Date().toISOString().split('T')[0];
        datePicker.value = today;
        datePicker.min = today; // Запрещаем выбирать прошедшие даты
        
        // Обновляем расписание при изменении даты
        datePicker.addEventListener('change', () => {
            schedule.renderSchedule(datePicker.value);
        });
        
        // Отображаем имя пользователя
        if (currentUser) {
            document.getElementById('userNameDisplay').textContent = currentUser.name;
        }
        
        // Переход к профилю
        document.getElementById('profileButton').addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
        
        // Первоначальная загрузка расписания
        schedule.renderSchedule(datePicker.value);
    }
    
    // Инициализация страницы профиля
    if (document.getElementById('profileForm')) {
        const form = document.getElementById('profileForm');
        const user = storage.getCurrentUser();
        
        // Заполняем форму, если пользователь уже существует
        if (user) {
            document.getElementById('name').value = user.name;
            document.getElementById('room').value = user.room;
            document.getElementById('color').value = user.color;
        }
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newUser = {
                id: user ? user.id : storage.generateId(),
                name: document.getElementById('name').value,
                room: parseInt(document.getElementById('room').value),
                color: document.getElementById('color').value
            };
            
            storage.saveUser(newUser);
            storage.setCurrentUser(newUser);
            
            // Перенаправляем на главную страницу
            window.location.href = 'index.html';
        });
    }
});
