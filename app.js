// Конфигурация
const ADMIN_USER_ID = 738572327;
const TOTAL_TIME = 48 * 60 * 60; // 48 часов в секундах

// Модуль для работы с Telegram WebApp
const tgModule = {
    init() {
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();
            return Telegram.WebApp.initDataUnsafe.user;
        }
        return null;
    },

    showAlert(message) {
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.showAlert(message);
        } else {
            alert(message);
        }
    }
};

// Модуль пользовательского интерфейса
const uiModule = {
    elements: {
        avatar: document.getElementById('avatar'),
        username: document.getElementById('username'),
        userStatus: document.getElementById('user-status'),
        lastSeen: document.getElementById('last-seen'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds'),
        progressFill: document.getElementById('progress-fill'),
        progressPercent: document.getElementById('progress-percent'),
        adminControls: document.getElementById('admin-controls')
    },

    initUserData(user) {
        const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
        this.elements.username.textContent = name || 'Пользователь Telegram';
        
        if (user.photo_url) {
            this.elements.avatar.innerHTML = `<img src="${user.photo_url}" alt="Avatar">`;
        } else {
            const initials = (user.first_name?.[0] || '') + (user.last_name?.[0] || '');
            this.elements.avatar.innerHTML = initials || 'TG';
            this.elements.avatar.style.background = this.getRandomGradient();
        }
    },

    updateTimer(hours, minutes, seconds) {
        this.elements.hours.textContent = hours.toString().padStart(2, '0');
        this.elements.minutes.textContent = minutes.toString().padStart(2, '0');
        this.elements.seconds.textContent = seconds.toString().padStart(2, '0');
    },

    updateProgress(progress) {
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.progressPercent.textContent = `${Math.round(progress)}%`;
    },

    updateStatus(isOnline, lastOnline) {
        if (isOnline) {
            this.elements.userStatus.innerHTML = '<i class="fas fa-circle" style="color: #4CAF50;"></i> Онлайн в боте';
            this.elements.userStatus.style.color = '#4CAF50';
            this.elements.lastSeen.textContent = '';
        } else {
            const lastSeenText = this.formatLastSeen(lastOnline);
            this.elements.userStatus.innerHTML = '<i class="fas fa-circle" style="color: #888;"></i> Не в сети';
            this.elements.userStatus.style.color = '#888';
            this.elements.lastSeen.textContent = lastSeenText;
        }
    },

    formatLastSeen(timestamp) {
        const lastSeenDate = new Date(timestamp * 1000);
        const now = new Date();
        const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
        
        if (diffMinutes < 1) return 'Был(а) только что';
        if (diffMinutes < 60) return `Был(а) ${diffMinutes} ${this.pluralize(diffMinutes, ['минуту', 'минуты', 'минут'])} назад`;
        
        const hours = Math.floor(diffMinutes / 60);
        if (diffMinutes < 1440) return `Был(а) ${hours} ${this.pluralize(hours, ['час', 'часа', 'часов'])} назад`;
        
        const days = Math.floor(diffMinutes / 1440);
        return `Был(а) ${days} ${this.pluralize(days, ['день', 'дня', 'дней'])} назад`;
    },

    pluralize(number, words) {
        const cases = [2, 0, 1, 1, 1, 2];
        return words[
            number % 100 > 4 && number % 100 < 20 
            ? 2 
            : cases[Math.min(number % 10, 5)]
        ];
    },

    getRandomGradient() {
        const gradients = [
            'linear-gradient(45deg, #ff416c, #ff4b2b)',
            'linear-gradient(45deg, #3a7bd5, #00d2ff)',
            'linear-gradient(45deg, #11998e, #38ef7d)',
            'linear-gradient(45deg, #654ea3, #da98b4)',
            'linear-gradient(45deg, #f46b45, #eea849)'
        ];
        return gradients[Math.floor(Math.random() * gradients.length)];
    },

    showAdminControls() {
        this.elements.adminControls.classList.add('show');
    }
};

// Модуль таймера
const timerModule = {
    interval: null,
    startTime: null,

    start(startTimestamp, callback) {
        this.startTime = startTimestamp;
        this.stop();
        
        this.interval = setInterval(() => {
            const currentTime = Math.floor(Date.now() / 1000);
            const elapsed = currentTime - this.startTime;
            const remaining = Math.max(0, TOTAL_TIME - elapsed);
            
            if (remaining <= 0) {
                this.stop();
                callback(0, 0, 0, 100);
                tgModule.showAlert('Обновление завершено!');
                return;
            }
            
            const hours = Math.floor(remaining / 3600);
            const minutes = Math.floor((remaining % 3600) / 60);
            const seconds = remaining % 60;
            const progress = (elapsed / TOTAL_TIME) * 100;
            
            callback(hours, minutes, seconds, progress);
        }, 1000);
    },

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },

    setStartTime(timestamp) {
        this.startTime = timestamp;
    }
};

// Модуль API (имитация для Vercel)
const apiModule = {
    async getProgress() {
        // В реальном приложении здесь будет fetch к вашему API
        return {
            startTime: Math.floor(Date.now() / 1000) - 3600, // 1 час назад
            progress: 0
        };
    },

    async getUserStatus(userId) {
        // Имитация API для статуса пользователя
        return {
            isOnline: Math.random() > 0.5,
            lastOnline: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400)
        };
    },

    async saveProgress(userId, progress) {
        // Имитация сохранения прогресса
        console.log(`Progress saved for user ${userId}: ${progress}%`);
        return true;
    }
};

// Главный модуль приложения
const app = {
    async init() {
        // Инициализация Telegram WebApp
        const user = tgModule.init();
        
        // Режим разработки (если не в Telegram)
        const currentUser = user || {
            id: 123456789,
            first_name: "Иван",
            last_name: "Иванов",
            username: "ivanov_dev",
            photo_url: ""
        };

        // Инициализация UI
        uiModule.initUserData(currentUser);
        
        // Проверка на админа
        if (currentUser.id === ADMIN_USER_ID) {
            uiModule.showAdminControls();
            this.setupAdminControls();
        }

        // Загрузка данных прогресса
        const progressData = await apiModule.getProgress();
        timerModule.setStartTime(progressData.startTime);

        // Запуск таймера
        timerModule.start(progressData.startTime, (h, m, s, p) => {
            uiModule.updateTimer(h, m, s);
            uiModule.updateProgress(p);
        });

        // Проверка статуса пользователя
        const statusData = await apiModule.getUserStatus(currentUser.id);
        uiModule.updateStatus(statusData.isOnline, statusData.lastOnline);
    },

    setupAdminControls() {
        document.getElementById('set-progress').addEventListener('click', async () => {
            const input = document.getElementById('progress-input');
            const progress = parseInt(input.value);
            
            if (isNaN(progress) || progress < 0 || progress > 100) {
                tgModule.showAlert('Пожалуйста, введите число от 0 до 100');
                return;
            }
            
            const saved = await apiModule.saveProgress(ADMIN_USER_ID, progress);
            
            if (saved) {
                const newStartTime = Math.floor(Date.now() / 1000) - (TOTAL_TIME * (progress / 100));
                timerModule.setStartTime(newStartTime);
                tgModule.showAlert(`Прогресс установлен на ${progress}%`);
            } else {
                tgModule.showAlert('Ошибка сохранения');
            }
        });
    }
};

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => app.init());
