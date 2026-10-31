(function() {
    const firebaseConfig = {
        apiKey: "AIzaSyDrPu0bv13jvnju8JJyHkgeRQcf66fDtlk",
        authDomain: "our-tracker-3cbb5.firebaseapp.com",
        databaseURL: "https://our-tracker-3cbb5-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "our-tracker-3cbb5"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.database();

    const currentPath = window.location.pathname;
    const fileName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
    const pageKey = fileName.replace('.', '_');

    if (localStorage.getItem('is_sultan') !== 'true') {
        // Записываем визит
        db.ref('visited_pages/' + pageKey).set(true);

        // Отправляем уведомление
        const part1 = "8818384063:";
        const part2 = "AAEEqTup6sgED-gYB_1tm";
        const part3 = "cQKcXwi-UDE3lQ";
        const BOT_TOKEN = part1 + part2 + part3;
        const CHAT_ID = "606061445";

        const msg = `👀 <b>Рауанна открыла страницу:</b> ${fileName}`;
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(msg)}&parse_mode=HTML`).catch(()=>{});
    }
})();