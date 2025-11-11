import { currentDate, quickAccessItems, resetAllData } from './app.js';
import { updateLifeSpheresTracker } from './life-spheres.js';
import { updateQuickAccessModal } from './quick-access.js';

let lastScrollTop = 0;
let scrollTimeout = null;
let previousTab = 'overview-tab';

export function initializeUI() {
    setupNavigation();
    setupScrollHandling();
    setupThemeToggle();
    setupBackgroundSettings();
    setupModalEventListeners();
    setupResetData();
    setupDropdownCloseHandlers();
    setupHeaderButtons();
}

export function updateDateTime() {
    const now = new Date();
    const timeElement = document.getElementById('current-time');
    const dateElement = document.getElementById('current-date-large');
    const seasonElement = document.getElementById('season-emoji');
    
    if (timeElement && dateElement && seasonElement) {
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}`;
        
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        dateElement.textContent = now.toLocaleDateString('ru-RU', options);
        
        seasonElement.textContent = getSeasonEmoji();
    }
}

function getSeasonEmoji() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return '🌱';
    if (month >= 5 && month <= 7) return '🌞';
    if (month >= 8 && month <= 10) return '🍂';
    return '❄️';
}

export function updateDateDisplay() {
    const currentDateElement = document.getElementById('current-date');
    if (!currentDateElement) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDateNoTime = new Date(currentDate);
    currentDateNoTime.setHours(0, 0, 0, 0);
    
    const isToday = currentDateNoTime.getTime() === today.getTime();
    
    if (isToday) {
        currentDateElement.textContent = 'Сегодня, ' + currentDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    } else {
        currentDateElement.textContent = currentDate.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
    }
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const settingsBtn = document.querySelector('.settings-btn');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            if (tabId !== 'settings-tab') {
                previousTab = tabId;
            }
            
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            const targetTab = document.getElementById(tabId);
            if (targetTab) targetTab.classList.add('active');
            
            navItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            const activeTab = document.querySelector('.tab-content.active');
            if (activeTab && activeTab.id !== 'settings-tab') {
                previousTab = activeTab.id;
            }
            
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            const settingsTab = document.getElementById(tabId);
            if (settingsTab) settingsTab.classList.add('active');
            
            navItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
        });
    }

    const appsBtn = document.getElementById('apps-btn');
    if (appsBtn) {
        appsBtn.addEventListener('click', function() {
            updateQuickAccessModal();
            const quickAccessModal = document.getElementById('quick-access-modal');
            if (quickAccessModal) quickAccessModal.classList.add('active');
        });
    }
}

export function navigateBackFromSettings() {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const targetTab = document.getElementById(previousTab);
    if (targetTab) targetTab.classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(navItem => {
        navItem.classList.remove('active');
        if (navItem.getAttribute('data-tab') === previousTab) {
            navItem.classList.add('active');
        }
    });
}

function setupScrollHandling() {
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        handleScroll();
        
        scrollTimeout = setTimeout(function() {
            // Сбрасываем флаг скролла через 150ms после остановки
        }, 150);
    });
}

function handleScroll() {
    const floatingNav = document.querySelector('.floating-nav');
    if (!floatingNav) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        floatingNav.classList.add('hidden');
    } else if (scrollTop < lastScrollTop) {
        floatingNav.classList.remove('hidden');
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('dark-theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            const isDark = this.checked;
            document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
            localStorage.setItem('harmony-theme', isDark ? 'dark' : 'light');
        });
    }
}

function setupBackgroundSettings() {
    const backgroundUpload = document.getElementById('background-upload');
    const resetBackground = document.getElementById('reset-background');
    
    if (backgroundUpload) {
        backgroundUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                compressImage(file, 1920, 1080, 0.9, function(blob) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        document.body.style.backgroundImage = `url(${e.target.result})`;
                        localStorage.setItem('harmony-background', e.target.result);
                    };
                    reader.readAsDataURL(blob);
                });
            }
        });
    }
    
    if (resetBackground) {
        resetBackground.addEventListener('click', function() {
            document.body.style.backgroundImage = '';
            localStorage.removeItem('harmony-background');
        });
    }
}

function setupModalEventListeners() {
    const quickAccessModal = document.getElementById('quick-access-modal');
    if (quickAccessModal) {
        quickAccessModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }
    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

function setupResetData() {
    const resetDataBtn = document.getElementById('reset-data');
    if (resetDataBtn) {
        resetDataBtn.addEventListener('click', resetAllData);
    }
}

function setupDropdownCloseHandlers() {
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            if (menu) menu.classList.remove('active');
        });
    });
}

function setupHeaderButtons() {
    // Все кнопки добавления в заголовках
    const headerButtons = {
        'add-note-btn-header': () => openModal('note-modal', 'note-modal-title', 'Добавить заметку'),
        'add-shopping-btn-header': () => openModal('shopping-item-modal'),
        'add-family-btn-header': () => openModal('family-modal', 'family-modal-title', 'Добавить члена семьи'),
        'add-car-btn-header': () => openModal('car-modal', 'car-modal-title', 'Добавить автомобиль'),
        'add-tradition-btn-header': () => openModal('tradition-modal', 'tradition-modal-title', 'Добавить традицию'),
        'add-travel-btn-header': () => openModal('travel-modal', 'travel-modal-title', 'Добавить путешествие'),
        'back-from-settings-btn': navigateBackFromSettings
    };

    Object.keys(headerButtons).forEach(btnId => {
        const button = document.getElementById(btnId);
        if (button) {
            button.addEventListener('click', headerButtons[btnId]);
        }
    });
}

function openModal(modalId, titleId = null, titleText = null) {
    const modal = document.getElementById(modalId);
    if (modal) {
        if (titleId && titleText) {
            const titleElement = document.getElementById(titleId);
            if (titleElement) titleElement.textContent = titleText;
        }
        modal.classList.add('active');
    }
}

export function compressImage(file, maxWidth, maxHeight, quality, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = width * ratio;
                height = height * ratio;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(callback, 'image/jpeg', quality);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

export function updateQuickAccessButtons() {
    const buttons = {
        'quick-access-notes': 'notes',
        'quick-access-shopping': 'shopping',
        'quick-access-travels': 'travels'
    };

    Object.keys(buttons).forEach(btnId => {
        const button = document.getElementById(btnId);
        if (button) {
            const hasItem = quickAccessItems.some(item => item.id === buttons[btnId]);
            button.innerHTML = hasItem ? 
                '<i class="fas fa-check"></i> Убрать из быстрого доступа' : 
                '<i class="fas fa-plus"></i> Быстрый доступ';
        }
    });
}