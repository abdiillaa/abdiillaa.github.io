
const PUBLIC_RANKING_URL = 'users/ranking.json';
const ENCRYPTED_USERS_DIR = 'users';
const ENCRYPTION_ITERATIONS = 250000;
let rankingData = [];
fetch(PUBLIC_RANKING_URL)
  .then((response) => response.json())
  .then((data) => {
    rankingData = Array.isArray(data) ? data : [];
  })
  .catch(() => {
    rankingData = [];
  });

const TEST_QUESTION_COUNT_KEY = 'test_questions_per_test';
const DEFAULT_TEST_QUESTION_COUNT = 60;
const MIN_TEST_QUESTION_COUNT = 1;
const TEST_MODE_KEY = 'test_mode';
const DEFAULT_TEST_MODE = 'exam';
const TEST_MODE_LABELS = {
    instant: 'Қазіргі режим',
    exam: 'Еркін режим',
    'self-check': 'Түртіп оқу режимі'
};
const TEST_MODE_DESCRIPTIONS = {
    instant: 'Әр сұрақтан кейін бірден дұрыс/қате көрсетіледі.',
    exam: 'Сұрақтар арасында еркін жүріп, жауапты өзгертіп, сенімді болғанда аяқтайсыз.',
    'self-check': 'Түртіп жауапты ашасыз, кейін өзіңіз дұрыс/қате деп белгілейсіз.'
};
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const KZ_MONTHS_FULL = [
    'қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым',
    'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'
];
const KZ_MONTHS_SHORT = [
    'қаң', 'ақп', 'нау', 'сәу', 'мам', 'мау',
    'шіл', 'там', 'қыр', 'қаз', 'қар', 'жел'
];
const KZ_WEEKDAYS_SHORT = ['Жс', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сн'];
const AVATAR_COLOR_PALETTE = [
    ['#2563eb', '#1e40af'],
    ['#059669', '#047857'],
    ['#ea580c', '#c2410c'],
    ['#7c3aed', '#5b21b6'],
    ['#dc2626', '#991b1b'],
    ['#0f766e', '#115e59'],
    ['#ca8a04', '#92400e'],
    ['#0284c7', '#075985']
];
const TEST_METADATA = {
    '-2': { title: 'Инфо бойынша тапсыру', subject: 'Информатика' },
    '-1': { title: 'Тарих бойынша тапсыру', subject: 'Қазақстан тарихы' },
    '0': { title: 'Барлығын бірге', subject: 'Жалпы тест' },
    '1': { title: 'Ерте орта Қазақстан VI-IX', subject: 'Қазақстан тарихы', file: 'test/data/turik.json' },
    '2': { title: 'Ерте орта ғасыр мәдениеті VI-IX', subject: 'Қазақстан тарихы', file: 'test/data/turikmadinet.json' },
    '3': { title: 'IX-XI ғасырлардағы Қазақстан', subject: 'Қазақстан тарихы', file: 'test/data/qarakhan.json' },
    '5': { title: 'Біртұтас қазақ хандығының құрылуы', subject: 'Қазақстан тарихы', file: 'test/data/khanat-v2.json' },
    '6': { title: 'Жаңа замандағы Қазақстан', subject: 'Қазақстан тарихы', file: 'test/data/zhongar.json' },
    '8': { title: 'Сырым Датұлы', subject: 'Қазақстан тарихы', file: 'test/data/syrymdatuly.json' },
    '9': { title: 'XV-XIX ғасырлардағы мәдениеті', subject: 'Қазақстан тарихы', file: 'test/data/xvmadinet.json' },
    '10': { title: 'Ноғай', subject: 'Қазақстан тарихы', file: 'test/data/nogai.json' },
    '11': { title: 'Алтын орда', subject: 'Қазақстан тарихы', file: 'test/data/altynorda.json' },
    '12': { title: 'Шыңғыс хан', subject: 'Қазақстан тарихы', file: 'test/data/mongolshapkyn.json' },
    '13': { title: 'Ежелгі Қазақстан', subject: 'Қазақстан тарихы', file: 'test/data/ezhelgi.json' },
    '14': { title: 'Қазақстандағы хандық биліктің жойылуы', subject: 'Қазақстан тарихы', file: 'test/data/khanatedel.json' },
    '15': { title: 'Есет пен Жаңқожа', subject: 'Қазақстан тарихы', file: 'test/data/kz-history-10-test-1.json' },
    '16': { title: '1867-1868 Жылдардағы реформа', subject: 'Қазақстан тарихы', file: 'test/data/eset.json' },
    '17': { title: '10-сынып Қазақстан тарихы тест 1', subject: 'Қазақстан тарихы', file: 'test/data/67-68.json' },
    '18': { title: 'XIX ғасырдағы 50 жылдар', subject: 'Қазақстан тарихы', file: 'test/data/koterilis.json' },
    '19': { title: 'XIX ғасырдың 60-70 көтерілістер', subject: 'Қазақстан тарихы', file: 'test/data/XiX60-70.json' },
    '20': { title: 'ХХ ғасыр басыңдағы Қазақстан', subject: 'Қазақстан тарихы', file: 'test/data/1907.json' },
    '21': { title: '1991 жыл: Тәуелсіздік кезеңі', subject: 'Қазақстан тарихы', file: 'test/data/1991.json' },
    '22': { title: 'Жүзден жүйрік 40 (тарих)', subject: 'Қазақстан тарихы', file: 'test/data/juz40tarih.json' },
    '23': { title: '1920-1930 жылдардағы Қазақстан', subject: 'Қазақстан тарихы', file: 'test/data/1920-30.json' },
    '24': { title: 'Ұлы Отан соғысы', subject: 'Қазақстан тарихы', file: 'test/data/ulyOtan.json' },
    '25': { title: 'Тоқырау жылдарындағы Қазақстан', subject: 'Қазақстан тарихы', file: 'test/data/tokyrau.json' },
    '26': { title: '1930 жылдардағы қоғамдық-саяси', subject: 'Қазақстан тарихы', file: 'test/data/1930.json' },
    '27': { title: '2025 мамырдағы тест Физ/Мат', subject: 'Қазақстан тарихы', file: 'test/data/2025mayarai.json' },
    '28': { title: '2025 мамырдағы тест Био/Хим', subject: 'Қазақстан тарихы', file: 'test/data/2025mayaruzhan.json' },
    '150': { title: '1.1 Компьютер конфигурациясы', subject: 'Информатика', file: 'test/data/1.1.json' },
    '151': { title: '1.2 Компьютер жады', subject: 'Информатика', file: 'test/data/1.2.json' },
    '152': { title: '1.3 Бағдармалалық жасақтама', subject: 'Информатика', file: 'test/data/1.3.json' },
    '153': { title: '1.4 Басқару құрылғысы АЛҚ ЖАД регистірі', subject: 'Информатика', file: 'test/data/1.4.json' },
    '154': { title: '2.1 Ақпарат сипаты және қасиеті', subject: 'Информатика', file: 'test/data/2.1.json' },
    '155': { title: '2.2 Ақпаратты кодтау және декодтау', subject: 'Информатика', file: 'test/data/2.2.json' },
    '156': { title: '2.5 Екілік, ондық, сегіздік, он алтылық', subject: 'Информатика', file: 'test/data/2.5.json' },
    '158': { title: '4.1 Компьютерлік желілері', subject: 'Информатика', file: 'test/data/4.1.json' },
    '159': { title: '4.3 IP адрес', subject: 'Информатика', file: 'test/data/4.3.json' },
    '160': { title: '10.1.1 HTML', subject: 'Информатика', file: 'test/data/10.1.1.json' },
    '161': { title: 'Жаңа тест (үлгі)', subject: 'Информатика', file: 'test/data/161.json' },
    '162': { title: 'Python тесті', subject: 'Информатика', file: 'test/data/python.json' },
    '163': { title: 'CSS тесті', subject: 'Информатика', file: 'test/data/css.json' },
    '164': { title: 'Жүзден жүйрік 40 (инфо)', subject: 'Информатика', file: 'test/data/juz40info.json' }
};

function buildTestFileMap() {
    const fileMap = {};
    Object.keys(TEST_METADATA).forEach((id) => {
        const numericId = Number(id);
        const meta = TEST_METADATA[id];
        if (!Number.isInteger(numericId) || !meta || typeof meta.file !== 'string') return;
        const normalizedFile = meta.file.trim();
        if (!normalizedFile) return;
        fileMap[numericId] = normalizedFile;
    });
    return fileMap;
}

const TEST_FILES = buildTestFileMap();

function renderTestTopicLists() {
    const historyRoot = document.getElementById('test-history-topics');
    const informaticsRoot = document.getElementById('test-informatics-topics');
    if (!historyRoot || !informaticsRoot) return;

    historyRoot.innerHTML = '';
    informaticsRoot.innerHTML = '';

    const entries = Object.keys(TEST_METADATA)
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0 && TEST_FILES[id])
        .sort((a, b) => a - b);

    entries.forEach((testId) => {
        const meta = getTestMeta(testId);
        const subject = String(meta.subject || '').trim().toLowerCase();
        const root = subject === 'информатика' ? informaticsRoot : historyRoot;
        const item = document.createElement('li');
        item.textContent = meta.title || `Тест ${testId}`;
        item.addEventListener('click', () => testgo(testId));
        root.appendChild(item);
    });
}
renderTestTopicLists();

const RUNNER_SECONDS_PER_QUESTION = {
    instant: 45,
    exam: 75,
    'self-check': 60
};
const TELEGRAM_BOT_TOKEN = '7364322177:AAF11RjdXSr312Xb8X9OrAOSZIArZd1Hbx4';
const TELEGRAM_CHAT_ID = '6861956601';
const RUNNER_TIMER_WARNING_SECONDS = 300;
const RUNNER_WIDGET_STORAGE_PREFIX = 'runner_widget_state';
const RUNNER_UI = {
    activeApi: null,
    timerId: null,
    widgetsInitialized: false,
    topZIndex: 10020,
    fullscreenBound: false
};
const textEncoder = new TextEncoder();

function getRunnerIcon(name) {
    const icons = {
        calculator: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="2.5"></rect><rect x="8" y="5.5" width="8" height="3.5" rx="1"></rect><path d="M8 12h2M14 12h2M8 15.5h2M14 15.5h2M8 19h2M11.95 12h.1M11.95 15.5h.1M11.95 19h.1"></path></svg>',
        microscope: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4h4M12 4v4M9 8h6M10 8v4.5a4.5 4.5 0 1 0 9 0M13 12h4M6 20h12M9 16.5H5.5a2.5 2.5 0 0 1 0-5H8"></path></svg>',
        flask: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3h4M11 3v5l-5.5 9.2A2.5 2.5 0 0 0 7.64 21h8.72a2.5 2.5 0 0 0 2.14-3.8L13 8V3M8.5 15h7"></path></svg>',
        book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h11v16H7a2.5 2.5 0 0 0-2.5 2.5V5.5ZM7 3v16"></path></svg>',
        checkCircle: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="m8.5 12 2.2 2.2L15.8 9"></path></svg>',
        arrowLeft: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"></path></svg>',
        check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"></path></svg>',
        clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>',
        chevronLeft: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg>',
        chevronRight: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>',
        menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>',
        flag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3v18M6 4h9l-1.5 3L15 10H6"></path></svg>',
        chart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V9M12 19V5M19 19v-7M4 19h16"></path></svg>'
    };
    return icons[name] || '';
}

function escapeTelegramHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function formatPrettyDuration(totalSeconds) {
    const safeValue = Math.max(0, Math.round(Number(totalSeconds) || 0));
    const hours = Math.floor(safeValue / 3600);
    const minutes = Math.floor((safeValue % 3600) / 60);
    const seconds = safeValue % 60;
    if (hours > 0) return `${hours} сағ ${minutes} мин ${seconds} сек`;
    if (minutes > 0) return `${minutes} мин ${seconds} сек`;
    return `${seconds} сек`;
}

function formatTelegramDateTime(date = new Date()) {
    return new Intl.DateTimeFormat('kk-KZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(date);
}

function detectDeviceDetails() {
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    const userAgent = nav && nav.userAgent ? nav.userAgent : '';
    const platform = nav && nav.platform ? nav.platform : '';
    const language = nav && nav.language ? nav.language : 'Белгісіз';
    const vendor = nav && nav.vendor ? nav.vendor : 'Белгісіз';
    const screenWidth = typeof screen !== 'undefined' && screen.width ? screen.width : 0;
    const screenHeight = typeof screen !== 'undefined' && screen.height ? screen.height : 0;
    const pixelRatio = typeof window !== 'undefined' && window.devicePixelRatio ? window.devicePixelRatio : 1;
    const timezone = (() => {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Белгісіз';
        } catch {
            return 'Белгісіз';
        }
    })();

    const deviceType = /iPad|Tablet|Android(?!.*Mobile)|Silk/i.test(userAgent)
        ? 'Планшет'
        : /Mobi|Android|iPhone|iPod/i.test(userAgent)
            ? 'Телефон'
            : 'Компьютер';

    let osName = 'Белгісіз ОС';
    let osVersion = 'Белгісіз';
    const windowsMatch = userAgent.match(/Windows NT ([0-9.]+)/i);
    const iosMatch = userAgent.match(/OS ([0-9_]+)/i);
    const androidMatch = userAgent.match(/Android ([0-9.]+)/i);
    const macMatch = userAgent.match(/Mac OS X ([0-9_]+)/i);

    if (windowsMatch) {
        osName = 'Windows';
        const windowsVersionMap = {
            '10.0': '10/11',
            '6.3': '8.1',
            '6.2': '8',
            '6.1': '7',
            '6.0': 'Vista',
            '5.1': 'XP'
        };
        osVersion = windowsVersionMap[windowsMatch[1]] || windowsMatch[1];
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
        osName = 'iOS';
        osVersion = iosMatch ? iosMatch[1].replace(/_/g, '.') : 'Белгісіз';
    } else if (androidMatch) {
        osName = 'Android';
        osVersion = androidMatch[1];
    } else if (macMatch || /Macintosh/i.test(userAgent)) {
        osName = 'macOS';
        osVersion = macMatch ? macMatch[1].replace(/_/g, '.') : 'Белгісіз';
    } else if (/Linux/i.test(userAgent) || /X11/i.test(platform)) {
        osName = 'Linux';
    }

    let browserName = 'Белгісіз браузер';
    if (/Edg\//i.test(userAgent)) browserName = 'Edge';
    else if (/OPR\//i.test(userAgent) || /Opera/i.test(userAgent)) browserName = 'Opera';
    else if (/SamsungBrowser/i.test(userAgent)) browserName = 'Samsung Internet';
    else if (/Chrome\//i.test(userAgent) && !/Edg\//i.test(userAgent) && !/OPR\//i.test(userAgent)) browserName = 'Chrome';
    else if (/Firefox\//i.test(userAgent)) browserName = 'Firefox';
    else if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent) && !/Chromium\//i.test(userAgent)) browserName = 'Safari';

    return {
        summary: `${deviceType} · ${osName} · ${browserName}`,
        deviceType,
        osName,
        osVersion,
        browserName,
        platform: platform || 'Белгісіз',
        language,
        vendor,
        resolution: screenWidth && screenHeight ? `${screenWidth}x${screenHeight}` : 'Белгісіз',
        pixelRatio: String(pixelRatio || 1),
        timezone,
        userAgent: userAgent || 'Белгісіз'
    };
}

function getPublicIpAddress() {
    return fetch('https://api.ipify.org?format=json')
        .then((response) => response.json())
        .then((data) => {
            if (data && data.ip) return String(data.ip);
            return 'Анықталмады';
        })
        .catch(() => 'Анықталмады');
}

function sendTelegramTestResult(payload) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return Promise.resolve();

    const lines = [
        '<b>Жаңа тест нәтижесі</b>',
        '',
        `<b>Оқушы:</b> ${escapeTelegramHtml(payload.userName)}`,
        `<b>Пән:</b> ${escapeTelegramHtml(payload.subject)}`,
        `<b>Тест:</b> ${escapeTelegramHtml(payload.title)}`,
        `<b>Режим:</b> ${escapeTelegramHtml(payload.modeLabel)}`,
        `<b>Тапсырған уақыты:</b> ${escapeTelegramHtml(payload.submittedAt)}`,
        `<b>Уақыт:</b> ${escapeTelegramHtml(payload.durationLabel)}`,
        `<b>Нәтиже:</b> ${payload.score}/${payload.total}`,
        `<b>Пайыз:</b> ${payload.percent}%`,
        `<b>Қате:</b> ${payload.mistakeCount}`
    ];

    return fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: new URLSearchParams({
            chat_id: TELEGRAM_CHAT_ID,
            parse_mode: 'HTML',
            text: lines.join('\n')
        })
    })
    .then((response) => response.json().catch(() => ({ ok: response.ok })))
    .then((data) => {
        if (data && data.ok) return { ok: true };
        return {
            ok: false,
            description: data && data.description ? String(data.description) : 'Белгісіз қате'
        };
    })
    .catch((error) => {
        console.error('Telegram жіберу қатесі:', error);
        return {
            ok: false,
            description: error && error.message ? error.message : 'Желі қатесі'
        };
    });
}

async function sendTelegramVisitEvent(userName) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return Promise.resolve();
    const deviceInfo = detectDeviceDetails();
    const publicIp = await getPublicIpAddress();

    const lines = [
        '<b>Сайтқа кіру</b>',
        '',
        `<b>Оқушы:</b> ${escapeTelegramHtml(userName || 'Оқушы')}`,
        `<b>IP:</b> ${escapeTelegramHtml(publicIp)}`,
        `<b>Құрылғы:</b> ${escapeTelegramHtml(deviceInfo.summary)}`,
        `<b>Уақыты:</b> ${escapeTelegramHtml(formatTelegramDateTime())}`
    ];

    return fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: new URLSearchParams({
            chat_id: TELEGRAM_CHAT_ID,
            parse_mode: 'HTML',
            text: lines.join('\n')
        })
    }).catch((error) => {
        console.error('Telegram кіру хабарламасының қатесі:', error);
    });
}

function getStoredCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch {
        return null;
    }
}

function saveCurrentUser(user) {
    if (!user || typeof user !== 'object') return;
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function escapeText(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderTestHistory() {
    const container = document.getElementById('test-history-list');
    if (!container) return;

    const user = getStoredCurrentUser();
    const history = user && Array.isArray(user.testHistory) ? user.testHistory : [];

    if (!history.length) {
        container.innerHTML = '<p class="history-empty">Әзірге нәтиже жоқ.</p>';
        return;
    }

    container.innerHTML = history.slice(0, 8).map((entry) => `
        <div class="history-item">
            <div class="history-item-head">
                <strong>${escapeText(entry.title || 'Тест')}</strong>
                <span>${escapeText(entry.percent)}%</span>
            </div>
            <div class="history-item-meta">${escapeText(entry.subject || 'Жалпы пән')} | ${escapeText(entry.modeLabel || entry.mode || '-')}</div>
            <div class="history-item-meta">${escapeText(entry.score)}/${escapeText(entry.total)} | ${escapeText(entry.durationLabel || '-')}</div>
            <div class="history-item-meta">${escapeText(entry.submittedAt || '-')}</div>
        </div>
    `).join('');
}

function addTestResultToHistory(entry) {
    const user = getStoredCurrentUser();
    if (!user || typeof user !== 'object') return;

    const history = Array.isArray(user.testHistory) ? [...user.testHistory] : [];
    history.unshift(entry);
    user.testHistory = history.slice(0, 30);
    saveCurrentUser(user);
    renderTestHistory();
}

function bytesToBase64(bytes) {
    let binary = '';
    const buffer = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    buffer.forEach((value) => {
        binary += String.fromCharCode(value);
    });
    return btoa(binary);
}

function base64ToBytes(value) {
    const binary = atob(String(value || ''));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
}

async function sha256Hex(value) {
    const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(String(value)));
    return Array.from(new Uint8Array(digest))
        .map((item) => item.toString(16).padStart(2, '0'))
        .join('');
}

async function deriveSecretKey(secret, saltBytes, iterations = ENCRYPTION_ITERATIONS) {
    const baseKey = await crypto.subtle.importKey(
        'raw',
        textEncoder.encode(secret),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: saltBytes,
            iterations,
            hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
    );
}

async function decryptUserPayload(secret, payload) {
    const saltBytes = base64ToBytes(payload.salt_b64);
    const ivBytes = base64ToBytes(payload.iv_b64);
    const cipherBytes = base64ToBytes(payload.ciphertext_b64);
    const key = await deriveSecretKey(secret, saltBytes, Number(payload.iterations) || ENCRYPTION_ITERATIONS);
    const plainBuffer = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: ivBytes
        },
        key,
        cipherBytes
    );
    return JSON.parse(new TextDecoder().decode(plainBuffer));
}

async function loadEncryptedUser(secret) {
    const normalizedSecret = String(secret || '').trim();
    if (!normalizedSecret) {
        throw new Error('Secret is empty');
    }

    const fileKey = await sha256Hex(normalizedSecret);
    const response = await fetch(`${ENCRYPTED_USERS_DIR}/${fileKey}.json`, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('User file not found');
    }
    const payload = await response.json();
    return decryptUserPayload(normalizedSecret, payload);
}

function getTestMeta(testId) {
    return TEST_METADATA[String(testId)] || {
        title: 'ҰБТ тесті',
        subject: 'Жалпы бөлім'
    };
}

