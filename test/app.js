
// Fetch the login database
let loginData = {};
fetch('login.json')
  .then(response => response.json())
  .then(data => {
    loginData = data;
  });

// 1. Автоматты түрде келесі ұяшыққа секіру функциясы
function moveFocus(current, nextIndex) {
    if (current.value.length === 1 && nextIndex < 5) {
        const nextInput = document.getElementById('pin' + (nextIndex + 1));
        if (nextInput) nextInput.focus();
    }
    
    // Егер соңғы ұяшық толса, автоматты түрде checkPin() шақыру
    if (nextIndex === 4 && current.value.length === 1) {
        checkPin();
    }
}

// 2. Backspace (өшіру) батырмасын бақылау
document.querySelectorAll('.pin-box').forEach((input, index) => {
    input.addEventListener('keydown', function(e) {
        if (e.key === "Backspace" && this.value === "" && index > 0) {
            const prevInput = document.getElementById('pin' + index);
            if (prevInput) prevInput.focus();
        }
        if (e.key === "Enter") {
            checkPin();
        }
    });
});

// 3. Негізгі Тексеру Функциясы
function checkPin() {
    // 4 ұяшықты бір ПИН қылып жинаймыз
    const p1 = document.getElementById('pin1').value;
    const p2 = document.getElementById('pin2').value;
    const p3 = document.getElementById('pin3').value;
    const p4 = document.getElementById('pin4').value;
    const pinInput = p1 + p2 + p3 + p4;

    const errorMessage = document.getElementById('error-message');

    // Сіздің loginData базаңызбен тексеру
    if (loginData && loginData[pinInput]) {
        const user = loginData[pinInput];
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Экранды жабу
        document.getElementById('login-screen').style.display = 'none';
        
        // Негізгі интерфейсті ашу (ID-ді тексеріңіз: homemenu немесе app)
        const homeMenu = document.getElementById('homemenu') || document.getElementById('app');
        if (homeMenu) homeMenu.style.display = 'flex';

        // Пайдаланушы атын жаңарту
        document.querySelectorAll('.username').forEach(el => el.innerText = user.name);
        const welcome = document.querySelector('#welcomename');
        if (welcome) welcome.innerHTML = "Welcome, " + user.name;

        if (typeof updateChartDisplay === "function") updateChartDisplay();
    } else {
        // Қате болса тазарту
        if (errorMessage) errorMessage.style.display = 'block';
        for (let i = 1; i <= 4; i++) {
            document.getElementById('pin' + i).value = "";
        }
        document.getElementById('pin1').focus();
    }
}

// Hide main content initially

const subjects = [
    { key: 'total', title: 'UNT scores', max: 140 },
    { key: 'sub1', title: 'Informatima scores', max: 50 },
    { key: 'sub2', title: 'Math scores', max: 50 },
    { key: 'hist', title: 'QazTarih scores', max: 20 },
    { key: 'math_s', title: 'Math_s scores', max: 10 },
    { key: 'read_s', title: 'Read_s scores', max: 10 }
];

let currentIndex = 0;
let myChart = null;

