import { lifeSpheres, currentDate, lifeSphereProgress } from './app.js';
import { saveData } from './firebase.js';
import { updateLifeSpheresStats } from './stats.js';
import { updateDateDisplay } from './ui.js';

export function initializeLifeSpheresTracker() {
    cleanupOldProgressData();
    updateLifeSpheresTracker();
    setupDateNavigation();
}

export function updateLifeSpheresTracker() {
    const trackerContainer = document.getElementById('life-spheres-tracker');
    if (!trackerContainer) return;
    
    trackerContainer.innerHTML = '';
    
    const dateKey = currentDate.toDateString();
    
    // Инициализируем прогресс для текущей даты, если его нет
    if (!lifeSphereProgress[dateKey]) {
        lifeSphereProgress[dateKey] = lifeSpheres.map(sphere => ({id: sphere.id, tracked: false}));
        saveData();
    }
    
    const todayProgress = lifeSphereProgress[dateKey];
    
    lifeSpheres.forEach(sphere => {
        const progressItem = todayProgress.find(item => item.id === sphere.id);
        const tracked = progressItem ? progressItem.tracked : false;
        
        const sphereElement = document.createElement('div');
        sphereElement.className = `life-sphere-item ${tracked ? 'tracked' : ''}`;
        sphereElement.innerHTML = `
            <div class="life-sphere-icon">${sphere.icon}</div>
            <div class="life-sphere-content">
                <div class="life-sphere-name">${sphere.name}</div>
                <div class="life-sphere-desc">${sphere.desc}</div>
            </div>
            <div class="life-sphere-checkbox">
                <input type="checkbox" ${tracked ? 'checked' : ''} data-id="${sphere.id}">
            </div>
        `;
        
        const checkbox = sphereElement.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', function() {
            const newTrackedState = this.checked;
            
            if (progressItem) {
                progressItem.tracked = newTrackedState;
            } else {
                todayProgress.push({id: sphere.id, tracked: newTrackedState});
            }
            
            sphereElement.classList.toggle('tracked', newTrackedState);
            updateLifeSpheresStats();
            saveData();
        });
        
        trackerContainer.appendChild(sphereElement);
    });
    
    updateLifeSpheresStats();
    updateDateButtonsState();
}

function setupDateNavigation() {
    const prevDayButton = document.getElementById('prev-day');
    const nextDayButton = document.getElementById('next-day');
    
    if (prevDayButton) {
        prevDayButton.addEventListener('click', function() {
            goToPreviousDay();
        });
    }
    
    if (nextDayButton) {
        nextDayButton.addEventListener('click', function() {
            goToNextDay();
        });
    }
    
    updateDateButtonsState();
}

function goToPreviousDay() {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    if (newDate >= firstDayOfMonth) {
        // Полностью пересоздаем дату
        const year = newDate.getFullYear();
        const month = newDate.getMonth();
        const day = newDate.getDate();
        
        currentDate.setFullYear(year, month, day);
        currentDate.setHours(12, 0, 0, 0);
        
        updateDateDisplay();
        updateLifeSpheresTracker();
    }
}

function goToNextDay() {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (newDate <= today) {
        // Полностью пересоздаем дату
        const year = newDate.getFullYear();
        const month = newDate.getMonth();
        const day = newDate.getDate();
        
        currentDate.setFullYear(year, month, day);
        currentDate.setHours(12, 0, 0, 0);
        
        updateDateDisplay();
        updateLifeSpheresTracker();
    }
}

function updateDateButtonsState() {
    const prevDayButton = document.getElementById('prev-day');
    const nextDayButton = document.getElementById('next-day');
    
    if (prevDayButton && nextDayButton) {
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        // Создаем копии для сравнения без времени
        const currentCopy = new Date(currentDate);
        currentCopy.setHours(0, 0, 0, 0);
        const firstDayCopy = new Date(firstDayOfMonth);
        firstDayCopy.setHours(0, 0, 0, 0);
        
        prevDayButton.disabled = currentCopy.getTime() === firstDayCopy.getTime();
        nextDayButton.disabled = currentDate >= today;
    }
}

// Функция для очистки старых данных прогресса
function cleanupOldProgressData() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Удаляем данные за предыдущие месяцы
    Object.keys(lifeSphereProgress).forEach(dateKey => {
        const progressDate = new Date(dateKey);
        if (progressDate.getMonth() !== currentMonth || progressDate.getFullYear() !== currentYear) {
            delete lifeSphereProgress[dateKey];
        }
    });
    
    // Сохраняем очищенные данные
    saveData();
}