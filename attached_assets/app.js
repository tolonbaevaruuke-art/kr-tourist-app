// База мест с прямыми ссылками на 2GIS
const locations = [
    {
        id: 1,
        title: "Парк Панфилова",
        category: "nature",
        popular: true,
        desc: "Уютный центральный парк Бишкека с аттракционами и аллеями.",
        gisUrl: "https://2gis.kg/bishkek/search/Парк%20Панфилова"
    },
    {
        id: 2,
        title: "Ресторан Navat (Нават)",
        category: "food",
        popular: true,
        desc: "Национальная кухня, бешбармак и чай с баурсаками.",
        gisUrl: "https://2gis.kg/bishkek/search/Navat"
    },
    {
        id: 3,
        title: "Ущелье Ала-Арча",
        category: "nature",
        popular: true,
        desc: "Высокогорный парк для трекинга и чистого воздуха.",
        gisUrl: "https://2gis.kg/bishkek/search/Ала-Арча"
    },
    {
        id: 4,
        title: "Отель Novotel Bishkek",
        category: "hotel",
        popular: false,
        desc: "Современный отель в центре города.",
        gisUrl: "https://2gis.kg/bishkek/search/Novotel"
    },
    {
        id: 5,
        title: "Кофейня Вспышка",
        category: "food",
        popular: false,
        desc: "Популярные эклеры и отличный кофе в Бишкеке.",
        gisUrl: "https://2gis.kg/bishkek/search/Вспышка"
    }
];

// Знания ИИ-агента для быстрых ответов
const aiKnowledge = {
    weather: "Сейчас в Бишкеке около +22°C, тепло и солнечно. На Иссык-Куле +18°C, а в горах (Ала-Арча) около +14°C — возьмите с собой кофту!",
    restaurants: "Из ресторанов национальной кухни очень рекомендую 'Navat' и 'Faiza' (быстро и вкусно). Для отдыха на свежем воздухе подойдёт 'Supara'. Все адреса есть в 2GIS!",
    parks: "В Бишкеке обязательно посетите Парк Панфилова, Парк Ынтымак и Ботанический сад. В 2GIS удобно посмотреть, какой транспорт туда идет.",
    gis: "Вы можете открыть вьювер 2GIS во вкладке 'Карта & 2GIS' слева или нажимать 'Открыть в 2GIS' на карточках мест!",
    default: "Я могу подсказать погоду, посоветовать парки, рестораны или помогу найти маршрут в 2GIS. Что вас именно интересует?"
};

let activeFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    renderCards();
    setupTabs();
    setupFilters();
    setupSearch();
    setupAIChat();
});

// Отображение карточек
function renderCards(searchQuery = '') {
    const container = document.getElementById('cards-container');
    const countElem = document.getElementById('results-count');

    let filtered = locations.filter(loc => {
        const matchesFilter = activeFilter === 'all' || (activeFilter === 'popular' && loc.popular) || loc.category === activeFilter;
        const matchesSearch = loc.title.toLowerCase().includes(searchQuery.toLowerCase()) || loc.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    countElem.textContent = `(${filtered.length})`;

    if (filtered.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; color: #7A6B56; text-align: center; padding: 20px;">Ничего не найдено.</p>`;
        return;
    }

    container.innerHTML = filtered.map(loc => `
        <div class="card">
            <div>
                <h3>${loc.title}</h3>
                <p>${loc.desc}</p>
            </div>
            <div class="card-footer">
                <a href="${loc.gisUrl}" target="_blank" class="gis-link">📍 Открыть в 2GIS ➔</a>
            </div>
        </div>
    `).join('');
}

// Переключение вкладок
function setupTabs() {
    const btns = document.querySelectorAll('.nav-tabs .btn-primary');
    const contents = document.querySelectorAll('.tab-content');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });
}

// Фильтры
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filters .btn-secondary');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeFilter = btn.getAttribute('data-filter');
            renderCards(document.getElementById('search-input').value);
        });
    });
}

// Поиск
function setupSearch() {
    document.getElementById('search-input').addEventListener('input', (e) => {
        renderCards(e.target.value);
    });
}

