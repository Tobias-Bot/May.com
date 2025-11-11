import { traditions } from './app.js';
import { saveData } from './firebase.js';

let editingTraditionId = null;

export function initializeTraditions() {
    updateTraditionsGrid();
    setupTraditionsEventListeners();
}

export function updateTraditionsGrid() {
    const traditionsGrid = document.getElementById('traditions-grid');
    if (!traditionsGrid) return;
    
    traditionsGrid.innerHTML = '';
    
    // Только карточки традиций (без большой карточки добавления)
    traditions.forEach(tradition => {
        const traditionCard = document.createElement('div');
        traditionCard.className = 'family-card';
        traditionCard.innerHTML = `
            <div class="card-actions">
                <button class="menu-btn" data-id="${tradition.id}">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-menu" id="menu-tradition-${tradition.id}">
                    <button class="dropdown-item edit-item" data-id="${tradition.id}">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    <button class="dropdown-item delete-item" data-id="${tradition.id}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            </div>
            <div class="member-avatar">
                <i class="fas fa-heart"></i>
            </div>
            <div class="member-name">${tradition.name}</div>
            <div class="member-details">${tradition.description}</div>
            <div class="member-details">${tradition.date || 'Дата не указана'}</div>
        `;
        traditionsGrid.appendChild(traditionCard);
    });
    
    setupTraditionsCardEventListeners();
}

function setupTraditionsEventListeners() {
    const traditionModal = document.getElementById('tradition-modal');
    const cancelTradition = document.getElementById('cancel-tradition');
    const saveTradition = document.getElementById('save-tradition');

    if (cancelTradition) {
        cancelTradition.addEventListener('click', function() {
            if (traditionModal) traditionModal.classList.remove('active');
        });
    }

    if (saveTradition) {
        saveTradition.addEventListener('click', function() {
            const name = document.getElementById('tradition-name')?.value;
            const description = document.getElementById('tradition-description')?.value;
            const date = document.getElementById('tradition-date')?.value;
            
            if (name && description) {
                if (editingTraditionId) {
                    // Редактирование существующей традиции
                    const traditionIndex = traditions.findIndex(tradition => tradition.id === editingTraditionId);
                    if (traditionIndex !== -1) {
                        traditions[traditionIndex].name = name;
                        traditions[traditionIndex].description = description;
                        traditions[traditionIndex].date = date;
                    }
                } else {
                    // Добавление новой традиции
                    traditions.push({
                        id: Date.now(),
                        name: name,
                        description: description,
                        date: date
                    });
                }
                
                updateTraditionsGrid();
                if (traditionModal) traditionModal.classList.remove('active');
                saveData();
                
                // Очистить форму
                if (document.getElementById('tradition-name')) document.getElementById('tradition-name').value = '';
                if (document.getElementById('tradition-description')) document.getElementById('tradition-description').value = '';
                if (document.getElementById('tradition-date')) document.getElementById('tradition-date').value = '';
            }
        });
    }
}

function setupTraditionsCardEventListeners() {
    // Добавляем обработчики для кнопок меню
    document.querySelectorAll('.family-card .menu-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.getAttribute('data-id');
            const menu = document.getElementById(`menu-tradition-${id}`);
            
            if (!menu) return;
            
            // Закрыть все открытые меню
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                if (m && m !== menu) m.classList.remove('active');
            });
            
            menu.classList.toggle('active');
        });
    });
    
    // Добавляем обработчики для кнопок редактирования
    document.querySelectorAll('.family-card .edit-item').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            const tradition = traditions.find(tradition => tradition.id === id);
            if (tradition) {
                editingTraditionId = id;
                const modalTitle = document.getElementById('tradition-modal-title');
                const traditionModal = document.getElementById('tradition-modal');
                
                if (modalTitle) modalTitle.textContent = 'Редактировать традицию';
                if (document.getElementById('tradition-name')) document.getElementById('tradition-name').value = tradition.name;
                if (document.getElementById('tradition-description')) document.getElementById('tradition-description').value = tradition.description;
                if (document.getElementById('tradition-date')) document.getElementById('tradition-date').value = tradition.date;
                if (traditionModal) traditionModal.classList.add('active');
            }
            
            // Закрыть меню
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                if (m) m.classList.remove('active');
            });
        });
    });
    
    // Добавляем обработчики для кнопок удаления
    document.querySelectorAll('.family-card .delete-item').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            if (confirm('Вы уверены, что хотите удалить эту традицию?')) {
                const index = traditions.findIndex(tradition => tradition.id === id);
                if (index !== -1) {
                    traditions.splice(index, 1);
                    updateTraditionsGrid();
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

// Проверка напоминаний о праздниках и традициях
export function checkReminders() {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    traditions.forEach(tradition => {
        if (tradition.date && tradition.date !== 'Не указана') {
            const traditionDate = new Date(tradition.date.split('.').reverse().join('-'));
            
            // Проверка на неделю до события
            if (traditionDate >= now && traditionDate <= oneWeekFromNow) {
                const daysUntil = Math.ceil((traditionDate - now) / (24 * 60 * 60 * 1000));
                
                if (daysUntil === 7) {
                    alert(`Напоминание: через неделю "${tradition.name}"!`);
                } else if (daysUntil === 1) {
                    alert(`Напоминание: завтра "${tradition.name}"!`);
                } else if (daysUntil === 0) {
                    alert(`Поздравляем! Сегодня "${tradition.name}"!`);
                }
            }
        }
    });
}