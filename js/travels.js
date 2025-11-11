import { travels, quickAccessItems } from './app.js';
import { saveData } from './firebase.js';

let editingTravelId = null;

export function initializeTravels() {
    updateTravelsGrid();
    setupTravelsEventListeners();
}

export function updateTravelsGrid() {
    const travelsGrid = document.getElementById('travels-grid');
    if (!travelsGrid) return;
    
    travelsGrid.innerHTML = '';
    
    // Карточки путешествий (без карточки добавления)
    travels.forEach(travel => {
        const travelCard = document.createElement('div');
        travelCard.className = 'family-card';
        travelCard.innerHTML = `
            <div class="card-actions">
                <button class="menu-btn" data-id="${travel.id}">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-menu" id="menu-travel-${travel.id}">
                    <button class="dropdown-item edit-item" data-id="${travel.id}">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    <button class="dropdown-item delete-item" data-id="${travel.id}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                    <button class="dropdown-item quick-access-item" data-id="${travel.id}">
                        <i class="fas fa-plus"></i> Быстрый доступ
                    </button>
                </div>
            </div>
            <div class="member-avatar">
                <i class="fas fa-plane"></i>
            </div>
            <div class="member-name">${travel.destination}</div>
            <div class="member-details">${travel.description}</div>
            <div class="member-details">${travel.startDate} - ${travel.endDate}</div>
            <div class="member-details">Бюджет: ${travel.budget || 'Не указан'}</div>
        `;
        travelsGrid.appendChild(travelCard);
    });
    
    setupTravelsCardEventListeners();
}

function setupTravelsEventListeners() {
    const travelModal = document.getElementById('travel-modal');
    const cancelTravel = document.getElementById('cancel-travel');
    const saveTravel = document.getElementById('save-travel');

    if (cancelTravel) cancelTravel.addEventListener('click', function() {
        travelModal.classList.remove('active');
    });

    if (saveTravel) saveTravel.addEventListener('click', function() {
        const destination = document.getElementById('travel-destination').value;
        const description = document.getElementById('travel-description').value;
        const startDate = document.getElementById('travel-start-date').value;
        const endDate = document.getElementById('travel-end-date').value;
        const budget = document.getElementById('travel-budget').value;
        
        if (destination && startDate && endDate) {
            if (editingTravelId) {
                // Редактирование существующего путешествия
                const travelIndex = travels.findIndex(travel => travel.id === editingTravelId);
                if (travelIndex !== -1) {
                    travels[travelIndex].destination = destination;
                    travels[travelIndex].description = description;
                    travels[travelIndex].startDate = startDate;
                    travels[travelIndex].endDate = endDate;
                    travels[travelIndex].budget = budget;
                }
            } else {
                // Добавление нового путешествия
                travels.push({
                    id: Date.now(),
                    destination: destination,
                    description: description,
                    startDate: startDate,
                    endDate: endDate,
                    budget: budget
                });
            }
            
            updateTravelsGrid();
            travelModal.classList.remove('active');
            saveData();
            
            // Очистить форму
            document.getElementById('travel-destination').value = '';
            document.getElementById('travel-description').value = '';
            document.getElementById('travel-start-date').value = '';
            document.getElementById('travel-end-date').value = '';
            document.getElementById('travel-budget').value = '';
        }
    });
}

function setupTravelsCardEventListeners() {
    // Добавляем обработчики для кнопок меню
    document.querySelectorAll('.family-card .menu-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.getAttribute('data-id');
            const menu = document.getElementById(`menu-travel-${id}`);
            
            if (!menu) return;
            
            // Закрыть все открытые меню
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                if (m !== menu && m) m.classList.remove('active');
            });
            
            menu.classList.toggle('active');
        });
    });
    
    // Добавляем обработчики для кнопок редактирования
    document.querySelectorAll('.family-card .edit-item').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            const travel = travels.find(travel => travel.id === id);
            if (travel) {
                editingTravelId = id;
                document.getElementById('travel-modal-title').textContent = 'Редактировать путешествие';
                document.getElementById('travel-destination').value = travel.destination;
                document.getElementById('travel-description').value = travel.description;
                document.getElementById('travel-start-date').value = travel.startDate;
                document.getElementById('travel-end-date').value = travel.endDate;
                document.getElementById('travel-budget').value = travel.budget;
                document.getElementById('travel-modal').classList.add('active');
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
            if (confirm('Вы уверены, что хотите удалить это путешествие?')) {
                const index = travels.findIndex(travel => travel.id === id);
                if (index !== -1) {
                    travels.splice(index, 1);
                    updateTravelsGrid();
                    saveData();
                }
            }
            
            // Закрыть меню
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                if (m) m.classList.remove('active');
            });
        });
    });
    
    // Добавляем обработчики для кнопок быстрого доступа
    document.querySelectorAll('.family-card .quick-access-item').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            const travel = travels.find(travel => travel.id === id);
            if (travel) {
                addTravelToQuickAccess(travel);
            }
            
            // Закрыть меню
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                if (m) m.classList.remove('active');
            });
        });
    });
}

function addTravelToQuickAccess(travel) {
    const existingIndex = quickAccessItems.findIndex(item => item.id === `travel-${travel.id}`);
    
    if (existingIndex === -1) {
        quickAccessItems.push({
            id: `travel-${travel.id}`,
            name: `Путешествие: ${travel.destination}`,
            icon: '✈️',
            action: `openTravel-${travel.id}`
        });
        saveData();
        alert('Путешествие добавлено в быстрый доступ!');
    } else {
        alert('Путешествие уже в быстром доступе!');
    }
}