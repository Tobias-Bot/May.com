// Данные приложения
export let lifeSpheres = [
    { id: 1, name: 'Тело', icon: '💪', desc: 'Физическая активность, питание, сон' },
    { id: 2, name: 'Ментальное здоровье', icon: '🧠', desc: 'Медитация, отдых, психологическое состояние' },
    { id: 3, name: 'Смыслы', icon: '🎯', desc: 'Цели, миссия, ценности' },
    { id: 4, name: 'Отношения', icon: '❤️', desc: 'Общение с близкими, друзьями' },
    { id: 5, name: 'Личностный рост и хобби', icon: '📚', desc: 'Обучение, развитие, увлечения' },
    { id: 6, name: 'Дело и финансы', icon: '💰', desc: 'Работа, доходы, инвестиции' },
    { id: 7, name: 'Природа', icon: '🌳', desc: 'Прогулки, экология, связь с природой' },
    { id: 8, name: 'Забота о себе', icon: '🌸', desc: 'Релаксация, уход за собой, удовольствия' }
];

export let familyMembers = [];
export let cars = [];
export let traditions = [];
export let notes = [];
export let shoppingList = [];
export let travels = [];
export let currentDate = new Date();
export let lifeSphereProgress = {};
export let quickAccessItems = [];
export let hiddenSections = [];

// Импорты
import { initializeFirebase } from './firebase.js';
import { initializeLifeSpheresTracker } from './life-spheres.js';
import { initializeFamily } from './family.js';
import { initializeCars } from './cars.js';
import { initializeTraditions, checkReminders } from './traditions.js';
import { initializeNotes } from './notes.js';
import { initializeShopping } from './shopping.js';
import { initializeTravels } from './travels.js';
import { initializeStats } from './stats.js';
import { initializeUI, updateDateTime, updateDateDisplay } from './ui.js';
import { setupMenuButton } from './quick-access.js';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Загружаем скрытые разделы
    loadHiddenSections();
    
    // Инициализируем Firebase
    setTimeout(() => {
        initializeFirebase();
    }, 1000);
    
    // Инициализация всех модулей
    initializeUI();
    initializeLifeSpheresTracker();
    initializeFamily();
    initializeCars();
    initializeTraditions();
    initializeNotes();
    initializeShopping();
    initializeTravels();
    initializeStats();
    
    // Настройка меню быстрого доступа
    setupMenuButtons();
    
    // Настройка скрытия разделов
    setupSectionHiding();
    
    // Настройка кнопки скрытых разделов
    setupHiddenSectionsButton();
    
    // Обновление времени каждую минуту
    updateDateTime();
    setInterval(updateDateTime, 60000);
    
    // Проверка напоминаний каждые 12 часов
    checkReminders();
    setInterval(checkReminders, 12 * 60 * 60 * 1000);
    
    // Обновление отображения даты
    updateDateDisplay();
});

function setupMenuButtons() {
    const menuConfigs = [
        {
            menuBtnId: 'notes-menu-btn',
            dropdownId: 'notes-dropdown-menu',
            quickAccessBtnId: 'quick-access-notes',
            itemId: 'notes',
            itemName: 'Добавить заметку',
            itemIcon: '📝',
            action: 'addNote'
        },
        {
            menuBtnId: 'shopping-menu-btn',
            dropdownId: 'shopping-dropdown-menu',
            quickAccessBtnId: 'quick-access-shopping',
            itemId: 'shopping',
            itemName: 'Добавить покупку',
            itemIcon: '🛒',
            action: 'addShoppingItem'
        },
        {
            menuBtnId: 'travels-menu-btn',
            dropdownId: 'travels-dropdown-menu',
            quickAccessBtnId: 'quick-access-travels',
            itemId: 'travels',
            itemName: 'Добавить путешествие',
            itemIcon: '✈️',
            action: 'addTravel'
        },
        // Добавляем конфигурацию для трекера сфер жизни
        {
            menuBtnId: 'tracker-menu-btn',
            dropdownId: 'tracker-dropdown-menu',
            quickAccessBtnId: null,
            itemId: 'tracker',
            itemName: 'Трекер сфер жизни',
            itemIcon: '🎯',
            action: null
        },
        // Добавляем конфигурацию для автомобилей
        {
            menuBtnId: 'cars-menu-btn',
            dropdownId: 'cars-dropdown-menu',
            quickAccessBtnId: null,
            itemId: 'cars',
            itemName: 'Автомобили',
            itemIcon: '🚗',
            action: null
        },
        // Добавляем конфигурацию для семьи
        {
            menuBtnId: 'family-menu-btn',
            dropdownId: 'family-dropdown-menu',
            quickAccessBtnId: null,
            itemId: 'family',
            itemName: 'Семья',
            itemIcon: '👨‍👩‍👧‍👦',
            action: null
        },
        // Добавляем конфигурацию для традиций
        {
            menuBtnId: 'traditions-menu-btn',
            dropdownId: 'traditions-dropdown-menu',
            quickAccessBtnId: null,
            itemId: 'traditions',
            itemName: 'Традиции',
            itemIcon: '❤️',
            action: null
        }
    ];

    menuConfigs.forEach(config => {
        setupMenuButton(
            config.menuBtnId,
            config.dropdownId,
            config.quickAccessBtnId,
            config.itemId,
            config.itemName,
            config.itemIcon,
            config.action
        );
    });
}

