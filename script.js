// Data Dasar Hiragana & Romaji-nya
const hiraganaData = [
    { char: "あ", romaji: "a" }, { char: "い", romaji: "i" }, { char: "う", romaji: "u" }, { char: "え", romaji: "e" }, { char: "お", romaji: "o" },
    { char: "か", romaji: "ka" }, { char: "き", romaji: "ki" }, { char: "く", romaji: "ku" }, { char: "け", romaji: "ke" }, { char: "こ", romaji: "ko" },
    { char: "さ", romaji: "sa" }, { char: "し", romaji: "shi" }, { char: "す", romaji: "su" }, { char: "せ", romaji: "se" }, { char: "そ", romaji: "so" },
    { char: "た", romaji: "ta" }, { char: "ち", romaji: "chi" }, { char: "つ", romaji: "tsu" }, { char: "て", romaji: "te" }, { char: "と", romaji: "to" },
    { char: "な", romaji: "na" }, { char: "に", romaji: "ni" }, { char: "ぬ", romaji: "nu" }, { char: "ね", romaji: "ne" }, { char: "の", romaji: "no" },
    { char: "は", romaji: "ha" }, { char: "ひ", romaji: "hi" }, { char: "ふ", romaji: "fu" }, { char: "へ", romaji: "he" }, { char: "ほ", romaji: "ho" },
    { char: "ま", romaji: "ma" }, { char: "み", romaji: "mi" }, { char: "む", romaji: "mu" }, { char: "め", romaji: "me" }, { char: "も", romaji: "mo" },
    { char: "や", romaji: "ya" }, { char: "ゆ", romaji: "yu" }, { char: "よ", romaji: "yo" },
    { char: "ら", romaji: "ra" }, { char: "り", romaji: "ri" }, { char: "る", romaji: "ru" }, { char: "れ", romaji: "re" }, { char: "ろ", romaji: "ro" },
    { char: "わ", romaji: "wa" }, { char: "を", romaji: "wo" }, { char: "ん", romaji: "n" }
];

// State Aplikasi
let selectedList = [];
let quizSession = [];
let currentIndex = 0;
let correctCount = 0;
let mistakeLog = {};

// DOM Elements
const selectionScreen = document.getElementById('selection-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const checkboxContainer = document.getElementById('hiragana-checkboxes');
const startBtn = document.getElementById('start-btn');
const selectAllBtn = document.getElementById('select-all');
const deselectAllBtn = document.getElementById('deselect-all');
const hiraganaTarget = document.getElementById('hiragana-target');
const userInput = document.getElementById('user-input');
const progressText = document.getElementById('progress-text');
const feedbackMsg = document.getElementById('feedback-msg');
const cardContainer = document.getElementById('card-container');
const quitBtn = document.getElementById('quit-btn');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');
const scoreCorrect = document.getElementById('score-correct');
const scoreAccuracy = document.getElementById('score-accuracy');
const mistakeContainer = document.getElementById('mistake-container');

// Inisialisasi Checkbox di Halaman Awal
function initCheckboxes() {
    checkboxContainer.innerHTML = '';
    hiraganaData.forEach((item, index) => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';
        label.innerHTML = `
            <input type="checkbox" value="${index}" checked>
            <span>${item.char}</span>
            <small>${item.romaji}</small>
        `;
        checkboxContainer.appendChild(label);
    });
}

// Tombol Pilih / Batalkan Semua
selectAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.checkbox-item input').forEach(cb => cb.checked = true);
});
deselectAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.checkbox-item input').forEach(cb => cb.checked = false);
});

// Sound Effect Sederhana pakai Web Audio API (Tanpa file eksternal)
function playSound(type) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'correct') {
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        } else {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, audioCtx.currentTime);
            osc.frequency.setValueAtTime(100, audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        }
    } catch (e) {
        // Fallback jika browser membatasi AudioContext
    }
}

