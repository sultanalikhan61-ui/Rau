/* ============================================================
   LESSON TRACKER — Firebase + Telegram + LocalStorage
   Подключается ОДНОЙ строкой в каждый урок:
   
   <script src="lesson-tracker.js"
           data-lesson-id="electronics-3"
           data-lesson-num="3"
           data-lesson-title="Конденсаторы и RC-фильтры"></script>
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

    // --- Firebase конфиг (тот же, что на главной) ---
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
        if (localStorage.getItem('is_sultan') === 'true') return;
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage` +
                    `?chat_id=${CHAT_ID}&text=${encodeURIComponent(text)}&parse_mode=HTML`;
        fetch(url).catch(() => {});
    }

    // --- Firebase SDK: подгружаем динамически ---
    let db = null;
    function loadFirebase(cb) {
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

    // --- Общие утилиты прогресса (совместимы с уроками) ---
    const PROGRESS_KEY = 'electronic_lesson_progress';
    function getProgress() {
        try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); }
        catch { return {}; }
    }

    // --- Старт урока (1 раз в 2 минуты на сессию) ---
    function trackStart() {
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

    // --- Завершение урока (переопределяем глобальную функцию) ---
    window.markLessonComplete = function (id) {
        id = id || LESSON_ID;

        try {
            const p = getProgress();
            if (p[id]) return; // уже проходила — не спамим
            p[id] = true;
            localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));

            if (db) {
                db.ref('lesson_progress/' + id).update({
                    title: LESSON_TITLE,
                    num: LESSON_NUM,
                    completed: true,
                    completed_at: firebase.database.ServerValue.TIMESTAMP
                }).catch(() => {});
            }

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

    // --- Init после DOM ready ---
    function boot() {
        loadFirebase(() => {
            setTimeout(trackStart, 300); // чуть позже, чтобы страница прогрузилась
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    console.log('[lesson-tracker] active for', LESSON_ID);
})();