function setupSectionHiding() {
    const hideButtons = {
        'hide-notes-section': 'notes',
        'hide-tracker-section': 'tracker',
        'hide-cars-section': 'cars',
        'hide-family-section': 'family',
        'hide-traditions-section': 'traditions',
        'hide-shopping-section': 'shopping',
        'hide-travels-section': 'travels'
    };

    Object.keys(hideButtons).forEach(btnId => {
        const button = document.getElementById(btnId);
        if (button) {
            button.addEventListener('click', function() {
                hideSection(hideButtons[btnId]);
            });
        }
    });
}

function setupHiddenSectionsButton() {
    const hiddenSectionsBtn = document.getElementById('hidden-sections-btn');
    if (hiddenSectionsBtn) {
        hiddenSectionsBtn.addEventListener('click', function() {
            updateHiddenSectionsModal();
            document.getElementById('hidden-sections-modal').classList.add('active');
        });
    }
    
    // Обновляем видимость кнопки при смене вкладки
    document.querySelectorAll('.nav-item').forEach(navItem => {
        navItem.addEventListener('click', function() {
            setTimeout(updateHiddenSectionsButton, 100);
        });
    });
}

export function updateHiddenSectionsModal() {
    const hiddenSectionsGrid = document.getElementById('hidden-sections-grid');
    if (!hiddenSectionsGrid) return;
    
    hiddenSectionsGrid.innerHTML = '';
    
    const currentTab = getCurrentTab();
    const currentTabSections = getHiddenSectionsForTab(currentTab);
    
    if (currentTabSections.length === 0) {
        hiddenSectionsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon"><i class="fas fa-eye-slash"></i></div>
                <div>На этой вкладке нет скрытых разделов</div>
            </div>
        `;
        return;
    }
    
    currentTabSections.forEach(section => {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'hidden-section-item';
        sectionElement.setAttribute('data-section', section);
        sectionElement.innerHTML = `
            <div class="section-icon-image">${getSectionIcon(section)}</div>
            <div class="section-icon-name">${getSectionName(section)}</div>
            <button class="restore-section-btn" data-section="${section}">
                <i class="fas fa-eye"></i>
            </button>
        `;
        hiddenSectionsGrid.appendChild(sectionElement);
    });
    
    // Добавляем обработчики для кнопок восстановления
    document.querySelectorAll('.restore-section-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            restoreSection(section);
        });
    });
}

function getCurrentTab() {
    const activeTab = document.querySelector('.tab-content.active');
    return activeTab ? activeTab.id : 'overview-tab';
}

function getHiddenSectionsForTab(tabId) {
    const sectionsByTab = {
        'overview-tab': ['notes'],
        'me-tab': ['tracker'],
        'garage-tab': ['cars'],
        'home-tab': ['family', 'traditions', 'shopping', 'travels']
    };
    
    const tabSections = sectionsByTab[tabId] || [];
    return tabSections.filter(section => hiddenSections.includes(section));
}

export function hideSection(section) {
    if (!hiddenSections.includes(section)) {
        hiddenSections.push(section);
        saveHiddenSections();
    }
    
    // Скрываем соответствующий раздел
    const sectionElement = document.getElementById(`${section}-grid`) || 
                          document.getElementById(`${section}-list`) ||
                          document.getElementById('life-spheres-tracker');
    
    if (sectionElement) {
        const dashboardCard = sectionElement.closest('.dashboard-card');
        if (dashboardCard) {
            dashboardCard.style.display = 'none';
        }
    }
    
    // Обновляем кнопку скрытых разделов
    updateHiddenSectionsButton();
}

export function restoreSection(section) {
    hiddenSections = hiddenSections.filter(s => s !== section);
    saveHiddenSections();
    
    // Показываем раздел - ИСПРАВЛЕНИЕ: находим правильный элемент для отображения
    const sectionElement = document.getElementById(`${section}-grid`) || 
                          document.getElementById(`${section}-list`) ||
                          document.getElementById('life-spheres-tracker');
    
    if (sectionElement) {
        const dashboardCard = sectionElement.closest('.dashboard-card');
        if (dashboardCard) {
            dashboardCard.style.display = 'block';
        }
    }
    
    // Обновляем модальное окно
    updateHiddenSectionsModal();
    
    // Обновляем кнопку скрытых разделов
    updateHiddenSectionsButton();
    
    // Закрываем модальное окно, если не осталось скрытых разделов на текущей вкладке
    const currentTabSections = getHiddenSectionsForTab(getCurrentTab());
    if (currentTabSections.length === 0) {
        document.getElementById('hidden-sections-modal').classList.remove('active');
    }
}

export function updateHiddenSectionsButton() {
    const hiddenSectionsBtn = document.getElementById('hidden-sections-btn');
    if (hiddenSectionsBtn) {
        const currentTab = getCurrentTab();
        const currentTabSections = getHiddenSectionsForTab(currentTab);
        
        if (currentTabSections.length > 0) {
            hiddenSectionsBtn.style.display = 'flex';
            const badge = hiddenSectionsBtn.querySelector('.hidden-sections-badge');
            if (badge) {
                badge.textContent = currentTabSections.length;
            }
        } else {
            hiddenSectionsBtn.style.display = 'none';
        }
    }
}

function getSectionName(section) {
    const names = {
        'notes': 'Заметки',
        'tracker': 'Трекер сфер жизни',
        'cars': 'Автомобили',
        'family': 'Семья',
        'traditions': 'Традиции',
        'shopping': 'Список покупок',
        'travels': 'Путешествия'
    };
    return names[section] || section;
}

function getSectionIcon(section) {
    const icons = {
        'notes': '📝',
        'tracker': '🎯',
        'cars': '🚗',
        'family': '👨‍👩‍👧‍👦',
        'traditions': '❤️',
        'shopping': '🛒',
        'travels': '✈️'
    };
    return icons[section] || '📁';
}

export function saveHiddenSections() {
    localStorage.setItem('harmony-hidden-sections', JSON.stringify(hiddenSections));
    if (window.firebaseDatabase) {
        const dbRef = window.firebaseRef(window.firebaseDatabase, 'hiddenSections');
        window.firebaseSet(dbRef, hiddenSections);
    }
}

export function loadHiddenSections() {
    const saved = localStorage.getItem('harmony-hidden-sections');
    if (saved) {
        hiddenSections = JSON.parse(saved);
        // Скрываем разделы при загрузке
        hiddenSections.forEach(section => {
            const sectionElement = document.getElementById(`${section}-grid`) || 
                                  document.getElementById(`${section}-list`) ||
                                  document.getElementById('life-spheres-tracker');
            
            if (sectionElement) {
                const dashboardCard = sectionElement.closest('.dashboard-card');
                if (dashboardCard) {
                    dashboardCard.style.display = 'none';
                }
            }
        });
        
        // Обновляем кнопку скрытых разделов
        updateHiddenSectionsButton();
    }
}

export function resetAllData() {
    if (confirm('Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.')) {
        localStorage.clear();
        if (window.firebaseDatabase) {
            const paths = ['familyMembers', 'cars', 'traditions', 'notes', 'shoppingList', 'travels', 'quickAccessItems', 'lifeSphereProgress', 'hiddenSections'];
            paths.forEach(path => {
                const dbRef = window.firebaseRef(window.firebaseDatabase, path);
                window.firebaseSet(dbRef, null);
            });
        }
        location.reload();
    }
}