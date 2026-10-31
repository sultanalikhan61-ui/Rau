// prank.js
// Этот скрипт ждет 3 секунды, а затем выкидывает обратно на главную с ошибкой

(function() {
    // Если это ты (Султан), скрипт не сработает, и ты сможешь спокойно смотреть страницы
    if (localStorage.getItem('is_sultan') === 'true') return;
    
    // Если в URL есть параметр ?me, тоже не срабатывает (для тестирования)
    if (window.location.search.includes('me')) return;

    // Ждем 3 секунды (3000 мс)
    setTimeout(function() {
        // Перекидываем на главную с параметром error=1
        window.location.href = 'index.html?error=1';
    }, 3000); 
})();