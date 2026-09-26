// Данные мест
const locations = [
    {
        id: 1,
        title: "Озеро Иссык-Куль",
        category: "nature",
        popular: true,
        desc: "Жемчужина Кыргызстана. Второе по величине высокогорное озеро в мире.",
        price: "От 1500 KGS / ночь"
    },
    {
        id: 2,
        title: "Ущелье Ала-Арча",
        category: "nature",
        popular: true,
        desc: "Национальный парк в 40 км от Бишкека. Идеально для трекинга и пикников.",
        price: "Вход 700 KGS"
    },
    {
        id: 3,
        title: "Отель Hyatt Regency",
        category: "hotel",
        popular: false,
        desc: "Пятизвездочный отель в центре Бишкека со всеми удобствами.",
        price: "Премиум"
    },
    {
        id: 4,
        title: "Ресторан Нават",
        category: "food",
        popular: true,
        desc: "Сеть ресторанов национальной кухни. Бешбармак, лагман, плов.",
        price: "Средний чек 800 KGS"
    },
    {
        id: 5,
        title: "Озеро Сон-Куль",
        category: "nature",
        popular: false,
        desc: "Высокогорное озеро, где можно пожить в настоящих юртах кочевников.",
        price: "От 2000 KGS"
    }
];

let activeFilter = 'all';

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    renderCards();
    setupTabs();
    setupFilters();
    setupSearch();
});

// Отображение карточек
function renderCards(searchQuery = '') {
    const container = document.getElementById('cards-container');
    const countElem = document.getElementById('results-count');

    let filtered = locations.filter(loc => {
        const matchesFilter = 
            activeFilter === 'all' || 
            (activeFilter === 'popular' && loc.popular) ||
            loc.category === activeFilter;

        const matchesSearch = loc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              loc.desc.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    countElem.textContent = `(${filtered.length})`;

    if (filtered.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; color: #94a3b8; text-align: center; padding: 20px;">Ничего не найдено — попробуйте изменить запрос.</p>`;
        return;
    }

    container.innerHTML = filtered.map(loc => `
        <div class="card">
            <div>
                <span class="card-tag">${loc.category.toUpperCase()}</span>
                <h3>${loc.title}</h3>
                <p>${loc.desc}</p>
            </div>
            <div class="card-footer">
                <span>${loc.price}</span>
            </div>
        </div>
    `).join('');
}

// Переключение верхних вкладок
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });
}

// Переключение фильтров
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeFilter = btn.getAttribute('data-filter');
            const searchValue = document.getElementById('search-input').value;
            renderCards(searchValue);
        });
    });
}

// Живой поиск
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        renderCards(e.target.value);
    });
}