function formatRunnerTime(totalSeconds) {
    const safeValue = Math.max(0, Number(totalSeconds) || 0);
    const hours = Math.floor(safeValue / 3600);
    const minutes = Math.floor((safeValue % 3600) / 60);
    const seconds = safeValue % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function clearRunnerTimer() {
    if (RUNNER_UI.timerId) {
        clearInterval(RUNNER_UI.timerId);
        RUNNER_UI.timerId = null;
    }
}

function setRunnerTimerDisplay(totalSeconds) {
    const pill = document.getElementById('runnerTimer');
    const value = document.getElementById('runnerTimerValue');
    if (!pill || !value) return;
    const safeValue = Math.max(0, Number(totalSeconds) || 0);
    value.textContent = formatRunnerTime(safeValue);
    pill.classList.toggle('danger', safeValue <= RUNNER_TIMER_WARNING_SECONDS);
}

function getRunnerWidgetStorageKey(widgetId) {
    return `${RUNNER_WIDGET_STORAGE_PREFIX}:${widgetId}`;
}

function saveRunnerWidgetState(widgetId) {
    const widget = document.getElementById(widgetId);
    if (!widget) return;
    const payload = {
        display: widget.style.display || 'none',
        left: widget.style.left || '',
        top: widget.style.top || '',
        zIndex: widget.style.zIndex || ''
    };
    localStorage.setItem(getRunnerWidgetStorageKey(widgetId), JSON.stringify(payload));
}

function restoreRunnerWidgetState(widgetId) {
    const widget = document.getElementById(widgetId);
    const rawState = localStorage.getItem(getRunnerWidgetStorageKey(widgetId));
    if (!widget || !rawState) return;
    try {
        const state = JSON.parse(rawState);
        if (state.display) widget.style.display = state.display;
        if (state.left) widget.style.left = state.left;
        if (state.top) widget.style.top = state.top;
        if (state.zIndex) widget.style.zIndex = state.zIndex;
    } catch {}
}

function bringRunnerWidgetToFront(widget) {
    if (!widget) return;
    RUNNER_UI.topZIndex += 1;
    widget.style.zIndex = String(RUNNER_UI.topZIndex);
}

function toggleRunnerWidget(widgetId) {
    const widget = document.getElementById(widgetId);
    if (!widget) return;
    const nextDisplay = widget.style.display === 'block' ? 'none' : 'block';
    widget.style.display = nextDisplay;
    if (nextDisplay === 'block') {
        bringRunnerWidgetToFront(widget);
    }
    saveRunnerWidgetState(widgetId);
}

function closeRunnerSubjectsModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('runnerSubjectsModal');
    if (modal) modal.hidden = true;
}

function closeRunnerToolsModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('runnerToolsModal');
    if (modal) modal.hidden = true;
}

function isRunnerFullscreenActive() {
    return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
}

function updateRunnerFullscreenButton() {
    const button = document.getElementById('runnerFullscreenBtn');
    if (!button) return;
    button.textContent = isRunnerFullscreenActive() ? 'Толық экраннан шығу' : 'Толық экран';
}

async function toggleRunnerFullscreen() {
    closeRunnerToolsModal();
    try {
        if (isRunnerFullscreenActive()) {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        } else {
            const target = document.documentElement;
            if (target.requestFullscreen) {
                await target.requestFullscreen();
            } else if (target.webkitRequestFullscreen) {
                target.webkitRequestFullscreen();
            }
        }
    } catch (error) {
        console.error('Fullscreen toggle failed:', error);
    } finally {
        updateRunnerFullscreenButton();
    }
}

function bindRunnerFullscreenEvents() {
    if (RUNNER_UI.fullscreenBound) return;
    document.addEventListener('fullscreenchange', updateRunnerFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateRunnerFullscreenButton);
    RUNNER_UI.fullscreenBound = true;
}

function closeRunnerFinishModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('runnerFinishModal');
    if (modal) modal.hidden = true;
}

function openRunnerSubjectsModal() {
    if (RUNNER_UI.activeApi && typeof RUNNER_UI.activeApi.renderSubjectsModal === 'function') {
        RUNNER_UI.activeApi.renderSubjectsModal();
    }
    const modal = document.getElementById('runnerSubjectsModal');
    if (modal) modal.hidden = false;
}

function openRunnerToolsModal() {
    const modal = document.getElementById('runnerToolsModal');
    updateRunnerFullscreenButton();
    if (modal) modal.hidden = false;
}

function openRunnerFinishModal() {
    if (RUNNER_UI.activeApi && typeof RUNNER_UI.activeApi.renderFinishModal === 'function') {
        RUNNER_UI.activeApi.renderFinishModal();
    }
    const modal = document.getElementById('runnerFinishModal');
    if (modal) modal.hidden = false;
}

function confirmRunnerFinish() {
    if (RUNNER_UI.activeApi && typeof RUNNER_UI.activeApi.confirmFinish === 'function') {
        RUNNER_UI.activeApi.confirmFinish();
    }
}

function getCalcDisplay() {
    return document.getElementById('main-display');
}

function getCalcHistory() {
    return document.getElementById('history-view');
}

function ensureRunnerShell() {
    const app = document.getElementById('app');
    if (!app) return null;
    bindRunnerFullscreenEvents();

    if (!app.querySelector('#runnerNavigation')) {
        app.innerHTML = `
          <div class="header" id="runnerHeader"></div>
          <div class="progress-bar" id="progressBar"></div>
          <div class="container">
            <div class="sidebar">
              <div class="sidebar-item" onclick="toggleRunnerWidget('calc-widget')">
                <div class="sidebar-icon">${getRunnerIcon('calculator')}</div>
                <div class="sidebar-text">калькулятор</div>
              </div>
              <div class="sidebar-item" onclick="toggleRunnerWidget('mendeleev-widget')">
                <div class="sidebar-icon">${getRunnerIcon('microscope')}</div>
                <div class="sidebar-text">менделеев</div>
              </div>
              <div class="sidebar-item" onclick="toggleRunnerWidget('solubility-widget')">
                <div class="sidebar-icon">${getRunnerIcon('flask')}</div>
                <div class="sidebar-text">ерігіштік</div>
              </div>
              <div class="sidebar-item" onclick="openRunnerFinishModal()">
                <div class="sidebar-icon">${getRunnerIcon('checkCircle')}</div>
                <div class="sidebar-text">аяқтау</div>
              </div>
              <div class="sidebar-item" onclick="goBackFromTest()">
                <div class="sidebar-icon">${getRunnerIcon('arrowLeft')}</div>
                <div class="sidebar-text">артқа</div>
              </div>
            </div>
            <div class="main-content">
              <div id="quizForm" style="width: 100%; display: flex; flex-direction: column; align-items: center;">
                <div class="question-box" id="question">Жүктелуде...</div>
                <div class="answers" id="options"></div>
                <div class="navigation" id="runnerNavigation"></div>
              </div>
            </div>
          </div>

          <div id="runnerSubjectsModal" class="modal-overlay runner-modal-overlay" hidden onclick="closeRunnerSubjectsModal(event)">
            <div class="modal-content runner-modal-content" onclick="event.stopPropagation()">
              <button type="button" class="close-btn runner-close-btn" onclick="closeRunnerSubjectsModal()">&times;</button>
              <div class="modal-title runner-modal-title">Пәндер тізімі</div>
              <ul class="subject-list runner-subject-list" id="runnerSubjectsList"></ul>
            </div>
          </div>

          <div id="runnerFinishModal" class="modal-overlay runner-modal-overlay" hidden onclick="closeRunnerFinishModal(event)">
            <div class="modal-content runner-modal-content runner-finish-compact" onclick="event.stopPropagation()">
              <button type="button" class="close-btn runner-close-btn" onclick="closeRunnerFinishModal()">&times;</button>
              <div class="modal-title runner-modal-title">Аяқтайсыз ба?</div>
              <div class="runner-finish-summary" id="runnerFinishSummary"></div>
              <div class="finish-actions runner-finish-actions">
                <button type="button" class="finish-btn runner-finish-btn cancel" onclick="closeRunnerFinishModal()">Күшін жою</button>
                <button type="button" class="finish-btn runner-finish-btn confirm" onclick="confirmRunnerFinish()">Растау</button>
              </div>
            </div>
          </div>

          <div id="runnerToolsModal" class="modal-overlay runner-modal-overlay runner-tools-modal" hidden onclick="closeRunnerToolsModal(event)">
            <div class="modal-content runner-modal-content runner-tools-modal-content" onclick="event.stopPropagation()">
              <button type="button" class="close-btn runner-close-btn" onclick="closeRunnerToolsModal()">&times;</button>
              <div class="modal-title runner-modal-title">Құралдар</div>
              <div class="runner-tools-list">
                <button type="button" class="runner-tool-btn" id="runnerFullscreenBtn" onclick="toggleRunnerFullscreen()">Толық экран</button>
                <button type="button" class="runner-tool-btn" onclick="closeRunnerToolsModal(); toggleRunnerWidget('calc-widget')">Калькулятор</button>
                <button type="button" class="runner-tool-btn" onclick="closeRunnerToolsModal(); toggleRunnerWidget('mendeleev-widget')">Менделеев</button>
                <button type="button" class="runner-tool-btn" onclick="closeRunnerToolsModal(); toggleRunnerWidget('solubility-widget')">Ерігіштік</button>
                <button type="button" class="runner-tool-btn" onclick="closeRunnerToolsModal(); openRunnerFinishModal()">Аяқтау</button>
                <button type="button" class="runner-tool-btn danger" onclick="closeRunnerToolsModal(); goBackFromTest()">Артқа</button>
              </div>
            </div>
          </div>

          <div id="calc-widget" class="widget-window runner-widget-window">
            <div class="header-bar runner-widget-header drag-handle">
              <span style="font-size: 12px; font-weight: 600;">Калькулятор</span>
              <button type="button" class="widget-close runner-widget-close" onclick="toggleRunnerWidget('calc-widget')">×</button>
            </div>
            <div class="screen-area runner-calc-screen">
              <div id="history-view" class="history-line runner-calc-history"></div>
              <input type="text" id="main-display" class="main-input runner-calc-display" value="0" readonly>
            </div>
            <div class="grid-layout runner-calc-grid">
              <button type="button" class="btn-op" onclick="specialAction('%')">%</button>
              <button type="button" class="btn-op" onclick="clearEntry()">CE</button>
              <button type="button" class="btn-op" onclick="clearAll()">C</button>
              <button type="button" class="btn-op" onclick="deleteStep()">⌫</button>
              <button type="button" class="btn-op" onclick="specialAction('1/x')">1/x</button>
              <button type="button" class="btn-op" onclick="specialAction('x2')">x²</button>
              <button type="button" class="btn-op" onclick="specialAction('sqrt')">√x</button>
              <button type="button" class="btn-op" onclick="insertOp('/')">÷</button>
              <button type="button" onclick="insertNum('7')">7</button>
              <button type="button" onclick="insertNum('8')">8</button>
              <button type="button" onclick="insertNum('9')">9</button>
              <button type="button" class="btn-op" onclick="insertOp('*')">×</button>
              <button type="button" onclick="insertNum('4')">4</button>
              <button type="button" onclick="insertNum('5')">5</button>
              <button type="button" onclick="insertNum('6')">6</button>
              <button type="button" class="btn-op" onclick="insertOp('-')">-</button>
              <button type="button" onclick="insertNum('1')">1</button>
              <button type="button" onclick="insertNum('2')">2</button>
              <button type="button" onclick="insertNum('3')">3</button>
              <button type="button" class="btn-op" onclick="insertOp('+')">+</button>
              <button type="button" onclick="specialAction('+/-')">±</button>
              <button type="button" onclick="insertNum('0')">0</button>
              <button type="button" onclick="insertNum('.')">,</button>
              <button type="button" class="btn-equal" onclick="processResult()">=</button>
            </div>
          </div>

          <div id="mendeleev-widget" class="widget-window runner-widget-window runner-reference-widget">
            <div class="header-bar runner-widget-header drag-handle">
              <span style="font-size: 12px; font-weight: 600;">Менделеев кестесі</span>
              <button type="button" class="widget-close runner-widget-close" onclick="toggleRunnerWidget('mendeleev-widget')">×</button>
            </div>
            <div class="table-container runner-reference-body">
              <img src="mendeleev.jpg" alt="Менделеев кестесі" class="runner-reference-image">
            </div>
          </div>

          <div id="solubility-widget" class="widget-window runner-widget-window runner-reference-widget">
            <div class="header-bar runner-widget-header drag-handle">
              <span style="font-size: 12px; font-weight: 600;">Ерігіштік кестесі</span>
              <button type="button" class="widget-close runner-widget-close" onclick="toggleRunnerWidget('solubility-widget')">×</button>
            </div>
            <div class="table-container runner-reference-body">
              <img src="erigish.png" alt="Ерігіштік кестесі" class="runner-reference-image">
            </div>
          </div>
        `;
    }

    initRunnerWidgets();
    return app;
}

