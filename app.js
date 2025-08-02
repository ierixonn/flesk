// Конфигурация
const ADMIN_USER_ID = 738572327;
const TOTAL_TIME = 48 * 60 * 60;

// Модуль Telegram WebApp
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

// Модуль платежей
const paymentModule = {
    init() {
        document.querySelectorAll('.pay-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const amount = e.target.closest('.star-option').dataset.amount;
                this.initiatePayment(amount);
            });
        });
    },
    initiatePayment(amount) {
        if (window.Telegram && Telegram.WebApp) {
            Telegram.WebApp.openInvoice({
                title: `Пополнение на ${amount} Stars`,
                description: 'Пополнение баланса в боте',
                currency: "XTR",
                prices: [{ label: 'Stars', amount: amount * 100 }],
                payload: JSON.stringify({
                    userId: this.getUserId(),
                    amount: amount
                }),
                provider_token: "TEST_PROVIDER_TOKEN" // Замените на реальный
            }, (status) => {
                if (status === 'paid') {
                    tgModule.showAlert(`Успешная оплата ${amount} Stars!`);
                    this.updateBalance(amount);
                }
            });
        } else {
            tgModule.showAlert(`Демо: оплата ${amount} Stars`);
        }
    },
    getUserId() {
        const user = tgModule.init() || { id: 'demo-user' };
        return user.id;
    },
    updateBalance(amount) {
        console.log(`Balance updated +${amount} Stars`);
    }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    const user = tgModule.init();
    if (user && user.id === ADMIN_USER_ID) {
        document.getElementById('admin-controls').classList.add('show');
    }
    paymentModule.init();
});
