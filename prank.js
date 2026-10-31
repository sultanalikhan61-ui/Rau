// prank.js
// Этот скрипт добавляет таймер и выкидывает обратно на главную

(function() {
    // Если это ты (Султан) или в ссылке есть ?me, скрипт не срабатывает
    if (localStorage.getItem('is_sultan') === 'true' || window.location.search.includes('me')) return;

    // Ждем, пока загрузится страница
    window.addEventListener('DOMContentLoaded', () => {
        
        // 1. Создаем блок с таймером
        const timerBox = document.createElement('div');
        // Стили: фиксированный в правом нижнем углу, прозрачный, не перекрывает клики
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
            pointer-events: none; /* Важно: сквозь него можно кликать */
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            text-align: center;
            transition: 0.3s;
        `;
        
        // Начальный текст
        timerBox.innerHTML = `
            <div style="font-size: 10px; color: #ff4757; letter-spacing: 1px; margin-bottom: 4px;">СИСТЕМА</div>
            Возврат через: <span id="prankTimer" style="color: #ff4757; font-size: 18px;">10</span> с
        `;
        
        document.body.appendChild(timerBox);

        // 2. Логика обратного отсчета
        let timeLeft = 10;
        const timerSpan = document.getElementById('prankTimer');

        const countdown = setInterval(() => {
            timeLeft--;
            
            if (timeLeft >= 0 && timerSpan) {
                timerSpan.textContent = timeLeft;
                
                // Когда осталось 3 секунды, начинаем мигать красным
                if (timeLeft <= 3) {
                    timerBox.style.borderColor = '#ff0000';
                    timerBox.style.background = 'rgba(50, 5, 5, 0.8)';
                }
            }

            // 3. Когда время вышло - перекидываем
            if (timeLeft < 0) {
                clearInterval(countdown);
                window.location.href = 'index.html?error=1';
            }
        }, 1000); 
    });
})();