function initRunnerWidgets() {
    if (RUNNER_UI.widgetsInitialized) return;
    RUNNER_UI.widgetsInitialized = true;

    document.querySelectorAll('.runner-widget-window').forEach((widget) => {
        restoreRunnerWidgetState(widget.id);
        const handle = widget.querySelector('.drag-handle');
        if (!handle) return;

        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        handle.addEventListener('mousedown', (event) => {
            isDragging = true;
            offsetX = widget.offsetLeft - event.clientX;
            offsetY = widget.offsetTop - event.clientY;
            bringRunnerWidgetToFront(widget);
        });

        document.addEventListener('mousemove', (event) => {
            if (!isDragging) return;
            widget.style.left = `${event.clientX + offsetX}px`;
            widget.style.top = `${event.clientY + offsetY}px`;
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            saveRunnerWidgetState(widget.id);
        });
    });

    document.addEventListener('keydown', (event) => {
        const calcWidget = document.getElementById('calc-widget');
        if (!calcWidget || calcWidget.style.display !== 'block') return;

        const key = event.key;
        const isDigit = /^[0-9]$/.test(key);
        const isOperator = ['+', '-', '*', '/'].includes(key);
        const isDot = key === '.' || key === ',';
        const isControl = ['Enter', 'Backspace', 'Escape'].includes(key);

        if (!isDigit && !isOperator && !isDot && !isControl) {
            return;
        }

        if (isDigit) insertNum(key);
        if (isDot) insertNum('.');
        if (isOperator) insertOp(key);
        if (key === 'Enter') {
            event.preventDefault();
            processResult();
        }
        if (key === 'Backspace') {
            event.preventDefault();
            deleteStep();
        }
        if (key === 'Escape') {
            event.preventDefault();
            clearAll();
        }
    });
}

let isNewCalcSession = false;

function insertNum(value) {
    const display = getCalcDisplay();
    if (!display) return;
    if (display.value === '0' || isNewCalcSession) {
        display.value = value;
        isNewCalcSession = false;
        return;
    }
    display.value += value;
}

function insertOp(operator) {
    const display = getCalcDisplay();
    if (!display) return;
    const lastChar = display.value.slice(-1);
    if (['+', '-', '*', '/'].includes(lastChar)) {
        display.value = `${display.value.slice(0, -1)}${operator}`;
    } else {
        display.value += operator;
    }
    isNewCalcSession = false;
}

function clearAll() {
    const display = getCalcDisplay();
    const history = getCalcHistory();
    if (display) display.value = '0';
    if (history) history.textContent = '';
}

function clearEntry() {
    const display = getCalcDisplay();
    if (display) display.value = '0';
}

function deleteStep() {
    const display = getCalcDisplay();
    if (!display) return;
    display.value = display.value.length > 1 ? display.value.slice(0, -1) : '0';
}

function processResult() {
    const display = getCalcDisplay();
    const history = getCalcHistory();
    if (!display) return;

    try {
        const expression = display.value.replace(/,/g, '.').replace(/÷/g, '/').replace(/×/g, '*');
        const result = eval(expression);
        if (history) history.textContent = `${display.value} =`;
        display.value = String(result);
        isNewCalcSession = true;
    } catch {
        display.value = 'Қате';
        setTimeout(clearAll, 900);
    }
}

function specialAction(mode) {
    const display = getCalcDisplay();
    if (!display) return;
    const numericValue = Number.parseFloat(display.value.replace(/,/g, '.'));
    if (!Number.isFinite(numericValue)) return;

    if (mode === 'x2') display.value = String(numericValue * numericValue);
    if (mode === 'sqrt') display.value = String(Math.sqrt(numericValue));
    if (mode === '1/x') display.value = String(1 / numericValue);
    if (mode === '+/-') display.value = String(numericValue * -1);
    if (mode === '%') display.value = String(numericValue / 100);
    isNewCalcSession = true;
}

function normalizeQuestionCount(value) {
    const numeric = Number.parseInt(value, 10);
    if (!Number.isInteger(numeric)) return DEFAULT_TEST_QUESTION_COUNT;
    if (numeric < MIN_TEST_QUESTION_COUNT) return MIN_TEST_QUESTION_COUNT;
    return numeric;
}

function clampNumber(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function getSavedQuestionCount() {
    const rawValue = localStorage.getItem(TEST_QUESTION_COUNT_KEY);
    return normalizeQuestionCount(rawValue);
}

function setSavedQuestionCount(value) {
    const normalized = normalizeQuestionCount(value);
    localStorage.setItem(TEST_QUESTION_COUNT_KEY, String(normalized));
    return normalized;
}

function initQuestionCountSettings() {
    const input = document.getElementById('question-count-input');
    const saveButton = document.getElementById('question-count-save');
    const hint = document.getElementById('question-count-hint');
    if (!input) return;

    const savedCount = getSavedQuestionCount();
    input.value = String(savedCount);
    if (hint) hint.textContent = `Ағымдағысы: ${savedCount} сұрақ (әдепкі ${DEFAULT_TEST_QUESTION_COUNT})`;

    const commit = () => {
        const nextValue = setSavedQuestionCount(input.value);
        input.value = String(nextValue);
        if (hint) {
            hint.textContent = `Сақталды: ${nextValue} сұрақ`;
            hint.classList.add('saved');
            setTimeout(() => {
                hint.textContent = `Ағымдағысы: ${nextValue} сұрақ (әдепкі ${DEFAULT_TEST_QUESTION_COUNT})`;
                hint.classList.remove('saved');
            }, 1400);
        }
    };

    input.addEventListener('change', commit);
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            commit();
        }
    });
    if (saveButton) saveButton.addEventListener('click', commit);
}

function normalizeTestMode(value) {
    if (value === 'exam') return 'exam';
    if (value === 'self-check') return 'self-check';
    if (value === 'instant') return 'instant';
    return DEFAULT_TEST_MODE;
}

function getSavedTestMode() {
    const rawValue = localStorage.getItem(TEST_MODE_KEY);
    return normalizeTestMode(rawValue);
}

function setSavedTestMode(value) {
    const normalized = normalizeTestMode(value);
    localStorage.setItem(TEST_MODE_KEY, normalized);
    return normalized;
}

function getTestModeLabel(mode) {
    const normalized = normalizeTestMode(mode);
    return TEST_MODE_LABELS[normalized] || TEST_MODE_LABELS[DEFAULT_TEST_MODE];
}

function getTestModeDescription(mode) {
    const normalized = normalizeTestMode(mode);
    return TEST_MODE_DESCRIPTIONS[normalized] || TEST_MODE_DESCRIPTIONS[DEFAULT_TEST_MODE];
}

function initTestModeSettings() {
    const select = document.getElementById('test-mode-select');
    const saveButton = document.getElementById('test-mode-save');
    const hint = document.getElementById('test-mode-hint');
    if (!select) return;

    const savedMode = getSavedTestMode();
    select.value = savedMode;
    if (hint) hint.textContent = `Ағымдағы режим: ${getTestModeLabel(savedMode)}. ${getTestModeDescription(savedMode)}`;

    const commit = () => {
        const nextMode = setSavedTestMode(select.value);
        select.value = nextMode;
        if (hint) {
            hint.textContent = `Сақталды: ${getTestModeLabel(nextMode)}`;
            hint.classList.add('saved');
            setTimeout(() => {
                hint.textContent = `Ағымдағы режим: ${getTestModeLabel(nextMode)}. ${getTestModeDescription(nextMode)}`;
                hint.classList.remove('saved');
            }, 1400);
        }
    };

    select.addEventListener('change', commit);
    if (saveButton) saveButton.addEventListener('click', commit);
}

function initResetLocalDataSettings() {
    const resetButton = document.getElementById('reset-local-data-btn');
    const hint = document.getElementById('reset-local-data-hint');
    if (!resetButton) return;

    resetButton.addEventListener('click', () => {
        const confirmed = confirm('Барлық localStorage тазартылады. Жалғастырасыз ба?');
        if (!confirmed) return;

        localStorage.clear();
        if (hint) {
            hint.textContent = 'Барлық дерек өшірілді. Қайта жүктелуде...';
            hint.classList.add('saved');
        }
        window.location.reload();
    });
}

function toLocalCalendarDate(year, month, day) {
    return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function parseCalendarDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '').trim());
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = toLocalCalendarDate(year, month, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
}

