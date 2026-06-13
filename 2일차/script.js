// --- AUDIO SYSTEM (WEB AUDIO API) ---
let audioCtx = null;
let audioEnabled = false;

const audioToggleBtn = document.getElementById('audio-toggle-btn');
const audioIconMuted = document.getElementById('audio-icon-muted');
const audioIconPlaying = document.getElementById('audio-icon-playing');

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function toggleAudio() {
  if (!audioEnabled) {
    initAudio();
    audioEnabled = true;
    audioIconMuted.style.display = 'none';
    audioIconPlaying.style.display = 'block';
    playSynthBeep(440, 'triangle', 0.1, 0.05); // Initial notification sound
    setTimeout(() => {
      playSynthBeep(659.25, 'triangle', 0.15, 0.05);
    }, 80);
  } else {
    audioEnabled = false;
    audioIconMuted.style.display = 'block';
    audioIconPlaying.style.display = 'none';
  }
}

audioToggleBtn.addEventListener('click', toggleAudio);

// Utility: Synthesize beep sounds
function playSynthBeep(frequency, type = 'sine', duration = 0.1, volume = 0.1) {
  if (!audioEnabled || !audioCtx) return;
  
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.error('Audio synthesis failed', e);
  }
}

// Custom high-quality sound designs
function playClickSound() {
  // A subtle typewriter click sound
  if (!audioEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.04);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (e) {}
}

function playOptionSelectSound() {
  // A clean synth pluck sound
  playSynthBeep(523.25, 'sine', 0.2, 0.08); // C5 pluck
}

function playThemeSwitchSound(theme) {
  if (!audioEnabled || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    
    if (theme === 'cosmic') {
      // Mystical space wave sweep
      const osc = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const filter = audioCtx.createBiquadFilter();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.6);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(223, now);
      osc2.frequency.exponentialRampToValueAtTime(885, now + 0.6);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100, now);
      filter.frequency.exponentialRampToValueAtTime(2000, now + 0.6);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc2.start();
      osc.stop(now + 0.6);
      osc2.stop(now + 0.6);
      
    } else if (theme === 'cyberpunk') {
      // Futuristic neon synth chord
      const freqs = [261.63, 392.00, 523.25, 783.99]; // C4, G4, C5, G5
      freqs.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + index * 0.03);
        
        gain.gain.setValueAtTime(0.02, now + index * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4 + index * 0.03);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(now + index * 0.03);
        osc.stop(now + 0.5 + index * 0.03);
      });
      
    } else if (theme === 'retro') {
      // Arpeggiated 8-bit arcade climb
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C Major scale climb
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        
        gain.gain.setValueAtTime(0.03, now + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (index + 1.5) * 0.08);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(now + index * 0.08);
        osc.stop(now + (index + 2) * 0.08);
      });
      
    } else if (theme === 'matrix') {
      // Computer chirp/laser sound
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
      
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(now + 0.4);
    }
  } catch (e) {}
}

function playQuizResultSound() {
  if (!audioEnabled || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const chords = [523.25, 659.25, 783.99, 987.77, 1046.50]; // C Major 7 to C6 arpeggio
    chords.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.1);
      
      gain.gain.setValueAtTime(0.06, now + index * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + index * 0.1);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start(now + index * 0.1);
      osc.stop(now + 0.7 + index * 0.1);
    });
  } catch (e) {}
}


// --- INTERACTIVE VIBE SIMULATOR ---
const vibePresets = {
  cosmic: {
    prompt: "Create a cosmic, deep-space layout with purple glowing orbs and nebula effects...",
    code: `// Cosmic Dream Vibe Loaded!
const spaceGrid = new CosmicGrid();
spaceGrid.enableOrbs({
  blur: "120px",
  opacity: 0.25,
  colors: ["#8a2be2", "#4a00e0"]
});
console.log("Vibe status: Nebula active.");`,
    title: "cosmic-dream.js"
  },
  cyberpunk: {
    prompt: "Generate a heavy cyberpunk aesthetic. Add high-contrast neon magenta and cyan accent glow, scanline overlays...",
    code: `// Cyberpunk Neon Vibe Loaded!
const grid = new NeonGrid();
grid.setColors({
  primary: "#ff007f", // Neon Pink
  secondary: "#00f0ff" // Neon Cyan
});
grid.enableGlitchEffects(true);
console.log("Vibe status: Neo-Tokyo mode.");`,
    title: "cyberpunk-neon.js"
  },
  retro: {
    prompt: "Generate a retro arcade aesthetic, featuring neon-orange scanlines, grid styling, and warm vintage glow...",
    code: `// Retro Grid Vibe Loaded!
const arcade = new RetroArcade();
arcade.applyGridSystem({
  color: "#ff5e00",
  scanlines: true
});
arcade.loadChiptuneBeats();
console.log("Vibe status: Synthwave grid active.");`,
    title: "retro-grid.js"
  },
  matrix: {
    prompt: "Initialize Matrix code rain styling. Pure black background, glowing green terminal font, phosphor trail...",
    code: `// Matrix Hack Vibe Loaded!
const terminal = new PhosphorTerminal();
terminal.runRain({
  speed: 15,
  color: "#00ff41",
  density: 0.8
});
terminal.hijackMainframe();
console.log("Vibe status: Mainframe breached.");`,
    title: "matrix-hack.js"
  }
};

