import { quickAccessItems } from './app.js';
import { saveData } from './firebase.js';
import { updateQuickAccessButtons } from './ui.js';

export function updateQuickAccessModal() {
    const quickAccessGrid = document.getElementById('quick-access-grid');
    if (!quickAccessGrid) return;
    
    quickAccessGrid.innerHTML = '';
    
    if (quickAccessItems.length === 0) {
        quickAccessGrid.innerHTML = `
            <div class="quick-access-empty">
                <div class="quick-access-empty-icon"><i class="fas fa-rocket"></i></div>
                <div>Нет элементов быстрого доступа</div>
                <div style="font-size: 14px; margin-top: 10px;">Добавьте элементы через меню карточек</div>
            </div>
        `;
        return;
    }
    
    quickAccessItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'quick-access-item';
        itemElement.innerHTML = `
            <div class="quick-access-icon">${item.icon}</div>
            <div class="quick-access-text">${item.name}</div>
        `;
        itemElement.addEventListener('click', function() {
            executeQuickAccessAction(item.action);
            document.getElementById('quick-access-modal').classList.remove('active');
        });
        quickAccessGrid.appendChild(itemElement);
    });
}

export function executeQuickAccessAction(action) {
    switch (action) {
        case 'addNote':
            window.editingNoteId = null;
            document.getElementById('note-modal-title').textContent = 'Добавить заметку';
            document.getElementById('note-title').value = '';
            document.getElementById('note-content').value = '';
            document.getElementById('note-modal').classList.add('active');
            break;
        case 'addShoppingItem':
            document.getElementById('shopping-item-modal').classList.add('active');
            break;
        case 'addTravel':
            // Исправляем: открываем модальное окно для добавления путешествия
            window.editingTravelId = null;
            document.getElementById('travel-modal-title').textContent = 'Добавить путешествие';
            document.getElementById('travel-destination').value = '';
            document.getElementById('travel-description').value = '';
            document.getElementById('travel-start-date').value = '';
            document.getElementById('travel-end-date').value = '';
            document.getElementById('travel-budget').value = '';
            document.getElementById('travel-modal').classList.add('active');
            break;
        default:
            // Обработка других действий
            if (action && action.startsWith('openTravel-')) {
                const travelId = action.replace('openTravel-', '');
                // Здесь можно добавить логику для открытия конкретного путешествия
                console.log('Opening travel:', travelId);
            }
            break;
    }
}

export function addToQuickAccess(itemId, itemName, itemIcon, action) {
    // Проверяем, не добавлен ли уже элемент
    const existingIndex = quickAccessItems.findIndex(item => item.id === itemId);
    
    if (existingIndex === -1) {
        quickAccessItems.push({
            id: itemId,
            name: itemName,
            icon: itemIcon,
            action: action
        });
        saveData();
        updateQuickAccessButtons();
    }
}

export function removeFromQuickAccess(itemId) {
    const existingIndex = quickAccessItems.findIndex(item => item.id === itemId);
    
    if (existingIndex !== -1) {
        quickAccessItems.splice(existingIndex, 1);
        saveData();
        updateQuickAccessButtons();
    }
}

// Настройка меню для карточек
export function setupMenuButton(menuBtnId, dropdownId, quickAccessBtnId, itemId, itemName, itemIcon, action) {
    const menuBtn = document.getElementById(menuBtnId);
    const dropdown = document.getElementById(dropdownId);
    const quickAccessBtn = document.getElementById(quickAccessBtnId);
    
    if (menuBtn && dropdown) {
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
    }
    
    if (quickAccessBtn) {
        quickAccessBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isAdded = quickAccessItems.some(item => item.id === itemId);
            
            if (isAdded) {
                removeFromQuickAccess(itemId);
            } else {
                addToQuickAccess(itemId, itemName, itemIcon, action);
            }
            
            dropdown.classList.remove('active');
        });
    }
}