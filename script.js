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

let selectedList = [];
let quizSession = [];
let currentIndex = 0;
let correctCount = 0;
let wrongCount = 0; // Tambahan hitung salah live
let mistakeLog = {};

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
const liveCorrect = document.getElementById('live-correct');
const liveWrong = document.getElementById('live-wrong');
const feedbackMsg = document.getElementById('feedback-msg');
const cardContainer = document.getElementById('card-container');
const quitBtn = document.getElementById('quit-btn');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');
const scoreCorrect = document.getElementById('score-correct');
const scoreAccuracy = document.getElementById('score-accuracy');
const mistakeContainer = document.getElementById('mistake-container');
const speechBubble = document.getElementById('speech-bubble');

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

selectAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.checkbox-item input').forEach(cb => cb.checked = true);
});
deselectAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.checkbox-item input').forEach(cb => cb.checked = false);
});

function playSound(type) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'correct') {
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
            osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
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
    } catch (e) {}
}

startBtn.addEventListener('click', () => {
    const checkedBoxes = document.querySelectorAll('.checkbox-item input:checked');
    selectedList = Array.from(checkedBoxes).map(cb => hiraganaData[cb.value]);

    if (selectedList.length === 0) {
        alert('Pilih minimal 1 huruf dulu ya! 😊');
        return;
    }

    quizSession = [];
    for (let i = 0; i < 50; i++) {
        const randomIndex = Math.floor(Math.random() * selectedList.length);
        quizSession.push(selectedList[randomIndex]);
    }

    currentIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    mistakeLog = {};

    liveCorrect.innerText = '0';
    liveWrong.innerText = '0';

    switchScreen(quizScreen);
    speechBubble.innerText = "Ganbatte! Ketik romaji yang benar ya!";
    loadQuestion();
});

function switchScreen(screen) {
    [selectionScreen, quizScreen, resultScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

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

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const userAns = userInput.value.trim().toLowerCase();
        const currentData = quizSession[currentIndex];

        if (!userAns) return;

        if (userAns === currentData.romaji) {
            correctCount++;
            liveCorrect.innerText = correctCount;
            playSound('correct');
            cardContainer.classList.add('correct-flash');
            feedbackMsg.style.color = 'var(--success)';
            feedbackMsg.innerText = 'Sugoi! Benar ✨';
            speechBubble.innerText = "Hebat! Pertahankan! 💪";
        } else {
            wrongCount++;
            liveWrong.innerText = wrongCount;
            playSound('wrong');
            cardContainer.classList.add('wrong-flash');
            feedbackMsg.style.color = 'var(--error)';
            feedbackMsg.innerText = `Oishii eh salah, yang benar: ${currentData.romaji}`;
            speechBubble.innerText = `Ah, kurang tepat! Jawabannya "${currentData.romaji}"`;
            
            if (!mistakeLog[currentData.char]) {
                mistakeLog[currentData.char] = { romaji: currentData.romaji, count: 0 };
            }
            mistakeLog[currentData.char].count++;
        }

        userInput.disabled = true;

        setTimeout(() => {
            userInput.disabled = false;
            currentIndex++;
            loadQuestion();
        }, 850);
    }
});

function showResult() {
    switchScreen(resultScreen);
    scoreCorrect.innerText = correctCount;
    const accuracy = Math.round((correctCount / 50) * 100);
    scoreAccuracy.innerText = `${accuracy}%`;
    speechBubble.innerText = `Selesai! Akurasi kamu ${accuracy}%. Keren! 🎉`;

    mistakeContainer.innerHTML = '<strong>📝 Evaluasi Huruf yang Perlu Diingat:</strong><br>';
    const mistakesKeys = Object.keys(mistakeLog);
    if (mistakesKeys.length === 0) {
        mistakeContainer.innerHTML += '<span style="color: var(--success);">Sempurna! Tidak ada salah sama sekali! 🌟</span>';
    } else {
        let listHTML = '<ul style="margin-top: 5px; padding-left: 20px;">';
        for (let char in mistakeLog) {
            listHTML += `<li>${char} (${mistakeLog[char].romaji}) - Keliru ${mistakeLog[char].count}x</li>`;
        }
        listHTML += '</ul>';
        mistakeContainer.innerHTML += listHTML;
    }
}

quitBtn.addEventListener('click', () => {
    switchScreen(selectionScreen);
    speechBubble.innerText = "Mau latihan bagian mana lagi hari ini?";
});
menuBtn.addEventListener('click', () => {
    switchScreen(selectionScreen);
    speechBubble.innerText = "Pilih ulang yuk hurufnya!";
});
restartBtn.addEventListener('click', () => {
    quizSession = [];
    for (let i = 0; i < 50; i++) {
        const randomIndex = Math.floor(Math.random() * selectedList.length);
        quizSession.push(selectedList[randomIndex]);
    }
    currentIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    mistakeLog = {};
    liveCorrect.innerText = '0';
    liveWrong.innerText = '0';
    switchScreen(quizScreen);
    speechBubble.innerText = "Gas lagi ronde baru! Semangat!";
    loadQuestion();
});

initCheckboxes();