const vibeOptions = document.querySelectorAll('.vibe-option');
const promptDisplay = document.getElementById('prompt-display');
const codeOutput = document.getElementById('editor-code-output');
const editorTitle = document.getElementById('editor-title');
const editorScreen = document.getElementById('editor-screen');

let typingTimeout = null;
let codeTypingTimeout = null;

function applyThemeClass(theme) {
  // Clear any existing theme classes
  document.body.className = '';
  if (theme !== 'cosmic') {
    document.body.classList.add(`theme-${theme}`);
  }
  playThemeSwitchSound(theme);
}

function runSimulator(vibeKey) {
  const data = vibePresets[vibeKey];
  if (!data) return;

  // Clear previous timers
  if (typingTimeout) clearTimeout(typingTimeout);
  if (codeTypingTimeout) clearTimeout(codeTypingTimeout);

  // Update tabs/classes in UI
  vibeOptions.forEach(opt => opt.classList.remove('active'));
  document.querySelector(`[data-vibe="${vibeKey}"]`).classList.add('active');

  // Start typewriter effect for prompt
  promptDisplay.textContent = '';
  codeOutput.textContent = '// AI 코드가 로딩되는 중...';
  editorTitle.textContent = data.title;
  
  let i = 0;
  function typePrompt() {
    if (i < data.prompt.length) {
      promptDisplay.textContent += data.prompt.charAt(i);
      playClickSound();
      i++;
      typingTimeout = setTimeout(typePrompt, 35);
    } else {
      // Done typing prompt, start typing code with custom neon delay
      typingTimeout = setTimeout(() => {
        applyThemeClass(vibeKey);
        typeCode(data.code);
      }, 400);
    }
  }
  typePrompt();
}

function typeCode(codeText) {
  codeOutput.textContent = '';
  let i = 0;
  // Type code faster, grouping characters to look like fast streaming coding
  function typeCodeStream() {
    if (i < codeText.length) {
      const charsToTake = Math.floor(Math.random() * 3) + 1; // Take 1 to 3 characters at once
      const chunk = codeText.substring(i, i + charsToTake);
      codeOutput.textContent += chunk;
      playClickSound();
      i += charsToTake;
      codeTypingTimeout = setTimeout(typeCodeStream, 15);
    }
  }
  typeCodeStream();
}

vibeOptions.forEach(opt => {
  opt.addEventListener('click', (e) => {
    initAudio();
    const vibe = opt.getAttribute('data-vibe');
    runSimulator(vibe);
  });
});


// --- VIBE CODER LEVEL QUIZ LOGIC ---
const quizStartBtn = document.getElementById('btn-quiz-start');
const quizRetryBtn = document.getElementById('btn-quiz-retry');
const quizBox = document.getElementById('quiz-box');
const quizSteps = document.querySelectorAll('.quiz-step');
const progressIndicator = document.getElementById('quiz-progress-indicator');

let currentQuizStepIndex = 0;
let quizScore = 0;

const totalQuizQuestions = 4;

function showQuizStep(index) {
  quizSteps.forEach((step, idx) => {
    if (idx === index) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });
  
  // Update progress bar
  if (index === 0) {
    progressIndicator.style.width = '0%';
  } else if (index > 0 && index <= totalQuizQuestions) {
    const pct = (index / totalQuizQuestions) * 100;
    progressIndicator.style.width = `${pct}%`;
  } else {
    progressIndicator.style.width = '100%';
  }
}

function resetQuiz() {
  currentQuizStepIndex = 0;
  quizScore = 0;
  showQuizStep(0);
}

