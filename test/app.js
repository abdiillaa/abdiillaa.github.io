
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
            labels: ["1-тест", "2-тест", "3-тест", "4-тест", "5-тест"],
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

        const row = `
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
        `;
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


var testName;
function testgo(x) {
  switch (x) {
    case 1:
      testName = 'test/data/turik.json';
      break;
    case 2:
      testName = 'test/data/turikmadinet.json';
      break;
    case 3:
      testName = 'test/data/qarakhan.json';
      break;
    case 4:
      testName = 'test/data/ulyJibek.json';
      break;
    case 5:
      testName = 'test/data/khanat-v2.json';
      break;
    default:
      testName = 'test/data/all.json';
  }
document.getElementById("homemenu").style.display = "none";
document.getElementById("app").style.display = "block";
let allQuestions = [];
let test = [];
let current = 0;
let score = 0;
let mistakes = [];

// Файлды жүктеу
fetch(testName)
  .then(r => r.json())
  .then(data => {
    allQuestions = data;
    start();
  });

function start() {
  // Фишер-Йейтс алгоритмімен араластырып, 20 сұрақ алу
  test = shuffle([...allQuestions]).slice(0, 20);
  current = 0;
  score = 0;
  mistakes = [];
  render();
}

function render() {
  const q = test[current];
  
  // Прогрессті көрсету
  document.getElementById("progress").innerHTML = `
    <p onclick="location.reload()">Артқа</p>
    <div class="bar-container">
      <div class="bar" style="width: ${(current / test.length) * 100}%"></div>
    </div>
    <p>Сұрақ ${current + 1} / ${test.length}</p>
  `;

  document.getElementById("question").innerText = q.question;

  // Жауаптарды араластыру (JSON-дағы options-ты қолданамыз)
  let answers = shuffle([...q.options]);

  const box = document.getElementById("options");
  box.innerHTML = "";

  answers.forEach(ans => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerText = ans;
    btn.onclick = () => select(ans, q.answer, btn);
    box.appendChild(btn);
  });
}

function select(selected, correct, btn) {
  const buttons = document.querySelectorAll(".option-btn");
  buttons.forEach(b => b.style.pointerEvents = "none"); // Қайта басуды блоктау

  if (selected === correct) {
    score++;
    btn.classList.add("correct");
  } else {
    btn.classList.add("wrong");
    mistakes.push({
      question: test[current].question,
      correct,
      selected
    });
    // Дұрыс жауапты көрсету
    buttons.forEach(b => {
      if (b.innerText === correct) b.classList.add("correct");
    });
  }

  // Келесі сұраққа өту
  setTimeout(() => {
    current++;
    current < test.length ? render() : finish();
  }, 1200);
}

function finish() {
  const app = document.getElementById("app");
  const percent = Math.round((score / test.length) * 100);

  // Нәтиже тақтасы
  let html = `
    <div class="result">
      <div class="score-circle">${percent}%</div>
      <h2>Тест аяқталды</h2>
      <p>Жиналған ұпай: <b>${score}</b> / ${test.length}</p>
      <button class="retry-btn" onclick="location.reload()">Қайта бастау</button>
    </div>
  `;

  // Қателермен жұмыс бөлімі
  if (mistakes.length > 0) {
    html += `<div class="mistakes-container">
      <h3 class="mistakes-title">Қателермен жұмыс:</h3>`;
    
    mistakes.forEach((m, index) => {
      html += `
        <div class="mistake-card">
          <div class="m-number">${index + 1}</div>
          <div class="m-content">
            <div class="m-question">${m.question}</div>
            <div class="m-details">
              <div class="m-line wrong-line">
                <span class="m-icon">✕</span>
                <span class="m-label">Сіздің жауабыңыз:</span> 
                <span class="m-val">${m.selected}</span>
              </div>
              <div class="m-line correct-line">
                <span class="m-icon">✓</span>
                <span class="m-label">Дұрыс жауап:</span> 
                <span class="m-val">${m.correct}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    
    html += `</div>`;
  } else {
    html += `<div class="perfect-score">Керемет! Сіз ешқандай қате жібермедіңіз! 🚀</div>`;
  }

  app.innerHTML = `<div class="container">${html}</div>`;
}

// Фишер-Йейтс араластыру алгоритмі
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
}