const bearEmojis = ['🐻', '🐼', '🐨', '🧸'];
let playerName = "", playerLastName = "", playerAvatar = "🐻";
let playerAge = 5;
let selectedTopic = '+'; 
let maxLevelLimit = 20; 
let selectedWorldName = 'Mundo Fácil';
let currentLevel = 1;
let unlockedLevel = 1;
let score = 0, lives = 3;
let currentNum1 = 0, currentNum2 = 0, currentOperator = '+', correctAnswer = 0;
let canAnswer = true, hintTimer = null;
let currentProblemSpeech = "";

// Variables del Cronómetro
let stopwatchInterval = null;
let elapsedSeconds = 0;

let audioCtx = null;
let bgMusicInterval = null;
let isMusicPlaying = false;

function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playSound(type) {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'pop') {
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'correct') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    }
}

function toggleBackgroundMusic() {
    const ctx = getAudioContext();
    if (!ctx) return;

    isMusicPlaying = !isMusicPlaying;
    const btn = document.getElementById('music-toggle-btn');
    const title = document.getElementById('music-title');

    if (isMusicPlaying) {
        btn.innerText = "⏸ Pausar";
        title.innerText = "🎵 Osos Beat (Reproduciendo)";
        bgMusicInterval = setInterval(() => {
            if (!isMusicPlaying) return;
            const notes = [261.63, 293.66, 329.63, 392.00, 440.00];
            const note = notes[Math.floor(Math.random() * notes.length)];
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(note, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        }, 600);
    } else {
        btn.innerText = "▶ Reproducir";
        title.innerText = "Música Alegre: Pausada";
        clearInterval(bgMusicInterval);
    }
}

function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'es-ES';
        u.rate = 0.95;
        u.pitch = 1.1;
        window.speechSynthesis.speak(u);
    }
}

// Funciones del Cronómetro
function startStopwatch() {
    stopStopwatch();
    elapsedSeconds = 0;
    updateTimerDisplay();
    stopwatchInterval = setInterval(() => {
        elapsedSeconds++;
        updateTimerDisplay();
    }, 1000);
}

function stopStopwatch() {
    if (stopwatchInterval) {
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
    }
}

function updateTimerDisplay() {
    const mins = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
    const secs = (elapsedSeconds % 60).toString().padStart(2, '0');
    const display = document.getElementById('timer-display');
    if (display) {
        display.innerText = `${mins}:${secs}`;
    }
}

function selectAvatar(avatar, btn) {
    playerAvatar = avatar;
    document.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    playSound('pop');
}