// Start quiz button listener
quizStartBtn.addEventListener('click', () => {
  initAudio();
  playOptionSelectSound();
  currentQuizStepIndex = 1; // Step 1 is Q1
  showQuizStep(currentQuizStepIndex);
});

// Setup click listeners for options in Q1 ~ Q4
for (let qNum = 1; qNum <= totalQuizQuestions; qNum++) {
  const stepDiv = document.getElementById(`quiz-step-q${qNum}`);
  const options = stepDiv.querySelectorAll('.quiz-option');
  
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      initAudio();
      playOptionSelectSound();
      
      const score = parseInt(opt.getAttribute('data-score')) || 0;
      quizScore += score;
      
      currentQuizStepIndex++;
      
      if (currentQuizStepIndex > totalQuizQuestions) {
        // Go to results step, run loading analysis first
        showQuizStep(currentQuizStepIndex); // Shows result step
        displayQuizResult();
      } else {
        showQuizStep(currentQuizStepIndex);
      }
    });
  });
}

function displayQuizResult() {
  const resultTitle = document.getElementById('quiz-result-title');
  const resultDesc = document.getElementById('quiz-result-desc');
  const resultEmoji = document.getElementById('quiz-result-emoji');
  
  resultTitle.textContent = "바이브 성향 계산 중...";
  resultDesc.textContent = "당신의 답변을 바탕으로 AI 개발 성향을 분석하고 있습니다. 잠시만 기다려주세요.";
  resultEmoji.textContent = "🔮";
  
  setTimeout(() => {
    playQuizResultSound();
    
    // Map score to result
    // Q1, Q2, Q3, Q4: Min score 4, Max score 20
    if (quizScore <= 7) {
      resultEmoji.textContent = "⌨️";
      resultTitle.textContent = "전통파 타이피스트 (Traditional Typist)";
      resultDesc.textContent = `당신은 한 땀 한 땀 장인정신으로 코드를 직접 쳐내려가는 견고한 성향입니다. 
      코드 문법과 내부 동작을 완벽히 이해하는 것을 좋아하지만, 가끔 바이브 코딩(Prompting)의 강력한 효율성을 받아들인다면 작업 속도가 10배는 빨라질 수 있습니다. 
      때로는 AI가 코딩하도록 두고, '바이브'를 지휘해 보는 건 어떨까요?`;
    } else if (quizScore <= 12) {
      resultEmoji.textContent = "💻";
      resultTitle.textContent = "하이브리드 어시스턴트 (Hybrid Assistant)";
      resultDesc.textContent = `당신은 필요한 코드는 직접 짜면서도, 지루하거나 반복적인 작업은 적극적으로 AI 비서에게 맡길 줄 아는 실용적인 조율사입니다. 
      생산성과 코드 검증을 조화롭게 조절하는 똑똑한 전략가군요. 바이브 코딩의 재미와 힘을 이미 일부 느끼기 시작하셨습니다!`;
    } else if (quizScore <= 17) {
      resultEmoji.textContent = "🪄";
      resultTitle.textContent = "프롬프트 마에스트로 (Prompt Maestro)";
      resultDesc.textContent = `당신은 전체 구조와 요구사항 명세를 다듬어 AI에게 전달하는 능력이 뛰어난 '지휘자'형 개발자입니다. 
      구체적인 알고리즘 구현은 AI에게 과감하게 일임하고, 전체 아키텍처의 설계와 비즈니스 요구사항에 집중하며 완벽한 결과를 뽑아내고 계시네요!`;
    } else {
      resultEmoji.textContent = "✨";
      resultTitle.textContent = "순수 바이브 코더 (Pure Vibe Coder)";
      resultDesc.textContent = `당신은 키보드에 손을 거의 대지 않는 '무호흡 바이브의 지배자'입니다. 
      비전과 목표, '바이브'만을 주입하여 AI가 하나의 온전한 세상을 빌드하도록 지휘하는 데 매우 익숙하군요. 
      AI 개발 생태계의 패러다임을 극단적으로 꿰뚫고 있는 선구자적 레벨입니다!`;
    }
  }, 1200);
}

quizRetryBtn.addEventListener('click', () => {
  initAudio();
  playOptionSelectSound();
  resetQuiz();
});

// Smooth Scroll for elements
document.getElementById('btn-start-quiz-scroll').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('quiz').scrollIntoView({ behavior: 'smooth' });
});
