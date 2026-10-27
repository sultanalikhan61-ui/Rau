/* ============================================================
   LESSON TRACKER — Firebase + Telegram + LocalStorage
   Подключается ОДНОЙ строкой в каждый урок:
   
   <script src="lesson-tracker.js"
           data-lesson-id="electronics-3"
           data-lesson-num="3"
           data-lesson-title="Конденсаторы и RC-фильтры"></script>
   
   ВАЖНО: чтобы Султан не попадал в статистику — заходи с ?me=1
   (флаг запомнится навсегда для этого браузера).
   ============================================================ */

(function () {
    'use strict';

    // --- Читаем конфиг из своего же <script> ---
    const self = document.currentScript || (function () {
        const scripts = document.querySelectorAll('script[src*="lesson-tracker"]');
        return scripts[scripts.length - 1];
    })();

    const LESSON_ID    = (self?.dataset?.lessonId    || '').trim();
    const LESSON_NUM   = parseInt(self?.dataset?.lessonNum || '0', 10);
    const LESSON_TITLE = (self?.dataset?.lessonTitle || '').trim();
    const LESSON_TOTAL = 15;

    if (!LESSON_ID) {
        console.warn('[lesson-tracker] Не указан data-lesson-id — трекер выключен');
        return;
    }

    /* ============================================================
       🛡 ОПРЕДЕЛЕНИЕ СУЛТАНА
       Срабатывает если:
       1) в URL есть ?me=1 → запоминаем навсегда
       2) в localStorage уже стоит is_sultan = 'true'
       3) hostname = localhost / 127.0.0.1 (локальная разработка)
       ============================================================ */
    function isSultan() {
        try {
            if (new URLSearchParams(window.location.search).has('me')) {
                localStorage.setItem('is_sultan', 'true');
                return true;
            }
        } catch (e) {}

        if (localStorage.getItem('is_sultan') === 'true') return true;

        // Локальная разработка — тоже не трекаем
        const h = location.hostname;
        if (h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0') return true;

        return false;
    }

    const SULTAN_MODE = isSultan();

    if (SULTAN_MODE) {
        console.log('[lesson-tracker] Sultan mode: Firebase/Telegram отключены');
    }

    // --- Firebase конфиг ---
    const FIREBASE_CONFIG = {
        apiKey: "AIzaSyDrPu0bv13jvnju8JJyHkgeRQcf66fDtlk",
        authDomain: "our-tracker-3cbb5.firebaseapp.com",
        databaseURL: "https://our-tracker-3cbb5-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "our-tracker-3cbb5"
    };

    // --- Telegram ---
    const BOT_TOKEN = "8818384063:" + "AAEEqTup6sgED-gYB_1tm" + "cQKcXwi-UDE3lQ";
    const CHAT_ID   = "606061445";

    function sendTelegram(text) {
        if (SULTAN_MODE) return;
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage` +
                    `?chat_id=${CHAT_ID}&text=${encodeURIComponent(text)}&parse_mode=HTML`;
        fetch(url).catch(() => {});
    }

    // --- Firebase SDK: подгружаем динамически ---
    let db = null;
    function loadFirebase(cb) {
        // Султану Firebase не нужен — не грузим вообще
        if (SULTAN_MODE) return cb();

        if (window.firebase && firebase.apps && firebase.apps.length) {
            db = firebase.database();
            return cb();
        }
        const s1 = document.createElement('script');
        s1.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
        s1.onload = () => {
            const s2 = document.createElement('script');
            s2.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js';
            s2.onload = () => {
                try {
                    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
                    db = firebase.database();
                } catch (e) { console.warn('[lesson-tracker] Firebase init error:', e); }
                cb();
            };
            s2.onerror = cb;
            document.head.appendChild(s2);
        };
        s1.onerror = cb;
        document.head.appendChild(s1);
    }

    // --- Общие утилиты прогресса ---
    const PROGRESS_KEY = 'electronic_lesson_progress';
    function getProgress() {
        try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); }
        catch { return {}; }
    }

    // --- Старт урока ---
    function trackStart() {
        // Султана не трекаем
        if (SULTAN_MODE) return;

        const sessKey = 'lesson_start_' + LESSON_ID;
        const last = parseInt(sessionStorage.getItem(sessKey) || '0', 10);
        const now  = Date.now();
        if (now - last < 120000) return;
        sessionStorage.setItem(sessKey, now);

        if (db) {
            db.ref('lesson_progress/' + LESSON_ID).update({
                title: LESSON_TITLE,
                num: LESSON_NUM,
                started: true,
                started_at: firebase.database.ServerValue.TIMESTAMP
            }).catch(() => {});
        }

        sendTelegram(
            `📖 <b>Рауанна начала урок</b>\n\n` +
            `<b>№${LESSON_NUM}: ${LESSON_TITLE}</b>`
        );
    }

    // --- Завершение урока ---
    window.markLessonComplete = function (id) {
        id = id || LESSON_ID;

        try {
            // 1. Всегда сохраняем в localStorage (чтобы бейдж ✓ работал)
            const p = getProgress();
            if (p[id]) return;
            p[id] = true;
            localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));

            // 2. Если это Султан — стоп, дальше не идём
            if (SULTAN_MODE) {
                console.log('[lesson-tracker] Sultan mode: Firebase/Telegram пропущены');
                return;
            }

            // 3. Firebase
            if (db) {
                db.ref('lesson_progress/' + id).update({
                    title: LESSON_TITLE,
                    num: LESSON_NUM,
                    completed: true,
                    completed_at: firebase.database.ServerValue.TIMESTAMP
                }).catch(() => {});
            }

            // 4. Telegram
            const total = Object.keys(p).length;
            sendTelegram(
                `✅ <b>Рауанна прошла урок!</b>\n\n` +
                `<b>№${LESSON_NUM}: ${LESSON_TITLE}</b>\n` +
                `📊 Прогресс: <b>${total}/${LESSON_TOTAL}</b>`
            );

            if (total >= LESSON_TOTAL) {
                setTimeout(() => {
                    sendTelegram(
                        `🎉 <b>БАЗОВЫЙ КУРС ПРОЙДЕН!</b>\n\n` +
                        `Все ${LESSON_TOTAL} уроков освоены. ` +
                        `Заходи в Firebase → посмотри, что она прошла. 💪`
                    );
                }, 1500);
            }
        } catch (e) {
            console.warn('[lesson-tracker] markLessonComplete error:', e);
        }
    };

    // --- Init ---
    function boot() {
        loadFirebase(() => {
            setTimeout(trackStart, 300);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    console.log('[lesson-tracker] active for', LESSON_ID, '| sultan:', SULTAN_MODE);
})();