function updateChartDisplay() {
    // 1. LocalStorage-тен оқушыны алу
    var user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;

    const subject = subjects[currentIndex];
    
    // 2. Тақырыпты жаңарту
    document.getElementById('chartTitle').innerText = subject.title;
    
    // 3. График салатын жерді (canvas) дайындау
    const ctx = document.getElementById('scoreChart').getContext('2d');
    
    // Ескі графикті өшіру (міндетті)
    if (myChart) {
        myChart.destroy();
    }

    // 4. Жаңа графикті құру
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: user[subject.key],
            datasets: [{
                label: subject.title,
                data: user[subject.key],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 4,
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointBackgroundColor: '#3498db'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: subject.max, // Міне, осы жерде әр пәннің максималды ұпайы қойылады
                    ticks: {
                        stepSize: subject.max / 5 // Шкаланы 5 бөлікке бөліп көрсету үшін
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', updateChartDisplay);

// Ауыстыру функциялары
function nextChart() {
    currentIndex = (currentIndex + 1) % subjects.length;
    updateChartDisplay();
}

function prevChart() {
    currentIndex = (currentIndex - 1 + subjects.length) % subjects.length;
    updateChartDisplay();
}

// Бет жүктелгенде бірден іске қосу


function updateRanking() {
  var user = JSON.parse(localStorage.getItem('currentUser'));
    const tbody = document.getElementById('rankingBody');
    if (!tbody) return;

    // loginData бар екенін тексеру (сіз оны fetch арқылы алғансыз)
    if (!loginData || Object.keys(loginData).length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Мәліметтер жүктелуде...</td></tr>';
        return;
    }

    // 1. Объектіні массивке айналдыру (1001, 1002 деген кілттерді алып тастап, тек ішіндегіні алу)
    const studentsArray = Object.keys(loginData).map(id => {
        const student = loginData[id];
        // total массивінің соңғы элементін алу (немесе 0 егер жоқ болса)
        const lastTotal = student.total && student.total.length > 0 
                          ? student.total[student.total.length - 1] 
                          : 0;
        
        return {
            name: student.name,
            score: lastTotal
        };
    });

    // 2. Ұпай бойынша сұрыптау (Кімде көп - сол жоғарыда)
    studentsArray.sort((a, b) => b.score - a.score);

    // 3. Кестені толтыру
    tbody.innerHTML = '';
    studentsArray.forEach((student, index) => {
        let medal = "";
        if (index === 0) medal = "🥇";
        else if (index === 1) medal = "🥈";
        else if (index === 2) medal = "🥉";
        else medal = index + 1;
        let row;
      if(student.name == user.name){
        row = `
            <tr style="color: #ffffff;background: linear-gradient(to right, #6666ff, #ff3399);">
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${medal}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${student.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                    <span class="score-badge" style="background: #3498db; color: white; padding: 4px 8px; border-radius: 5px; font-weight: bold;">
                        ${student.score}
                    </span>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #ffffff;">ҰБТ</td>
            </tr>
        `;
      }
      else {
        row = `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${medal}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${student.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                    <span class="score-badge" style="background: #3498db; color: white; padding: 4px 8px; border-radius: 5px; font-weight: bold;">
                        ${student.score}
                    </span>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #777;">ҰБТ</td>
            </tr>
        `;};
        tbody.innerHTML += row;
    });
}


function searchMaterials() {
    const input = document.getElementById('materialSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.material-card');

    cards.forEach(card => {
        const title = card.getAttribute('data-title').toLowerCase();
        if (title.includes(input)) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });
}

function goBackFromTest() {
  const app = document.getElementById("app");
  const homeMenu = document.getElementById("homemenu");
  const footerBrand = document.querySelector(".footer-brand");

  if (app) app.style.display = "none";
  if (footerBrand) footerBrand.style.display = "block";

  if (homeMenu) {
    homeMenu.style.display = "flex";
    if (typeof openPage === "function") {
      openPage("test");
    } else {
      document.querySelectorAll(".content-page").forEach(page => {
        page.classList.remove("active");
      });
      const testPage = document.getElementById("test");
      if (testPage) testPage.classList.add("active");
    }
    return;
  }

  window.location.reload();
}


var testName;
function testgo(x) {
  const selectedTestId = Number(x);
  let allQuestions = [];
  let testName = '';
  const QUESTIONS_PER_TEST = 60;
  const NUMBER_SYSTEM_TEST_ID = 156;
  const NUMBER_BASES = [2, 8, 10, 16];
  const NUMBER_OPS = ["+", "-", "*"];

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(arr) {
    return arr[rand(0, arr.length - 1)];
  }

  function toBaseStr(num, base) {
    return num.toString(base).toUpperCase();
  }

  function formatWithBase(value, base) {
    return `${value}<sub>${base}</sub>`;
  }

  function isValidInBase(text, base) {
    const patterns = {
      2: /^[01]+$/,
      8: /^[0-7]+$/,
      10: /^[0-9]+$/,
      16: /^[0-9A-F]+$/
    };
    return patterns[base].test(text);
  }

  function addOption(set, decimalValue, base) {
    if (set.size >= 4) return;
    if (!Number.isInteger(decimalValue) || decimalValue < 0) return;
    set.add(toBaseStr(decimalValue, base));
  }

  function makeCalcOptions(correctDecimal, base) {
    const set = new Set([toBaseStr(correctDecimal, base)]);
    let guard = 0;

    while (set.size < 4 && guard < 240) {
      guard++;
      const shift = rand(1, 40);
      const sign = Math.random() < 0.5 ? -1 : 1;
      addOption(set, correctDecimal + sign * shift, base);
    }

    while (set.size < 4) {
      addOption(set, rand(0, Math.max(120, correctDecimal + 120)), base);
    }

    return shuffle([...set]);
  }

  function makeConvertOptions(decimalValue, toBase, rawText, fromBase) {
    const set = new Set([toBaseStr(decimalValue, toBase)]);

    if (/^[0-9]+$/.test(rawText)) {
      addOption(set, Number(rawText), toBase);
    }

    for (const wrongBase of NUMBER_BASES) {
      if (wrongBase === fromBase) continue;
      if (set.size >= 4) break;
      if (isValidInBase(rawText, wrongBase)) {
        addOption(set, parseInt(rawText, wrongBase), toBase);
      }
    }

    let guard = 0;
    while (set.size < 4 && guard < 240) {
      guard++;
      addOption(set, decimalValue + rand(-180, 180), toBase);
    }

    while (set.size < 4) {
      addOption(set, rand(0, 5000), toBase);
    }

    return shuffle([...set]);
  }

  function generateCalcQuestion(forcedOp = null) {
    const base = pick(NUMBER_BASES);
    const op = forcedOp || pick(NUMBER_OPS);

    let a = 0;
    let b = 0;
    let result = 0;

    if (op === "+") {
      a = rand(5, 150);
      b = rand(2, 120);
      result = a + b;
    } else if (op === "-") {
      a = rand(40, 260);
      b = rand(1, a - 1);
      result = a - b;
    } else {
      a = rand(2, 25);
      b = rand(2, 16);
      result = a * b;
    }

    return {
      question: `${toBaseStr(a, base)}<sub>${base}</sub> ${op} ${toBaseStr(b, base)}<sub>${base}</sub> = ?`,
      options: makeCalcOptions(result, base),
      correct: toBaseStr(result, base),
      answerBase: base,
      useHtml: true
    };
  }

  function generateConvertQuestion() {
    const fromBase = pick(NUMBER_BASES);
    const toBase = pick(NUMBER_BASES.filter((b) => b !== fromBase));
    const decimalValue = rand(1, 4095);

    const raw = toBaseStr(decimalValue, fromBase);
    const correct = toBaseStr(decimalValue, toBase);

    return {
      question: `${raw}<sub>${fromBase}</sub> -> ?<sub>${toBase}</sub>`,
      options: makeConvertOptions(decimalValue, toBase, raw, fromBase),
      correct,
      answerBase: toBase,
      useHtml: true
    };
  }

  function buildNumberSystemQuestions(total = QUESTIONS_PER_TEST) {
    const calcCount = Math.floor(total / 2);
    const convertCount = total - calcCount;

    const forcedOps = [];
    for (let i = 0; i < calcCount; i++) {
      forcedOps.push(NUMBER_OPS[i % NUMBER_OPS.length]);
    }

    const calcQuestions = shuffle(forcedOps).map((op) => generateCalcQuestion(op));
    const convertQuestions = Array.from({ length: convertCount }, () => generateConvertQuestion());

    return shuffle([...calcQuestions, ...convertQuestions]);
  }

  // 1. Файлды анықтау немесе барлығын біріктіру
  const files = {
    1: 'test/data/turik.json',
    2: 'test/data/turikmadinet.json',
    3: 'test/data/qarakhan.json',
    5: 'test/data/khanat-v2.json',
    6: 'test/data/zhongar.json',
    8: 'test/data/syrymdatuly.json',
    9: 'test/data/xvmadinet.json',
    10: 'test/data/nogai.json',
    11: 'test/data/altynorda.json',
    12: 'test/data/mongolshapkyn.json',
    13: 'test/data/ezhelgi.json',
    
    
    
    150: 'test/data/1.1.json',
    151: 'test/data/1.2.json',
    152: 'test/data/1.3.json',
    153: 'test/data/1.4.json',
    154: 'test/data/2.1.json',
    155: 'test/data/2.2.json',
    156: 'test/data/2.5.json',
    158: 'test/data/4.1.json',
    159: 'test/data/4.3.json',
    160: 'test/data/10.1.1.json',
    








  };
  let test = [];
  let current = 0;
  let score = 0;
  let mistakes = [];
  const footerBrand = document.querySelector(".footer-brand");

  document.getElementById("homemenu").style.display = "none";
  document.getElementById("app").style.display = "block";
  if (footerBrand) footerBrand.style.display = "none";

  if (selectedTestId === NUMBER_SYSTEM_TEST_ID) {
    allQuestions = buildNumberSystemQuestions(QUESTIONS_PER_TEST);
    start();
  } else if (selectedTestId >= 1) {
    // Жалғыз файлды жүктеу
    fetch(files[selectedTestId])
      .then(r => r.json())
      .then(data => {
        allQuestions = data;
        start();
      });
  } else {
    // БАРЛЫҚ файлдарды біріктіріп жүктеу (x = 0 немесе басқа болса)
    const promises = Object.values(files).map(filePath => fetch(filePath).then(r => r.json()));
    
    Promise.all(promises).then(results => {
      allQuestions = [].concat(...results); // Барлық массивті біріктіру
      start();
    });
  }

  function start() {
    // Қанша сұрақ болса да, рандом 60 сұрақ алу
    const questionCount = Math.min(QUESTIONS_PER_TEST, allQuestions.length);
    test = shuffle([...allQuestions]).slice(0, questionCount);
    current = 0;
    score = 0;
    mistakes = [];
    render();
  }

  function render() {
    const q = test[current];
    const correctAnswer = q.correct || q.options[0];
    const progressPercent = ((current + 1) / test.length) * 100;

    document.getElementById("progress").innerHTML = `
      <button type="button" class="back-btn" onclick="goBackFromTest()">← Артқа</button>
      <div class="progress-track">
        <span class="progress-fill" style="width: ${progressPercent}%"></span>
      </div>
      <div class="progress-count">Сұрақ ${current + 1} / ${test.length}</div>
    `;

    const questionBox = document.getElementById("question");
    questionBox.innerHTML = "";
    const questionText = document.createElement("span");
    questionText.className = "question-text";
    if (q.useHtml) questionText.innerHTML = q.question;
    else questionText.innerText = q.question;
    questionBox.appendChild(questionText);

    let shuffledOptions = shuffle([...q.options]);

    const box = document.getElementById("options");
    box.innerHTML = "";

    shuffledOptions.forEach((ans, index) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.dataset.value = ans;
      btn.dataset.letter = String.fromCharCode(65 + index);
      const optionText = document.createElement("span");
      optionText.className = "option-text";
      if (q.answerBase) optionText.innerHTML = formatWithBase(ans, q.answerBase);
      else optionText.innerText = ans;
      btn.appendChild(optionText);
      btn.onclick = () => select(ans, correctAnswer, btn);
      box.appendChild(btn);
    });
  }

  function select(selected, correct, btn) {
    const buttons = document.querySelectorAll(".option-btn");
    buttons.forEach(b => b.style.pointerEvents = "none");

    if (selected === correct) {
      score++;
      btn.classList.add("correct");
    } else {
      btn.classList.add("wrong");
      mistakes.push({
        question: test[current].question,
        correct: correct,
        selected: selected,
        answerBase: test[current].answerBase || null,
        useHtml: !!test[current].useHtml
      });
      
      buttons.forEach(b => {
        if (b.dataset.value === correct) b.classList.add("correct");
      });
    }

    setTimeout(() => {
      current++;
      current < test.length ? render() : finish();
    }, 1200);
  }

  function finish() {
    const app = document.getElementById("app");
    const percent = Math.round((score / test.length) * 100);

    let html = `
      <div class="result">
        <div class="score-circle">${percent}%</div>
        <h2>Тест аяқталды</h2>
        <p>Жиналған ұпай: <b>${score}</b> / ${test.length}</p>
        <button class="retry-btn" onclick="location.reload()">Қайта бастау</button>
      </div>
    `;

    if (mistakes.length > 0) {
      html += `<div class="mistakes-container"><h3 class="mistakes-title">Қателермен жұмыс:</h3>`;
      mistakes.forEach((m, index) => {
        const selectedText = m.answerBase ? formatWithBase(m.selected, m.answerBase) : m.selected;
        const correctText = m.answerBase ? formatWithBase(m.correct, m.answerBase) : m.correct;
        html += `
          <div class="mistake-card">
            <div class="m-number">${index + 1}</div>
            <div class="m-content">
              <div class="m-question">${m.question}</div>
              <div class="m-details">
                <div class="m-line wrong-line">
                  <span class="m-icon">✕</span>
                  <span class="m-label">Сіздің жауабыңыз:</span> 
                  <span class="m-val">${selectedText}</span>
                </div>
                <div class="m-line correct-line">
                  <span class="m-icon">✓</span>
                  <span class="m-label">Дұрыс жауап:</span> 
                  <span class="m-val">${correctText}</span>
                </div>
              </div>
            </div>
          </div>`;
      });
      html += `</div>`;
    } else {
      html += `<div class="perfect-score">Керемет! Сіз ешқандай қате жібермедіңіз! 🚀</div>`;
    }
    app.innerHTML = html;
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