function selectTopic(topic, btn) {
    selectedTopic = topic;
    document.querySelectorAll('.board-card-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    playSound('pop');
}

function selectWorld(maxLvl, name, btn) {
    maxLevelLimit = maxLvl;
    selectedWorldName = name;
    document.querySelectorAll('.world-card-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    playSound('pop');
}

function initPlatform() {
    const nameInput = document.getElementById('player-name').value.trim();
    const lastNameInput = document.getElementById('player-lastname').value.trim();
    const ageVal = parseInt(document.getElementById('player-age-input').value, 10);

    if (!nameInput || !lastNameInput) {
        alert("¡Por favor, escribe tu nombre y apellido!");
        return;
    }

    if (isNaN(ageVal) || ageVal < 3 || ageVal > 99) {
        alert("¡Por favor, escribe una edad válida (entre 3 y 99 años)!");
        return;
    }

    playerName = nameInput;
    playerLastName = lastNameInput;
    playerAge = ageVal;
    const fullName = `${playerName} ${playerLastName}`;

    getAudioContext();

    const banner = document.getElementById('welcome-banner');
    const bigText = document.getElementById('welcome-big-text');
    bigText.innerText = `¡Bienvenida, ${fullName}!`;
    banner.style.display = 'flex';

    setTimeout(() => {
        banner.style.display = 'none';
        
        document.getElementById('header-avatar').innerText = playerAvatar;
        document.getElementById('header-username').innerText = `${fullName} (${playerAge} años)`;
        document.getElementById('current-board-label').innerText = selectedWorldName;

        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('platform-screen').style.display = 'flex';
        document.getElementById('angry-modal').style.display = 'none';

        score = 0;
        lives = 3;
        currentLevel = 1;
        unlockedLevel = 1;
        document.getElementById('score').innerText = score;
        document.getElementById('lives').innerText = lives;
        document.getElementById('current-level-num').innerText = currentLevel;

        renderLevelMap();
        generateProblem();

        speak(`¡Hola ${playerName}! Tienes ${playerAge} años. Estás en el ${selectedWorldName}. ¡A jugar!`);
    }, 2200);
}

function returnToHome() {
    clearInterval(hintTimer);
    stopStopwatch();
    if (isMusicPlaying) toggleBackgroundMusic();
    document.getElementById('platform-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

function renderLevelMap() {
    const container = document.getElementById('levels-container');
    container.innerHTML = '';

    for (let i = 1; i <= maxLevelLimit; i++) {
        const div = document.createElement('div');
        div.className = `level-item ${i === currentLevel ? 'active' : ''} ${i <= unlockedLevel ? 'unlocked' : ''}`;
        
        if (i <= unlockedLevel) {
            div.innerHTML = `<span>Nivel ${i}</span> <span>⭐</span>`;
            div.onclick = () => {
                currentLevel = i;
                document.getElementById('current-level-num').innerText = currentLevel;
                renderLevelMap();
                generateProblem();
                playSound('pop');
            };
        } else {
            div.innerHTML = `<span>Nivel ${i}</span> <span>🔒</span>`;
        }
        container.appendChild(div);
    }
}

function generateProblem() {
    canAnswer = true;
    clearInterval(hintTimer);
    document.getElementById('hint-box').style.display = 'none';
    hideNotification();
    startStopwatch();

    let minNumber = 1;
    let maxNumber = 9;

    if (playerAge >= 6 && playerAge <= 7) {
        minNumber = 2;
        maxNumber = 25;
    } else if (playerAge >= 8 && playerAge <= 9) {
        minNumber = 10;
        maxNumber = 99;
    } else if (playerAge >= 10) {
        minNumber = 20;
        maxNumber = 250;
    }

    const levelBonus = (currentLevel - 1) * (playerAge >= 8 ? 5 : 1);
    maxNumber += levelBonus;

    let op = selectedTopic;
    if (op === 'mixed') {
        const ops = ['+', '-', 'x'];
        op = ops[Math.floor(Math.random() * ops.length)];
    }
    currentOperator = op;

    if (currentOperator === '+') {
        currentNum1 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
        currentNum2 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
        correctAnswer = currentNum1 + currentNum2;
        currentProblemSpeech = `${currentNum1} más ${currentNum2}`;
    } else if (currentOperator === '-') {
        currentNum1 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber + 2;
        currentNum2 = Math.floor(Math.random() * (currentNum1 - 1)) + 1;
        correctAnswer = currentNum1 - currentNum2;
        currentProblemSpeech = `${currentNum1} menos ${currentNum2}`;
    } else if (currentOperator === 'x') {
        let mult1Max = playerAge <= 5 ? 5 : (playerAge <= 7 ? 9 : (playerAge <= 9 ? 15 : 25));
        let mult2Max = playerAge <= 5 ? 4 : (playerAge <= 7 ? 9 : 12);
        currentNum1 = Math.floor(Math.random() * mult1Max) + 1;
        currentNum2 = Math.floor(Math.random() * mult2Max) + 1;
        correctAnswer = currentNum1 * currentNum2;
        currentProblemSpeech = `${currentNum1} por ${currentNum2}`;
    }

    document.getElementById('equation-container').innerHTML = `
        <span>${currentNum1}</span>
        <span class="operator">${currentOperator === 'x' ? '×' : currentOperator}</span>
        <span>${currentNum2}</span>
        <span>=</span>
        <span>?</span>
    `;
    document.getElementById('operator-symbol').innerText = currentOperator === 'x' ? '×' : currentOperator;

    renderBears();
    generateOptions();
    setTimeout(speakCurrentProblem, 400);

    hintTimer = setTimeout(() => { showHint(); }, 20000);
}

function speakCurrentProblem() {
    speak(currentProblemSpeech + ", ¿cuánto es?");
}

function renderBears() {
    const g1 = document.getElementById('bears-1');
    const g2 = document.getElementById('bears-2');
    g1.innerHTML = '';
    g2.innerHTML = '';
    const b1 = bearEmojis[Math.floor(Math.random() * bearEmojis.length)];
    const b2 = bearEmojis[Math.floor(Math.random() * bearEmojis.length)];

    const count1 = Math.min(currentNum1, 10);
    const count2 = Math.min(currentNum2, 10);

    for (let i = 0; i < count1; i++) g1.appendChild(createBear(b1, i + 1));
    for (let i = 0; i < count2; i++) g2.appendChild(createBear(b2, i + 1));
}

function createBear(emoji, count) {
    const s = document.createElement('span');
    s.className = 'bear';
    s.innerText = emoji;
    s.onclick = () => {
        playSound('pop');
        speak(count.toString());
    };
    return s;
}

function generateOptions() {
    const container = document.getElementById('options-container');
    container.innerHTML = '';

    let options = [correctAnswer];
    const spread = correctAnswer > 50 ? 15 : 5;

    while (options.length < 4) {
        let offset = (Math.floor(Math.random() * spread) + 1) * (Math.random() > 0.5 ? 1 : -1);
        let wrongVal = correctAnswer + offset;
        if (wrongVal >= 0 && !options.includes(wrongVal)) {
            options.push(wrongVal);
        }
    }
    options.sort(() => Math.random() - 0.5);

    options.forEach(val => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn';
        btn.innerText = val;
        btn.onclick = () => checkAnswer(val, btn);
        container.appendChild(btn);
    });
}

function checkAnswer(val, btn) {
    if (!canAnswer) return;
    clearInterval(hintTimer);

    if (val === correctAnswer) {
        canAnswer = false;
        stopStopwatch();
        btn.classList.add('correct');
        playSound('correct');
        score += 15;
        document.getElementById('score').innerText = score;

        if (typeof confetti === 'function') {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }

        const timeFormatted = document.getElementById('timer-display').innerText;
        showNotification(`🎉 ¡Correcto! ¡Nivel superado en ${timeFormatted}!`, "#2ecc71");
        speak("¡Excelente respuesta! ¡Muy bien!");

        if (currentLevel === unlockedLevel && unlockedLevel < maxLevelLimit) {
            unlockedLevel++;
        }

        setTimeout(() => {
            if (currentLevel < maxLevelLimit) {
                currentLevel++;
                document.getElementById('current-level-num').innerText = currentLevel;
                renderLevelMap();
            }
            generateProblem();
        }, 2000);
    } else {
        btn.classList.add('wrong');
        playSound('wrong');
        lives--;
        document.getElementById('lives').innerText = lives;

        if (lives <= 0) {
            stopStopwatch();
            document.getElementById('angry-modal').style.display = 'flex';
            speak("¡Oh no! El tigre se ha puesto furioso. Inténtalo de nuevo.");
        } else {
            showNotification("⚠️ ¡Incorrecto! Perdiste una vida. ¡Sigue intentando!", "#e74c3c");
            speak("¡Incorrecto! Sigue intentando.");
            setTimeout(() => btn.classList.remove('wrong'), 500);
        }
    }
}

function showNotification(text, color) {
    const n = document.getElementById('notification');
    n.innerText = text;
    n.style.borderColor = color;
    n.style.display = 'block';
}

function hideNotification() {
    document.getElementById('notification').style.display = 'none';
}

function showHint() {
    const hintText = currentNum1 > 10 || currentNum2 > 10
        ? `Suma o resta primero las unidades y luego las decenas. ¡Tú puedes lograrlo!`
        : `Cuenta con atención los ositos de los recuadros. ¡Tú puedes lograrlo!`;
    document.getElementById('hint-text').innerText = hintText;
    document.getElementById('hint-box').style.display = 'block';
    speak("Aquí tienes una pista de ayuda");
}

function retryLevel() {
    lives = 3;
    document.getElementById('lives').innerText = lives;
    document.getElementById('angry-modal').style.display = 'none';
    generateProblem();
}
