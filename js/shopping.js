import { shoppingList } from './app.js';
import { saveData } from './firebase.js';

export function initializeShopping() {
    updateShoppingList();
    setupShoppingEventListeners();
}

export function updateShoppingList() {
    const shoppingListContainer = document.getElementById('shopping-list');
    if (!shoppingListContainer) return;
    
    shoppingListContainer.innerHTML = '';
    
    if (shoppingList.length === 0) {
        shoppingListContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="fas fa-shopping-cart"></i></div>
                <div>Список покупок пуст</div>
            </div>
        `;
        return;
    }
    
    shoppingList.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = `shopping-item ${item.completed ? 'completed' : ''}`;
        itemElement.innerHTML = `
            <input type="checkbox" ${item.completed ? 'checked' : ''} data-id="${item.id}">
            <div class="shopping-item-text">${item.text}</div>
            <button class="menu-btn" data-id="${item.id}">
                <i class="fas fa-ellipsis-v"></i>
            </button>
            <div class="dropdown-menu" id="menu-shopping-${item.id}">
                <button class="dropdown-item delete-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </div>
        `;
        shoppingListContainer.appendChild(itemElement);
    });
    
    // Добавляем кнопку очистки списка, если больше одной покупки
    if (shoppingList.length > 1) {
        const clearButton = document.createElement('div');
        clearButton.className = 'shopping-actions';
        clearButton.innerHTML = `
            <button class="clear-shopping-list">
                <i class="fas fa-trash"></i> Очистить весь список
            </button>
        `;
        shoppingListContainer.appendChild(clearButton);
        
        // Обработчик для кнопки очистки
        const clearBtn = clearButton.querySelector('.clear-shopping-list');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                if (confirm('Вы уверены, что хотите очистить весь список покупок?')) {
                    shoppingList.length = 0;
                    updateShoppingList();
                    saveData();
                }
            });
        }
    }
    
    setupShoppingItemEventListeners();
}

function setupShoppingEventListeners() {
    // Модальное окно для добавления покупки
    const shoppingItemModal = document.getElementById('shopping-item-modal');
    const cancelShoppingItem = document.getElementById('cancel-shopping-item');
    const saveShoppingItem = document.getElementById('save-shopping-item');

    if (cancelShoppingItem) {
        cancelShoppingItem.addEventListener('click', function() {
            if (shoppingItemModal) shoppingItemModal.classList.remove('active');
            const itemNameInput = document.getElementById('shopping-item-name');
            if (itemNameInput) itemNameInput.value = '';
        });
    }

    if (saveShoppingItem) {
        saveShoppingItem.addEventListener('click', function() {
            const itemNameInput = document.getElementById('shopping-item-name');
            if (!itemNameInput) return;
            
            const itemName = itemNameInput.value.trim();
            
            if (itemName) {
                shoppingList.push({
                    id: Date.now(),
                    text: itemName,
                    completed: false
                });
                updateShoppingList();
                saveData();
                if (shoppingItemModal) shoppingItemModal.classList.remove('active');
                itemNameInput.value = '';
            }
        });
    }
}

function setupShoppingItemEventListeners() {
    // Добавляем обработчики для чекбоксов
    document.querySelectorAll('.shopping-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const item = shoppingList.find(item => item.id === id);
            if (item) {
                item.completed = this.checked;
                updateShoppingList();
                saveData();
            }
        });
    });
    
    // Добавляем обработчики для кнопок меню
    document.querySelectorAll('.shopping-item .menu-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.getAttribute('data-id');
            const menu = document.getElementById(`menu-shopping-${id}`);
            
            if (!menu) return;
            
            // Закрыть все открытые меню
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                if (m && m !== menu) m.classList.remove('active');
            });
            
            menu.classList.toggle('active');
        });
    });
    
    // Добавляем обработчики для кнопок удаления
    document.querySelectorAll('.shopping-item .delete-item').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            if (confirm('Вы уверены, что хотите удалить этот пункт?')) {
                const index = shoppingList.findIndex(item => item.id === id);
                if (index !== -1) {
                    shoppingList.splice(index, 1);
                    updateShoppingList();
                    saveData();
                }
            }
            
            // Закрыть меню
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                if (m) m.classList.remove('active');
            });
        });
    });
}