// Логика ИИ-агента
function setupAIChat() {
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const chatBox = document.getElementById('chat-messages');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = input.value.trim();
        if (!query) return;

        // Сообщение пользователя
        appendMessage(query, 'user');
        input.value = '';

        // Имитация ответа ИИ
        setTimeout(() => {
            const reply = getAIResponse(query);
            appendMessage(reply, 'ai');
        }, 500);
    });

    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.textContent = text;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function getAIResponse(text) {
        const lower = text.toLowerCase();
        if (lower.includes('погод') || lower.includes('градус') || lower.includes('дождь')) {
            return aiKnowledge.weather;
        } else if (lower.includes('ресторан') || lower.includes('поесть') || lower.includes('еда') || lower.includes('кафе')) {
            return aiKnowledge.restaurants;
        } else if (lower.includes('парк') || lower.includes('гулять') || lower.includes('природ')) {
            return aiKnowledge.parks;
        } else if (lower.includes('2gis') || lower.includes('карт') || lower.includes('адрес')) {
            return aiKnowledge.gis;
        } else {
            return aiKnowledge.default;
        }
    }
}// База мест с прямыми ссылками на 2GIS
const locations = [
    {
        id: 1,
        title: "Парк Панфилова",
        category: "nature",
        popular: true,
        desc: "Уютный центральный парк Бишкека с аттракционами и аллеями.",
        gisUrl: "https://2gis.kg/bishkek/search/Парк%20Панфилова"
    },
    {
        id: 2,
        title: "Ресторан Navat (Нават)",
        category: "food",
        popular: true,
        desc: "Национальная кухня, бешбармак и чай с баурсаками.",
        gisUrl: "https://2gis.kg/bishkek/search/Navat"
    },
    {
        id: 3,
        title: "Ущелье Ала-Арча",
        category: "nature",
        popular: true,
        desc: "Высокогорный парк для трекинга и чистого воздуха.",
        gisUrl: "https://2gis.kg/bishkek/search/Ала-Арча"
    },
    {
        id: 4,
        title: "Отель Novotel Bishkek",
        category: "hotel",
        popular: false,
        desc: "Современный отель в центре города.",
        gisUrl: "https://2gis.kg/bishkek/search/Novotel"
    },
    {
        id: 5,
        title: "Кофейня Вспышка",
        category: "food",
        popular: false,
        desc: "Популярные эклеры и отличный кофе в Бишкеке.",
        gisUrl: "https://2gis.kg/bishkek/search/Вспышка"
    }
];

// Знания ИИ-агента для быстрых ответов
const aiKnowledge = {
    weather: "Сейчас в Бишкеке около +22°C, тепло и солнечно. На Иссык-Куле +18°C, а в горах (Ала-Арча) около +14°C — возьмите с собой кофту!",
    restaurants: "Из ресторанов национальной кухни очень рекомендую 'Navat' и 'Faiza' (быстро и вкусно). Для отдыха на свежем воздухе подойдёт 'Supara'. Все адреса есть в 2GIS!",
    parks: "В Бишкеке обязательно посетите Парк Панфилова, Парк Ынтымак и Ботанический сад. В 2GIS удобно посмотреть, какой транспорт туда идет.",
    gis: "Вы можете открыть вьювер 2GIS во вкладке 'Карта & 2GIS' слева или нажимать 'Открыть в 2GIS' на карточках мест!",
    default: "Я могу подсказать погоду, посоветовать парки, рестораны или помогу найти маршрут в 2GIS. Что вас именно интересует?"
};

let activeFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    renderCards();
    setupTabs();
    setupFilters();
    setupSearch();
    setupAIChat();
});

// Отображение карточек
function renderCards(searchQuery = '') {
    const container = document.getElementById('cards-container');
    const countElem = document.getElementById('results-count');

    let filtered = locations.filter(loc => {
        const matchesFilter = activeFilter === 'all' || (activeFilter === 'popular' && loc.popular) || loc.category === activeFilter;
        const matchesSearch = loc.title.toLowerCase().includes(searchQuery.toLowerCase()) || loc.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    countElem.textContent = `(${filtered.length})`;

    if (filtered.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; color: #7A6B56; text-align: center; padding: 20px;">Ничего не найдено.</p>`;
        return;
    }

    container.innerHTML = filtered.map(loc => `
        <div class="card">
            <div>
                <h3>${loc.title}</h3>
                <p>${loc.desc}</p>
            </div>
            <div class="card-footer">
                <a href="${loc.gisUrl}" target="_blank" class="gis-link">📍 Открыть в 2GIS ➔</a>
            </div>
        </div>
    `).join('');
}

// Переключение вкладок
function setupTabs() {
    const btns = document.querySelectorAll('.nav-tabs .btn-primary');
    const contents = document.querySelectorAll('.tab-content');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });
}

// Фильтры
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filters .btn-secondary');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeFilter = btn.getAttribute('data-filter');
            renderCards(document.getElementById('search-input').value);
        });
    });
}

// Поиск
function setupSearch() {
    document.getElementById('search-input').addEventListener('input', (e) => {
        renderCards(e.target.value);
    });
}

// Логика ИИ-агента
function setupAIChat() {
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const chatBox = document.getElementById('chat-messages');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = input.value.trim();
        if (!query) return;

        // Сообщение пользователя
        appendMessage(query, 'user');
        input.value = '';

        // Имитация ответа ИИ
        setTimeout(() => {
            const reply = getAIResponse(query);
            appendMessage(reply, 'ai');
        }, 500);
    });

    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.textContent = text;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function getAIResponse(text) {
        const lower = text.toLowerCase();
        if (lower.includes('погод') || lower.includes('градус') || lower.includes('дождь')) {
            return aiKnowledge.weather;
        } else if (lower.includes('ресторан') || lower.includes('поесть') || lower.includes('еда') || lower.includes('кафе')) {
            return aiKnowledge.restaurants;
        } else if (lower.includes('парк') || lower.includes('гулять') || lower.includes('природ')) {
            return aiKnowledge.parks;
        } else if (lower.includes('2gis') || lower.includes('карт') || lower.includes('адрес')) {
            return aiKnowledge.gis;
        } else {
            return aiKnowledge.default;
        }
    }
}