function getTodayCalendarDate() {
    const now = new Date();
    return toLocalCalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function addCalendarDays(date, days) {
    const next = new Date(date.getTime());
    next.setDate(next.getDate() + days);
    return toLocalCalendarDate(next.getFullYear(), next.getMonth() + 1, next.getDate());
}

function diffCalendarDays(laterDate, earlierDate) {
    return Math.round((laterDate.getTime() - earlierDate.getTime()) / DAY_IN_MS);
}

function isSameCalendarDate(leftDate, rightDate) {
    return diffCalendarDays(leftDate, rightDate) === 0;
}

function formatFullCalendarDate(date) {
    return `${date.getDate()} ${KZ_MONTHS_FULL[date.getMonth()]} ${date.getFullYear()}`;
}

function setCalendarText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function renderInternalTestDays(container, prevDate, nextDate, today) {
    if (!container) return;

    const totalDays = diffCalendarDays(nextDate, prevDate);
    const items = [];

    for (let offset = 0; offset <= totalDays; offset++) {
        const currentDate = addCalendarDays(prevDate, offset);
        const isStart = offset === 0;
        const isEnd = offset === totalDays;
        const isToday = isSameCalendarDate(currentDate, today);
        const classNames = ['test-calendar-day'];

        if (currentDate < today) classNames.push('is-past');
        if (isStart) classNames.push('is-start');
        if (isEnd) classNames.push('is-next');
        if (isToday) classNames.push('is-today');

        let caption = 'Күтілуде';
        if (isStart && isEnd) caption = 'Тест күні';
        else if (isToday && isEnd) caption = 'Тест күні';
        else if (isStart) caption = 'Өткен тест';
        else if (isEnd) caption = 'Келесі тест';
        else if (isToday) caption = 'Бүгін';
        else if (currentDate < today) caption = 'Өтті';

        items.push(`
            <div class="${classNames.join(' ')}">
                <span class="test-calendar-day-weekday">${KZ_WEEKDAYS_SHORT[currentDate.getDay()]}</span>
                <strong class="test-calendar-day-number">${currentDate.getDate()}</strong>
                <span class="test-calendar-day-month">${KZ_MONTHS_SHORT[currentDate.getMonth()]}</span>
                <span class="test-calendar-day-caption">${caption}</span>
            </div>
        `);
    }

    container.innerHTML = items.join('');

    const focusDay = container.querySelector('.test-calendar-day.is-today')
        || container.querySelector('.test-calendar-day.is-next');
    if (focusDay) {
        focusDay.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}

function initInternalTestCalendar() {
    const root = document.querySelector('.test-calendar-card');
    if (!root) return;

    const title = String(root.dataset.testTitle || 'Ішкі тест').trim() || 'Ішкі тест';
    const prevDate = parseCalendarDate(root.dataset.prevTestDate);
    const nextDate = parseCalendarDate(root.dataset.nextTestDate);
    const badge = document.getElementById('test-calendar-badge');
    const strip = document.getElementById('test-calendar-strip');
    const progressFill = document.getElementById('test-calendar-progress-fill');

    setCalendarText('test-calendar-title', title);

    if (!prevDate || !nextDate || nextDate < prevDate) {
        setCalendarText('test-calendar-days', 'Қате');
        setCalendarText('test-calendar-note', 'Календар даталарын тексеріңіз.');
        setCalendarText('test-calendar-prev', '-');
        setCalendarText('test-calendar-next', '-');
        setCalendarText('test-calendar-range', '-');
        setCalendarText('test-calendar-progress-text', '0% өтті');
        setCalendarText('test-calendar-progress-days', '0 / 0 күн');
        if (progressFill) progressFill.style.width = '0%';
        if (badge) {
            badge.className = 'test-calendar-badge is-finished';
            badge.textContent = 'Қате дата';
        }
        if (strip) {
            strip.innerHTML = '<p class="test-calendar-empty">`data-prev-test-date` және `data-next-test-date` мәндерін дұрыс қойыңыз.</p>';
        }
        return;
    }

    const today = getTodayCalendarDate();
    const totalDaysBetween = diffCalendarDays(nextDate, prevDate);
    const calendarDaysTotal = totalDaysBetween + 1;
    const daysUntilNextTest = diffCalendarDays(nextDate, today);
    const rawProgress = totalDaysBetween === 0
        ? (today >= nextDate ? 1 : 0)
        : diffCalendarDays(today, prevDate) / totalDaysBetween;
    const progress = clampNumber(rawProgress, 0, 1);
    const progressPercent = Math.round(progress * 100);
    const coveredDays = clampNumber(diffCalendarDays(today, prevDate) + 1, 0, calendarDaysTotal);

    setCalendarText('test-calendar-prev', formatFullCalendarDate(prevDate));
    setCalendarText('test-calendar-next', formatFullCalendarDate(nextDate));
    setCalendarText(
        'test-calendar-range',
        `${calendarDaysTotal} күн`
    );
    setCalendarText('test-calendar-progress-text', `${progressPercent}% өтті`);
    setCalendarText('test-calendar-progress-days', `${coveredDays} / ${calendarDaysTotal} күн`);
    if (progressFill) progressFill.style.width = `${progressPercent}%`;

    if (daysUntilNextTest > 0) {
        setCalendarText('test-calendar-days', `${daysUntilNextTest} күн`);
        setCalendarText(
            'test-calendar-note',
            today < prevDate
                ? `Аралық ${formatFullCalendarDate(prevDate)} күні басталады. Келесі тест ${formatFullCalendarDate(nextDate)} күні.`
                : `${title} ${formatFullCalendarDate(nextDate)} күні өтеді.`
        );
        if (badge) {
            badge.className = `test-calendar-badge ${daysUntilNextTest <= 3 ? 'is-urgent' : 'is-active'}`;
            badge.textContent = `${daysUntilNextTest} күн қалды`;
        }
    } else if (daysUntilNextTest === 0) {
        setCalendarText('test-calendar-days', 'Бүгін');
        setCalendarText('test-calendar-note', `Бүгін ${title} күні.`);
        if (badge) {
            badge.className = 'test-calendar-badge is-today';
            badge.textContent = 'Тест күні';
        }
    } else {
        setCalendarText('test-calendar-days', '0 күн');
        setCalendarText(
            'test-calendar-note',
            `Бұл аралық ${formatFullCalendarDate(nextDate)} күні аяқталды. Енді келесі тест күнін жаңартыңыз.`
        );
        if (badge) {
            badge.className = 'test-calendar-badge is-finished';
            badge.textContent = 'Аяқталды';
        }
    }

    renderInternalTestDays(strip, prevDate, nextDate, today);
}

function hashString(value) {
    const text = String(value || '');
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function getUserInitials(name) {
    const parts = String(name || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (!parts.length) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function buildGeneratedAvatar(name) {
    const [startColor, endColor] = AVATAR_COLOR_PALETTE[hashString(name) % AVATAR_COLOR_PALETTE.length];
    const initials = getUserInitials(name);
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${initials}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${startColor}" />
      <stop offset="100%" stop-color="${endColor}" />
    </linearGradient>
  </defs>
  <rect width="96" height="96" fill="url(#g)" />
  <text x="50%" y="53%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="34" font-weight="700">${initials}</text>
</svg>`.trim();

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getUserAvatarSource(user) {
    const avatar = user && typeof user.avatar === 'string' ? user.avatar.trim() : '';
    if (avatar) return avatar;
    return buildGeneratedAvatar(user && user.name ? user.name : '');
}

function applyUserProfile(user) {
    if (!user) return;

    const userName = user.name || 'Пайдаланушы';
    document.querySelectorAll('.username').forEach((el) => {
        el.innerText = userName;
    });

    const welcome = document.querySelector('#welcomename');
    if (welcome) welcome.innerHTML = "Қош келдіңіз, " + userName;

    const avatarSrc = getUserAvatarSource(user);
    document.querySelectorAll('.avatar').forEach((img) => {
        img.src = avatarSrc;
        img.alt = `${userName} avatar`;
        img.onerror = () => {
            img.onerror = null;
            img.src = buildGeneratedAvatar(userName);
        };
    });
}

async function checkPin() {
    const secretInput = document.getElementById('login-secret');
    const submitButton = document.getElementById('login-submit-btn');
    const errorMessage = document.getElementById('error-message');
    const secret = secretInput ? secretInput.value.trim().normalize('NFC') : '';

    if (!secretInput || !secret) {
        if (errorMessage) errorMessage.style.display = 'block';
        if (secretInput) secretInput.focus();
        return;
    }

    if (errorMessage) errorMessage.style.display = 'none';
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Тексерілуде...';
    }

    try {
        const user = await loadEncryptedUser(secret);
        saveCurrentUser(user);
        sendTelegramVisitEvent(user && user.name ? user.name : 'Оқушы');

        const loginScreen = document.getElementById('login-screen');
        const homeMenu = document.getElementById('homemenu') || document.getElementById('app');
        if (loginScreen) loginScreen.style.display = 'none';
        if (homeMenu) homeMenu.style.display = 'flex';
        if (typeof openPage === 'function') openPage('home');

        applyUserProfile(user);
        renderTestHistory();
        if (typeof updateChartDisplay === "function") updateChartDisplay();
        if (typeof initInternalTestCalendar === "function") initInternalTestCalendar();
    } catch (error) {
        if (errorMessage) errorMessage.style.display = 'block';
        if (secretInput) {
            secretInput.value = '';
            secretInput.focus();
        }
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Кіру';
        }
    }
}

const loginSecretInput = document.getElementById('login-secret');
if (loginSecretInput) {
    loginSecretInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            checkPin();
        }
    });
}

// Hide main content initially

const subjects = [
    { key: 'total', title: 'ҰБТ нәтижелері', max: 140 },
    { key: 'sub1', title: 'Информатика нәтижелері', max: 50 },
    { key: 'sub2', title: 'Математика нәтижелері', max: 50 },
    { key: 'hist', title: 'Қазақстан тарихы нәтижелері', max: 20 },
    { key: 'math_s', title: 'Математикалық сауаттылық', max: 10 },
    { key: 'read_s', title: 'Оқу сауаттылығы', max: 10 }
];

let currentIndex = 0;
let myChart = null;

function updateChartDisplay() {
    // 1. LocalStorage-тен оқушыны алу
    var user = getStoredCurrentUser();
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

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = getStoredCurrentUser();
    if (currentUser) applyUserProfile(currentUser);
    renderTestHistory();
    updateChartDisplay();
    initQuestionCountSettings();
    initTestModeSettings();
    initResetLocalDataSettings();
    initInternalTestCalendar();
});

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

    if (!Array.isArray(rankingData) || rankingData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Мәліметтер жүктелуде...</td></tr>';
        return;
    }

    const studentsArray = [...rankingData].sort((a, b) => (b.score || 0) - (a.score || 0));
    tbody.innerHTML = '';
    studentsArray.forEach((student, index) => {
        let medal = "";
        if (index === 0) medal = "🥇";
        else if (index === 1) medal = "🥈";
        else if (index === 2) medal = "🥉";
        else medal = index + 1;
        let row;
      if(user && student.name == user.name){
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

  clearRunnerTimer();
  RUNNER_UI.activeApi = null;
  closeRunnerSubjectsModal();
  closeRunnerFinishModal();
  document.body.classList.remove("is-test-runner");
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

function testgo(x) {
  clearRunnerTimer();
  closeRunnerSubjectsModal();
  closeRunnerFinishModal();

  const selectedTestId = Number(x);
  const selectedTestMeta = getTestMeta(selectedTestId);
  const appRoot = ensureRunnerShell();
  if (!appRoot) return;
  let allQuestions = [];
  const QUESTIONS_PER_TEST = getSavedQuestionCount();
  const ACTIVE_TEST_MODE = getSavedTestMode();
  const EXAM_MODE = 'exam';
  const SELF_CHECK_MODE = 'self-check';
  const HISTORY_ALL_TEST_ID = -1;
  const INFORMATICS_ALL_TEST_ID = -2;
  const ALL_SUBJECTS_TEST_ID = 0;
  const NUMBER_SYSTEM_TEST_ID = 156;
  const NUMBER_BASES = [2, 8, 10, 16];
  const NUMBER_OPS = ["+", "-", "*"];
  const MAX_TEST_OPTIONS = 4;
  let remainingSeconds = 0;
  let totalDurationSeconds = 0;

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

  function formatAnswerHtml(value, answerBase) {
    const normalized = value === undefined || value === null || value === '' ? '—' : String(value);
    if (answerBase && normalized !== '—') return formatWithBase(normalized, answerBase);
    return normalized;
  }

  function normalizeAnswerValue(value) {
    return String(value ?? '').trim();
  }

  function sanitizeQuestionHtml(rawHtml) {
    const template = document.createElement('template');
    template.innerHTML = String(rawHtml || '');

    const blockedTags = ['script', 'iframe', 'object', 'embed', 'link', 'meta', 'style', 'form'];
    blockedTags.forEach((tag) => {
      template.content.querySelectorAll(tag).forEach((node) => node.remove());
    });

    template.content.querySelectorAll('*').forEach((element) => {
      [...element.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = String(attr.value || '').trim().toLowerCase();
        if (name.startsWith('on')) {
          element.removeAttribute(attr.name);
          return;
        }
        if ((name === 'href' || name === 'src') && value.startsWith('javascript:')) {
          element.removeAttribute(attr.name);
        }
      });
    });

    return template.innerHTML;
  }

  function getCorrectAnswer(question) {
    if (!question || typeof question !== 'object') return '';
    if (Array.isArray(question.options) && question.options.length > 0) {
      const firstOption = normalizeAnswerValue(question.options[0]);
      if (firstOption) return firstOption;
    }
    if (question.correct !== undefined && question.correct !== null && normalizeAnswerValue(question.correct) !== '') {
      return normalizeAnswerValue(question.correct);
    }
    if (question.answer !== undefined && question.answer !== null && normalizeAnswerValue(question.answer) !== '') {
      return normalizeAnswerValue(question.answer);
    }
    return '';
  }

  function isAnswerMatch(selected, correct) {
    return normalizeAnswerValue(selected) === normalizeAnswerValue(correct);
  }

  function sanitizeOptions(options) {
    const unique = [];
    const seen = new Set();
    if (!Array.isArray(options)) return unique;

    for (const item of options) {
      const value = normalizeAnswerValue(item);
      if (!value) continue;
      if (seen.has(value)) continue;
      seen.add(value);
      unique.push(value);
    }

    return unique;
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

  function selectDisplayOptions(options, correctAnswer) {
    const normalizedCorrect = normalizeAnswerValue(correctAnswer);
    const normalizedOptions = sanitizeOptions(options);

    if (normalizedCorrect && !normalizedOptions.includes(normalizedCorrect)) {
      normalizedOptions.unshift(normalizedCorrect);
    }

    if (!normalizedOptions.length) return [];
    if (normalizedOptions.length <= MAX_TEST_OPTIONS) return shuffle([...normalizedOptions]);

    const wrongOptions = normalizedOptions.filter((opt) => !isAnswerMatch(opt, normalizedCorrect));
    const neededWrong = Math.max(0, MAX_TEST_OPTIONS - 1);
    const pickedWrong = shuffle([...wrongOptions]).slice(0, neededWrong);
    return shuffle([normalizedCorrect, ...pickedWrong]);
  }

  const allMappedTestIds = Object.keys(TEST_FILES)
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id))
    .sort((a, b) => a - b);
  const historyTestIds = allMappedTestIds.filter((id) => id >= 1 && id <= 149);
  const informaticsTestIds = allMappedTestIds.filter((id) => id >= 150 && id <= 299);

  function attachQuestionMeta(questions, testId) {
    const meta = getTestMeta(testId);
    if (!Array.isArray(questions)) return [];
    return questions.map((question) => {
      if (!question || typeof question !== 'object') return question;
      return {
        ...question,
        __testId: testId,
        __sectionTitle: meta.title,
        __subjectTitle: meta.subject
      };
    });
  }

  function fetchQuestionFile(filePath, testId) {
    return fetch(filePath, { cache: 'no-store' }).then((response) => {
      if (!response.ok) {
        throw new Error(`Файл жүктелмеді: ${filePath} (${response.status})`);
      }
      return response.text().then((rawText) => {
        let questions;
        try {
          questions = JSON.parse(rawText);
        } catch (parseError) {
          throw new Error(`JSON синтаксис қатесі: ${filePath}. ${parseError.message}`);
        }
        return attachQuestionMeta(questions, testId);
      });
    });
  }

  function loadGroupedTests(testIds) {
    const validIds = testIds.filter((testId) => TEST_FILES[testId]);
    if (!validIds.length) {
      return Promise.reject(new Error('Бұл диапазонда тест табылмады.'));
    }

    return Promise.all(validIds.map((testId) => fetchQuestionFile(TEST_FILES[testId], testId)))
      .then((results) => [].concat(...results));
  }

  function loadQuestionsForTest(testId) {
    if (testId === NUMBER_SYSTEM_TEST_ID) {
      return Promise.resolve(attachQuestionMeta(buildNumberSystemQuestions(QUESTIONS_PER_TEST), testId));
    }

    if (testId >= 1 && TEST_FILES[testId]) {
      return fetchQuestionFile(TEST_FILES[testId], testId);
    }

    if (testId === HISTORY_ALL_TEST_ID) {
      return loadGroupedTests(historyTestIds);
    }

    if (testId === INFORMATICS_ALL_TEST_ID) {
      return loadGroupedTests(informaticsTestIds);
    }

    if (testId === ALL_SUBJECTS_TEST_ID) {
      return loadGroupedTests([...historyTestIds, ...informaticsTestIds]);
    }

    return Promise.reject(new Error(`Белгісіз тест ID: ${testId}`));
  }

  function handleLoadError(error) {
    clearRunnerTimer();
    RUNNER_UI.activeApi = null;
    console.error('Тестті жүктеу қатесі:', error);
    alert('Тестті жүктеу кезінде қате шықты. Қайта көріңіз.');
    goBackFromTest();
  }

  function normalizeQuestionText(value) {
    return String(value || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function deduplicateQuestions(pool) {
    const seen = new Set();
    const unique = [];

    for (const item of pool) {
      if (!item || typeof item !== 'object') continue;

      const questionKey = normalizeQuestionText(item.question);
      const fallbackKey = `${normalizeQuestionText(getCorrectAnswer(item))}|${Array.isArray(item.options) ? item.options.map(normalizeQuestionText).join('|') : ''}`;
      const key = questionKey || fallbackKey;
      if (!key) continue;
      if (seen.has(key)) continue;

      seen.add(key);
      unique.push(item);
    }

    return unique;
  }

  let test = [];
  let current = 0;
  let score = 0;
  let mistakes = [];
  let answers = [];
  let instantResults = [];
  let selfCheckLogs = [];
  let lastRenderedQuestionIndex = -1;
  const footerBrand = document.querySelector(".footer-brand");

  document.body.classList.add("is-test-runner");
  const homeMenu = document.getElementById("homemenu");
  if (homeMenu) homeMenu.style.display = "none";
  appRoot.style.display = "block";
  if (footerBrand) footerBrand.style.display = "none";

  loadQuestionsForTest(selectedTestId)
    .then((questions) => {
      allQuestions = Array.isArray(questions) ? questions : [];
      start();
    })
    .catch(handleLoadError);

  function start() {
    const uniquePool = deduplicateQuestions(allQuestions);
    const preparedPool = shuffle(uniquePool.map(prepareQuestion).filter(Boolean));
    const questionCount = Math.min(QUESTIONS_PER_TEST, preparedPool.length);

    if (questionCount < 1) {
      alert('Бұл тестте сұрақ табылмады.');
      goBackFromTest();
      return;
    }

    test = preparedPool.slice(0, questionCount);
    current = 0;
    score = 0;
    mistakes = [];
    answers = Array(questionCount).fill(null);
    instantResults = Array(questionCount).fill(null);
    selfCheckLogs = [];
    remainingSeconds = Math.max(
      300,
      questionCount * (RUNNER_SECONDS_PER_QUESTION[ACTIVE_TEST_MODE] || RUNNER_SECONDS_PER_QUESTION.instant)
    );
    totalDurationSeconds = remainingSeconds;
    RUNNER_UI.activeApi = {
      renderSubjectsModal,
      renderFinishModal,
      confirmFinish: () => finishCurrentTest(true)
    };
    startRunnerTimer();
    render();
  }

  function getAnsweredCount() {
    return answers.filter((value) => value !== null && value !== undefined).length;
  }

  function getExamUnansweredCount() {
    return Math.max(0, test.length - getAnsweredCount());
  }

  function getSectionStats() {
    const sections = [];
    const byKey = new Map();

    test.forEach((question, index) => {
      const key = String(question.sectionId || question.sectionTitle || `section-${index}`);
      if (!byKey.has(key)) {
        const entry = {
          key,
          title: question.sectionTitle || selectedTestMeta.title,
          subject: question.subjectTitle || selectedTestMeta.subject,
          firstIndex: index,
          total: 0,
          answered: 0
        };
        byKey.set(key, entry);
        sections.push(entry);
      }

      const section = byKey.get(key);
      section.total += 1;
      if (answers[index] !== null && answers[index] !== undefined) {
        section.answered += 1;
      }
    });

    return sections.map((section) => ({
      ...section,
      unanswered: Math.max(0, section.total - section.answered)
    }));
  }

  function getCurrentSectionIndex() {
    const sections = getSectionStats();
    if (!sections.length) return 0;
    const safeCurrent = clampNumber(current, 0, Math.max(test.length - 1, 0));
    let activeIndex = 0;

    sections.forEach((section, index) => {
      if (section.firstIndex <= safeCurrent) {
        activeIndex = index;
      }
    });

    return activeIndex;
  }

  function getCurrentSection() {
    const sections = getSectionStats();
    return sections[getCurrentSectionIndex()] || {
      title: selectedTestMeta.title,
      subject: selectedTestMeta.subject,
      firstIndex: 0,
      total: test.length,
      answered: getAnsweredCount(),
      unanswered: getExamUnansweredCount()
    };
  }

  function goToSectionByIndex(index) {
    const sections = getSectionStats();
    const nextSection = sections[index];
    if (!nextSection) return;
    if (ACTIVE_TEST_MODE !== EXAM_MODE && index !== getCurrentSectionIndex()) return;
    current = clampNumber(nextSection.firstIndex, 0, test.length - 1);
    closeRunnerSubjectsModal();
    render();
  }

  function moveSection(step) {
    goToSectionByIndex(getCurrentSectionIndex() + step);
  }

  function startRunnerTimer() {
    clearRunnerTimer();
    setRunnerTimerDisplay(remainingSeconds);
    RUNNER_UI.timerId = setInterval(() => {
      remainingSeconds = Math.max(0, remainingSeconds - 1);
      setRunnerTimerDisplay(remainingSeconds);
      if (remainingSeconds > 0) return;
      clearRunnerTimer();
      finishCurrentTest(true, true);
    }, 1000);
  }

  function prepareQuestion(rawQuestion) {
    const source = rawQuestion && typeof rawQuestion === 'object' ? rawQuestion : {};
    const correct = normalizeAnswerValue(getCorrectAnswer(source));
    const questionText = String(source.question ?? '').trim();
    if (!questionText || !correct) return null;

    const options = sanitizeOptions(source.options);
    if (!options.includes(correct)) options.unshift(correct);
    if (!options.length) options.push(correct);

    return {
      question: questionText,
      correct,
      options,
      displayOptions: selectDisplayOptions(options, correct),
      answerBase: source.answerBase || null,
      useHtml: Boolean(source.useHtml),
      contextText: String(source.contextText ?? source.context_text ?? '').trim(),
      contextText2: String(source.contextText2 ?? source.context_text_2 ?? '').trim(),
      imageUrl: typeof source.image === 'string' ? source.image.trim() : '',
      sectionId: String(source.__testId ?? source.sectionId ?? selectedTestId),
      sectionTitle: String(source.__sectionTitle ?? selectedTestMeta.title),
      subjectTitle: String(source.__subjectTitle ?? selectedTestMeta.subject)
    };
  }

  function escapeText(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCurrentUserName() {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (user && typeof user.name === 'string' && user.name.trim()) {
        return user.name.trim();
      }
    } catch {}
    return 'Оқушы';
  }

  function getCurrentUserProfile() {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch {
      return null;
    }
  }

  function getProgressItemStatus(index) {
    if (ACTIVE_TEST_MODE === EXAM_MODE) {
      if (index === current) return 'current';
      return answers[index] !== null && answers[index] !== undefined ? 'completed' : 'pending';
    }

    if (index < current) return 'completed';
    if (index === current) return 'current';
    return 'pending';
  }

  function getModeQuestionTypeLabel() {
    if (ACTIVE_TEST_MODE === EXAM_MODE) return 'ЕРКІН РЕЖИМ';
    if (ACTIVE_TEST_MODE === SELF_CHECK_MODE) return 'ТҮРТІП ОҚУ РЕЖИМІ';
    return 'ҚАЗІРГІ РЕЖИМ';
  }

  function renderSubjectsModal() {
    const list = document.getElementById('runnerSubjectsList');
    if (!list) return;

    const sections = getSectionStats();
    const activeIndex = getCurrentSectionIndex();
    list.innerHTML = sections.map((section, index) => `
      <li class="subject-item runner-subject-item">
        <button
          type="button"
          class="subject-link runner-subject-link ${index === activeIndex ? 'active' : ''}"
          data-section-index="${index}"
          ${ACTIVE_TEST_MODE !== EXAM_MODE && index !== activeIndex ? 'disabled' : ''}
        >
          <span>${escapeText(section.title)}</span>
          ${index === activeIndex ? `<span>${getRunnerIcon('check')}</span>` : ''}
        </button>
      </li>
    `).join('');

    list.querySelectorAll('[data-section-index]').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.getAttribute('data-section-index'));
        if (!Number.isInteger(index)) return;
        goToSectionByIndex(index);
      });
    });
  }

  function renderFinishModal() {
    const summary = document.getElementById('runnerFinishSummary');
    if (!summary) return;

    const stats = getSectionStats();
    const total = stats.reduce((acc, s) => acc + s.total, 0);
    const answered = stats.reduce((acc, s) => acc + s.answered, 0);
    const left = total - answered;
    summary.textContent = `Жауап берілді: ${answered} / ${total}. Қалды: ${left}.`;
  }

  function renderRunnerHeader(answeredCount, allowProgressScroll = true) {
    const headerRoot = document.getElementById("runnerHeader");
    const progressRoot = document.getElementById("progressBar");
    if (!headerRoot || !progressRoot) return;

    const userName = escapeText(getCurrentUserName());
    const userProfile = getCurrentUserProfile();
    const userAvatar = getUserAvatarSource(userProfile);
    const sections = getSectionStats();
    const currentSectionIndex = getCurrentSectionIndex();
    const currentSection = sections[currentSectionIndex] || getCurrentSection();
    const itemsHtml = test.map((_, index) => {
      const status = getProgressItemStatus(index);
      const baseClass = `progress-item runner-progress-item ${status}`;
      const label = index + 1;
      if (ACTIVE_TEST_MODE === EXAM_MODE) {
        return `<button type="button" class="${baseClass} is-clickable" data-jump-index="${index}">${label}</button>`;
      }
      return `<span class="${baseClass}">${label}</span>`;
    }).join('');

    headerRoot.innerHTML = `
      <div class="header-left">
        <img class="runner-user-avatar" src="${userAvatar}" alt="${userName} avatar">
        <div>
          <span class="header-title">${userName}</span>
        </div>
      </div>
      <div class="header-right">
        <div class="timer-pill runner-timer-pill" id="runnerTimer">
          ${getRunnerIcon('clock')}
          <span class="timer-value runner-timer-value" id="runnerTimerValue">${formatRunnerTime(remainingSeconds)}</span>
        </div>
        <button class="header-btn header-subject" type="button">${escapeText(currentSection.title)}</button>
        <button class="header-btn runner-header-menu-btn" type="button" onclick="openRunnerToolsModal()" aria-label="Құралдар">
          ${getRunnerIcon('menu')}
        </button>
      </div>
    `;
    progressRoot.innerHTML = itemsHtml;

    if (ACTIVE_TEST_MODE === EXAM_MODE) {
      progressRoot.querySelectorAll('[data-jump-index]').forEach((button) => {
        button.addEventListener('click', () => {
          const index = Number(button.getAttribute('data-jump-index'));
          if (!Number.isInteger(index)) return;
          current = clampNumber(index, 0, test.length - 1);
          render();
        });
      });
    }

    const currentItem = progressRoot.querySelector('.runner-progress-item.current');
    if (currentItem && allowProgressScroll) {
      currentItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    setRunnerTimerDisplay(remainingSeconds);
  }

  function goExamStep(step) {
    const next = clampNumber(current + step, 0, test.length - 1);
    if (next === current) return;
    current = next;
    render();
  }

  function finishCurrentTest(skipPrompt = false, isTimedOut = false) {
    const unanswered = getExamUnansweredCount();
    if (!skipPrompt && unanswered > 0) {
      const proceed = confirm(`Әлі ${unanswered} сұрақ жауапсыз. Қазір аяқтайсыз ба?`);
      if (!proceed) return;
    }
    if (isTimedOut) {
      alert('Уақыт аяқталды. Тест автоматты түрде аяқталды.');
    }
    closeRunnerFinishModal();
    current = test.length;
    finish();
  }

  function finishExamWhenReady() {
    finishCurrentTest(false);
  }

  function renderRunnerNavigation() {
    const nav = document.getElementById('runnerNavigation');
    if (!nav) return;

    if (ACTIVE_TEST_MODE === EXAM_MODE) {
      nav.innerHTML = `
        <div class="nav-slot nav-slot-left">
          <button type="button" class="nav-btn runner-nav-btn" data-nav-step="-1" ${current > 0 ? '' : 'disabled'}>Алдыңғы</button>
        </div>
        <div class="nav-slot nav-slot-center">
          <div class="question-counter runner-question-counter">${current + 1}-сұрақ</div>
        </div>
        <div class="nav-slot nav-slot-right">
          <button type="button" class="nav-btn next runner-nav-btn" id="runnerPrimaryNavBtn">${current === test.length - 1 ? 'Аяқтау' : 'Келесі'}</button>
        </div>
      `;

      const prevBtn = nav.querySelector('[data-nav-step="-1"]');
      const primaryBtn = nav.querySelector('#runnerPrimaryNavBtn');
      if (prevBtn) prevBtn.onclick = () => goExamStep(-1);
      if (primaryBtn) {
        primaryBtn.onclick = () => {
          if (current === test.length - 1) {
            openRunnerFinishModal();
            return;
          }
          goExamStep(1);
        };
      }
      return;
    }

    const canAdvance = answers[current] !== null && answers[current] !== undefined;
    nav.innerHTML = `
      <div class="nav-slot nav-slot-left">
        <button type="button" class="nav-btn runner-nav-btn" data-nav-step="-1" ${current > 0 ? '' : 'disabled'}>Алдыңғы</button>
      </div>
      <div class="nav-slot nav-slot-center">
        <div class="question-counter runner-question-counter">${current + 1}-сұрақ</div>
      </div>
      <div class="nav-slot nav-slot-right">
        <button type="button" class="nav-btn next runner-nav-btn" id="runnerQuickFinishBtn" ${!canAdvance ? 'disabled' : ''}>${current === test.length - 1 ? 'Аяқтау' : 'Келесі'}</button>
      </div>
    `;

    const prevBtn = nav.querySelector('[data-nav-step="-1"]');
    const finishBtn = nav.querySelector('#runnerQuickFinishBtn');
    if (prevBtn) {
      prevBtn.onclick = () => {
        current = clampNumber(current - 1, 0, test.length - 1);
        render();
      };
    }
    if (finishBtn) {
      finishBtn.onclick = () => {
        if (current === test.length - 1) {
          openRunnerFinishModal();
          return;
        }
        current++;
        render();
      };
    }
  }

  function render() {
    if (!test.length || current >= test.length) {
      finish();
      return;
    }

    const q = test[current];
    const correctAnswer = q.correct;
    const answeredCount = getAnsweredCount();
    const shouldAutoScrollProgress = current !== lastRenderedQuestionIndex;
    renderRunnerHeader(answeredCount, shouldAutoScrollProgress);
    lastRenderedQuestionIndex = current;

    const questionBox = document.getElementById("question");
    questionBox.innerHTML = `<div class="question-number">${current + 1}</div>`;
    if (q.contextText) {
      const contextPrimary = document.createElement("div");
      contextPrimary.className = "context-text runner-context-text";
      contextPrimary.textContent = q.contextText;
      questionBox.appendChild(contextPrimary);
    }
    if (q.contextText2) {
      const contextSecondary = document.createElement("div");
      contextSecondary.className = "context-text runner-context-text";
      contextSecondary.textContent = q.contextText2;
      questionBox.appendChild(contextSecondary);
    }
    if (q.imageUrl) {
      const imageWrap = document.createElement("div");
      imageWrap.className = "question-image runner-question-image";
      const image = document.createElement("img");
      image.src = q.imageUrl;
      image.alt = "Сұрақ суреті";
      imageWrap.appendChild(image);
      questionBox.appendChild(imageWrap);
    }
    const questionText = document.createElement("div");
    questionText.className = "question-text";
    if (q.useHtml) questionText.innerHTML = sanitizeQuestionHtml(q.question);
    else questionText.innerText = q.question;
    questionBox.appendChild(questionText);

    const box = document.getElementById("options");
    box.innerHTML = "";

    if (ACTIVE_TEST_MODE === SELF_CHECK_MODE) {
      renderSelfCheckMode(box, q, correctAnswer);
      renderRunnerNavigation();
      return;
    }

    if (ACTIVE_TEST_MODE === EXAM_MODE) {
      renderReviewMode(box, q);
      renderRunnerNavigation();
      return;
    }

    const shuffledOptions = q.displayOptions;
    const answeredValue = answers[current];
    const instantState = instantResults[current];
    shuffledOptions.forEach((ans, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "answer";
      btn.onmousedown = (event) => event.preventDefault();
      btn.ontouchstart = () => {};
      btn.dataset.value = ans;
      const letter = document.createElement("div");
      letter.className = "answer-letter";
      letter.textContent = String.fromCharCode(65 + index);
      const content = document.createElement("div");
      content.className = "answer-content";
      const optionText = document.createElement("div");
      optionText.className = "answer-text option-text";
      if (q.answerBase) optionText.innerHTML = formatWithBase(ans, q.answerBase);
      else optionText.innerText = ans;
      content.appendChild(optionText);
      btn.appendChild(letter);
      btn.appendChild(content);
      if (answeredValue !== null && answeredValue !== undefined) {
        btn.style.pointerEvents = "none";
        if (isAnswerMatch(ans, correctAnswer)) btn.classList.add("correct");
        if (isAnswerMatch(ans, answeredValue) && instantState && instantState.isCorrect === false) {
          btn.classList.add("wrong");
        }
        if (isAnswerMatch(ans, answeredValue) && instantState && instantState.isCorrect === true) {
          btn.classList.add("correct");
        }
      } else {
        btn.onclick = () => select(ans, correctAnswer, btn);
      }
      box.appendChild(btn);
    });
    renderRunnerNavigation();
  }

  function renderReviewMode(box, question) {
    const selectedValue = answers[current];
    const options = question.displayOptions;
    box.innerHTML = `<div class="exam-options"></div>`;

    const optionsWrap = box.querySelector(".exam-options");
    if (optionsWrap) {
      options.forEach((ans, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "answer";
        btn.onmousedown = (event) => event.preventDefault();
        btn.ontouchstart = () => {};
        if (isAnswerMatch(selectedValue, ans)) btn.classList.add("selected");
        btn.dataset.value = ans;
        const letter = document.createElement("div");
        letter.className = "answer-letter";
        letter.textContent = String.fromCharCode(65 + index);
        const content = document.createElement("div");
        content.className = "answer-content";
        const optionText = document.createElement("div");
        optionText.className = "answer-text option-text";
        if (question.answerBase) optionText.innerHTML = formatWithBase(ans, question.answerBase);
        else optionText.innerText = ans;
        content.appendChild(optionText);
        btn.appendChild(letter);
        btn.appendChild(content);
        btn.onclick = () => {
          answers[current] = isAnswerMatch(answers[current], ans) ? null : ans;
          render();
        };
        optionsWrap.appendChild(btn);
      });
    }
  }

  function renderSelfCheckMode(box, question, correctAnswer) {
    box.innerHTML = `
      <div class="self-check-card">
        <button type="button" class="self-tap-zone">Түрту арқылы жауапты ашу</button>
        <div class="self-answer" hidden>
          <p class="self-answer-label">Дұрыс жауап:</p>
          <div class="self-answer-value"></div>
        </div>
        <div class="self-actions" hidden>
          <button type="button" class="self-good-btn">Дұрыс ойладым</button>
          <button type="button" class="self-bad-btn">Қате ойладым</button>
        </div>
      </div>
    `;

    const tapZone = box.querySelector(".self-tap-zone");
    const answerWrap = box.querySelector(".self-answer");
    const answerValue = box.querySelector(".self-answer-value");
    const actions = box.querySelector(".self-actions");
    const goodBtn = box.querySelector(".self-good-btn");
    const badBtn = box.querySelector(".self-bad-btn");
    const normalizedAnswer = correctAnswer === undefined || correctAnswer === null || String(correctAnswer).trim() === ''
      ? '—'
      : correctAnswer;

    if (answerValue) {
      if (question.answerBase && normalizedAnswer !== '—') answerValue.innerHTML = formatWithBase(normalizedAnswer, question.answerBase);
      else answerValue.innerText = normalizedAnswer;
    }

    if (tapZone) {
      tapZone.onclick = () => {
        tapZone.disabled = true;
        tapZone.textContent = 'Жауап ашылды';
        tapZone.classList.add('is-revealed');
        if (answerWrap) answerWrap.hidden = false;
        if (actions) actions.hidden = false;
      };
    }

    const lockAndSubmit = (isCorrect) => {
      if (goodBtn) goodBtn.disabled = true;
      if (badBtn) badBtn.disabled = true;
      submitSelfCheckResult(isCorrect, question, correctAnswer);
    };

    if (goodBtn) goodBtn.onclick = () => lockAndSubmit(true);
    if (badBtn) badBtn.onclick = () => lockAndSubmit(false);
  }

  function submitSelfCheckResult(isCorrect, question, correctAnswer) {
    answers[current] = isCorrect ? correctAnswer : '__self_check__';
    if (isCorrect) {
      score++;
    } else {
      mistakes.push({
        question: question.question,
        correct: correctAnswer,
        selected: 'Қате ойладым',
        answerBase: question.answerBase || null,
        selectedAnswerBase: null,
        useHtml: !!question.useHtml
      });
    }

    selfCheckLogs.push({
      question: question.question,
      correct: correctAnswer,
      selected: isCorrect ? 'Дұрыс ойладым' : 'Қате ойладым',
      isCorrect,
      answerBase: question.answerBase || null,
      selectedAnswerBase: null,
      useHtml: !!question.useHtml
    });

    setTimeout(() => {
      current++;
      current < test.length ? render() : finish();
    }, 260);
  }

  function select(selected, correct, btn) {
    if (answers[current] !== null && answers[current] !== undefined) {
      renderRunnerNavigation();
      return;
    }

    if (btn && typeof btn.blur === 'function') btn.blur();
    const buttons = document.querySelectorAll(".answer");
    buttons.forEach(b => b.style.pointerEvents = "none");
    answers[current] = selected;

    if (isAnswerMatch(selected, correct)) {
      score++;
      instantResults[current] = { isCorrect: true };
      btn.classList.add("correct");
    } else {
      instantResults[current] = { isCorrect: false };
      btn.classList.add("wrong");
      mistakes.push({
        question: test[current].question,
        correct: correct,
        selected: selected,
        answerBase: test[current].answerBase || null,
        selectedAnswerBase: test[current].answerBase || null,
        useHtml: !!test[current].useHtml
      });
      
      buttons.forEach(b => {
        if (isAnswerMatch(b.dataset.value, correct)) b.classList.add("correct");
      });
    }
    renderRunnerNavigation();

    setTimeout(() => {
      if (current >= test.length - 1) {
        finish();
        return;
      }
      current++;
      render();
    }, 320);
  }

  function finish() {
    clearRunnerTimer();
    RUNNER_UI.activeApi = null;
    closeRunnerSubjectsModal();
    closeRunnerFinishModal();
    const total = test.length || 1;

    let finalScore = score;
    let finalMistakes = [...mistakes];
    let examReview = [];

    if (ACTIVE_TEST_MODE === EXAM_MODE) {
      examReview = test.map((question, index) => {
        const correct = question.correct;
        const selected = answers[index];
        const isCorrect = isAnswerMatch(selected, correct);

        return {
          question: question.question,
          correct,
          selected: selected ?? 'Жауап берілмеді',
          isCorrect,
          answerBase: question.answerBase || null,
          selectedAnswerBase: (selected === undefined || selected === null) ? null : (question.answerBase || null),
          useHtml: !!question.useHtml
        };
      });
      finalScore = examReview.filter((item) => item.isCorrect).length;
      finalMistakes = examReview.filter((item) => !item.isCorrect);
    }

    if (ACTIVE_TEST_MODE === SELF_CHECK_MODE) {
      finalMistakes = selfCheckLogs.filter((item) => item.isCorrect === false).map((item) => ({
        question: item.question,
        correct: item.correct,
        selected: item.selected,
        answerBase: item.answerBase,
        selectedAnswerBase: item.selectedAnswerBase,
        useHtml: item.useHtml
      }));
    }

    const percent = Math.round((finalScore / total) * 100);
    const spentSeconds = Math.max(0, totalDurationSeconds - remainingSeconds);
    const durationLabel = formatPrettyDuration(spentSeconds);
    const submittedAt = formatTelegramDateTime();
    const resultTitle = ACTIVE_TEST_MODE === SELF_CHECK_MODE ? 'Өзін-өзі тексеру аяқталды' : 'Тест аяқталды';
    const scoreLabel = ACTIVE_TEST_MODE === SELF_CHECK_MODE ? 'Өзіңіз бағалаған нәтиже' : 'Жиналған ұпай';
    const selectedLabel = ACTIVE_TEST_MODE === SELF_CHECK_MODE ? 'Өзіңіз белгіледіңіз:' : 'Сіздің жауабыңыз:';
    const resultEntry = {
      testId: selectedTestId,
      title: selectedTestMeta.title,
      subject: selectedTestMeta.subject,
      mode: ACTIVE_TEST_MODE,
      modeLabel: getTestModeLabel(ACTIVE_TEST_MODE),
      submittedAt,
      durationSeconds: spentSeconds,
      durationLabel,
      score: finalScore,
      total: test.length,
      percent,
      mistakeCount: finalMistakes.length
    };
    addTestResultToHistory(resultEntry);

    sendTelegramTestResult({
      userName: getCurrentUserName(),
      subject: selectedTestMeta.subject,
      title: selectedTestMeta.title,
      modeLabel: getTestModeLabel(ACTIVE_TEST_MODE),
      submittedAt,
      durationLabel,
      score: finalScore,
      total: test.length,
      percent,
      mistakeCount: finalMistakes.length
    });

    const headerRoot = document.getElementById("runnerHeader");
    const progressRoot = document.getElementById("progressBar");
    if (headerRoot) {
      const resultUserName = escapeText(getCurrentUserName());
      const resultUserProfile = getCurrentUserProfile();
      const resultUserAvatar = getUserAvatarSource(resultUserProfile);
      headerRoot.innerHTML = `
        <div class="header-left">
          <img class="runner-user-avatar" src="${resultUserAvatar}" alt="${resultUserName} avatar">
          <div>
            <span class="header-title">${resultUserName}</span>
          </div>
        </div>
        <div class="header-right">
          <button class="header-btn header-subject" type="button">Нәтиже</button>
          <div class="timer-pill" id="runnerTimer">
            ${getRunnerIcon('chart')}
            <span class="timer-value" id="runnerTimerValue">${finalScore} / ${test.length}</span>
          </div>
        </div>
      `;
    }
    if (progressRoot) progressRoot.innerHTML = '';

    const questionBox = document.getElementById("question");
    const box = document.getElementById("options");
    const nav = document.getElementById("runnerNavigation");

    let summaryHtml = `
      <div class="result">
        <div class="score-circle">${percent}%</div>
        <h2>${resultTitle}</h2>
        <p>${scoreLabel}: <b>${finalScore}</b> / ${test.length}</p>
        <p class="result-mode">Режим: ${getTestModeLabel(ACTIVE_TEST_MODE)}</p>
        <p class="result-mode">Уақыт: ${durationLabel}</p>
        <p class="result-mode">Тапсырғаны: ${submittedAt}</p>
      </div>
    `;

    let detailsHtml = '';
    if (ACTIVE_TEST_MODE === EXAM_MODE) {
      detailsHtml += `<div class="mistakes-container"><h3 class="mistakes-title">Толық талдау:</h3>`;
      examReview.forEach((item, index) => {
        const selectedText = formatAnswerHtml(item.selected, item.selectedAnswerBase);
        const correctText = formatAnswerHtml(item.correct, item.answerBase);
        detailsHtml += `
          <div class="mistake-card review-card ${item.isCorrect ? 'is-correct' : 'is-wrong'}">
            <div class="m-number">${index + 1}</div>
            <div class="m-content">
              <div class="review-status">${item.isCorrect ? 'Дұрыс' : 'Қате'}</div>
              <div class="m-question">${item.question}</div>
              <div class="m-details">
                <div class="m-line ${item.isCorrect ? 'correct-line' : 'wrong-line'}">
                  <span class="m-icon">${item.isCorrect ? '✓' : '✕'}</span>
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
      detailsHtml += `</div>`;
    } else if (finalMistakes.length > 0) {
      detailsHtml += `<div class="mistakes-container"><h3 class="mistakes-title">Қателермен жұмыс:</h3>`;
      finalMistakes.forEach((m, index) => {
        const selectedText = formatAnswerHtml(m.selected, m.selectedAnswerBase);
        const correctText = formatAnswerHtml(m.correct, m.answerBase);
        detailsHtml += `
          <div class="mistake-card">
            <div class="m-number">${index + 1}</div>
            <div class="m-content">
              <div class="m-question">${m.question}</div>
              <div class="m-details">
                <div class="m-line wrong-line">
                  <span class="m-icon">✕</span>
                  <span class="m-label">${selectedLabel}</span> 
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
      detailsHtml += `</div>`;
    } else {
      detailsHtml += `<div class="perfect-score">Керемет! Ешқандай қате белгіленбеді.</div>`;
    }

    if (questionBox) questionBox.innerHTML = summaryHtml;
    if (box) box.innerHTML = detailsHtml;
    if (nav) {
      nav.innerHTML = `
        <button type="button" class="runner-nav-btn" id="runnerBackBtn">← Тесттерге оралу</button>
        <div class="runner-question-counter">Нәтиже</div>
        <button type="button" class="runner-nav-btn next" id="runnerRetryBtn">Қайта бастау</button>
      `;

      const backBtn = nav.querySelector('#runnerBackBtn');
      const retryBtn = nav.querySelector('#runnerRetryBtn');
      if (backBtn) backBtn.onclick = () => goBackFromTest();
      if (retryBtn) retryBtn.onclick = () => testgo(selectedTestId);
    }
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
