import { cars } from './app.js';
import { saveData } from './firebase.js';
import { compressImage } from './ui.js';

let editingCarId = null;

export function initializeCars() {
    updateCarsGrid();
    setupCarsEventListeners();
}

export function updateCarsGrid() {
    const carsGrid = document.getElementById('cars-grid');
    if (!carsGrid) return;
    
    carsGrid.innerHTML = '';
    
    // Только карточки автомобилей (без большой карточки добавления)
    cars.forEach(car => {
        const carCard = document.createElement('div');
        carCard.className = 'car-card';
        carCard.innerHTML = `
            <div class="card-actions">
                <button class="menu-btn" data-id="${car.id}">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-menu" id="menu-car-${car.id}">
                    <button class="dropdown-item edit-item" data-id="${car.id}">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    <button class="dropdown-item delete-item" data-id="${car.id}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            </div>
            <div class="car-image">
                ${car.image ? `<img src="${car.image}" alt="${car.model}">` : '<div class="car-image-placeholder"><i class="fas fa-car"></i></div>'}
            </div>
            <div class="member-name">${car.model}</div>
            <div class="member-details">Год: ${car.year}</div>
            <div class="member-details">Пробег: ${car.mileage} км</div>
            <div class="member-details">Последнее ТО: ${car.lastService || 'Не указано'}</div>
        `;
        carsGrid.appendChild(carCard);
    });
    
    setupCarsCardEventListeners();
}

function setupCarsEventListeners() {
    const carModal = document.getElementById('car-modal');
    const cancelCar = document.getElementById('cancel-car');
    const saveCar = document.getElementById('save-car');

    if (cancelCar) cancelCar.addEventListener('click', function() {
        carModal.classList.remove('active');
    });

    if (saveCar) saveCar.addEventListener('click', function() {
        const model = document.getElementById('car-model').value;
        const year = document.getElementById('car-year').value;
        const mileage = document.getElementById('car-mileage').value;
        const lastService = document.getElementById('car-last-service').value;
        const imageFile = document.getElementById('car-image').files[0];
        
        if (model && year && mileage) {
            const processCar = function(imageData = null) {
                if (editingCarId) {
                    // Редактирование существующего автомобиля
                    const carIndex = cars.findIndex(car => car.id === editingCarId);
                    if (carIndex !== -1) {
                        cars[carIndex].model = model;
                        cars[carIndex].year = year;
                        cars[carIndex].mileage = mileage;
                        cars[carIndex].lastService = lastService;
                        if (imageData) {
                            cars[carIndex].image = imageData;
                        }
                    }
                } else {
                    // Добавление нового автомобиля
                    cars.push({
                        id: Date.now(),
                        model: model,
                        year: year,
                        mileage: mileage,
                        lastService: lastService,
                        image: imageData
                    });
                }
                
                updateCarsGrid();
                carModal.classList.remove('active');
                saveData();
                
                // Очистить форму
                document.getElementById('car-model').value = '';
                document.getElementById('car-year').value = '';
                document.getElementById('car-mileage').value = '';
                document.getElementById('car-last-service').value = '';
                document.getElementById('car-image').value = '';
            };
            
            if (imageFile) {
                compressImage(imageFile, 800, 600, 0.8, function(blob) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        processCar(e.target.result);
                    };
                    reader.readAsDataURL(blob);
                });
            } else {
                processCar();
            }
        }
    });
}

function setupCarsCardEventListeners() {
    // Добавляем обработчики для кнопок меню
    document.querySelectorAll('.car-card .menu-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.getAttribute('data-id');
            const menu = document.getElementById(`menu-car-${id}`);
            
            // Закрыть все открытые меню
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                if (m !== menu) m.classList.remove('active');
            });
            
            menu.classList.toggle('active');
        });
    });
    
    // Добавляем обработчики для кнопок редактирования
    document.querySelectorAll('.car-card .edit-item').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            const car = cars.find(car => car.id === id);
            if (car) {
                editingCarId = id;
                document.getElementById('car-modal-title').textContent = 'Редактировать автомобиль';
                document.getElementById('car-model').value = car.model;
                document.getElementById('car-year').value = car.year;
                document.getElementById('car-mileage').value = car.mileage;
                document.getElementById('car-last-service').value = car.lastService;
                document.getElementById('car-modal').classList.add('active');
            }
            
            // Закрыть меню
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                m.classList.remove('active');
            });
        });
    });
    
    // Добавляем обработчики для кнопок удаления
    document.querySelectorAll('.car-card .delete-item').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            if (confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
                const index = cars.findIndex(car => car.id === id);
                if (index !== -1) {
                    cars.splice(index, 1);
                    updateCarsGrid();
                    saveData();
                }
            }
            
            // Закрыть меню
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                m.classList.remove('active');
            });
        });
    });
}