// Mulai Latihan
startBtn.addEventListener('click', () => {
    const checkedBoxes = document.querySelectorAll('.checkbox-item input:checked');
    selectedList = Array.from(checkedBoxes).map(cb => hiraganaData[cb.value]);

    if (selectedList.length === 0) {
        alert('Pilih minimal 1 huruf Hiragana terlebih dahulu!');
        return;
    }

    // Buat 50 soal acak dari pilihan yang ada
    quizSession = [];
    for (let i = 0; i < 50; i++) {
        const randomIndex = Math.floor(Math.random() * selectedList.length);
        quizSession.push(selectedList[randomIndex]);
    }

    currentIndex = 0;
    correctCount = 0;
    mistakeLog = {};

    switchScreen(quizScreen);
    loadQuestion();
});

// Pindah Screen Helper
function switchScreen(screen) {
    [selectionScreen, quizScreen, resultScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

// Muat Soal ke Layar
function loadQuestion() {
    if (currentIndex >= 50) {
        showResult();
        return;
    }

    progressText.innerText = `Soal ${currentIndex + 1} / 50`;
    hiraganaTarget.innerText = quizSession[currentIndex].char;
    userInput.value = '';
    feedbackMsg.innerText = '';
    cardContainer.className = 'card';
    userInput.focus();
}

// Handle Event Enter pada Input Keyboard
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const userAns = userInput.value.trim().toLowerCase();
        const currentData = quizSession[currentIndex];

        if (!userAns) return;

        if (userAns === currentData.romaji) {
            // BENAR
            correctCount++;
            playSound('correct');
            cardContainer.classList.add('correct-flash');
            feedbackMsg.style.color = 'var(--success)';
            feedbackMsg.innerText = 'Benar! 👍';
        } else {
            // SALAH
            playSound('wrong');
            cardContainer.classList.add('wrong-flash');
            feedbackMsg.style.color = 'var(--error)';
            feedbackMsg.innerText = `Salah! Yang benar: ${currentData.romaji}`;
            
            // Catat kesalahan
            if (!mistakeLog[currentData.char]) {
                mistakeLog[currentData.char] = { romaji: currentData.romaji, count: 0 };
            }
            mistakeLog[currentData.char].count++;
        }

        // Kunci input sementara selama jeda singkat
        userInput.disabled = true;

        setTimeout(() => {
            userInput.disabled = false;
            currentIndex++;
            loadQuestion();
        }, 800); // Jeda 0.8 detik sebelum lanjut otomatis
    }
});

// Tampilkan Halaman Hasil
function showResult() {
    switchScreen(resultScreen);
    scoreCorrect.innerText = correctCount;
    const accuracy = Math.round((correctCount / 50) * 100);
    scoreAccuracy.innerText = `${accuracy}%`;

    mistakeContainer.innerHTML = '<strong>Evaluasi Huruf yang Sering Salah:</strong><br>';
    const mistakesKeys = Object.keys(mistakeLog);
    if (mistakesKeys.length === 0) {
        mistakeContainer.innerHTML += '<span style="color: var(--success);">Luar biasa! Tidak ada kesalahan sama sekali! 🌟</span>';
    } else {
        let listHTML = '<ul style="margin-top: 5px; padding-left: 20px;">';
        for (let char in mistakeLog) {
            listHTML += `<li>${char} (${mistakeLog[char].romaji}) - Keliru ${mistakeLog[char].count}x</li>`;
        }
        listHTML += '</ul>';
        mistakeContainer.innerHTML += listHTML;
    }
}

// Tombol Navigasi Keluar/Ulangi
quitBtn.addEventListener('click', () => switchScreen(selectionScreen));
menuBtn.addEventListener('click', () => switchScreen(selectionScreen));
restartBtn.addEventListener('click', () => {
    // Ulangi dengan list pilihan yang sama
    quizSession = [];
    for (let i = 0; i < 50; i++) {
        const randomIndex = Math.floor(Math.random() * selectedList.length);
        quizSession.push(selectedList[randomIndex]);
    }
    currentIndex = 0;
    correctCount = 0;
    mistakeLog = {};
    switchScreen(quizScreen);
    loadQuestion();
});

// Jalankan inisialisasi awal saat halaman dibuka
initCheckboxes();
