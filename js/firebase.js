import { familyMembers, cars, traditions, notes, shoppingList, quickAccessItems, lifeSpheres, lifeSphereProgress, travels, hiddenSections } from './app.js';
import { updateNotesGrid } from './notes.js';
import { updateShoppingList } from './shopping.js';
import { updateLifeSpheresTracker } from './life-spheres.js';
import { updateLifeSpheresStats } from './stats.js';
import { updateQuickAccessButtons } from './ui.js';

let database = null;

export function initializeFirebase() {
    showLoadingIndicator();
    
    loadBackgroundFromLocalStorage();
    
    if (window.firebaseDatabase) {
        database = window.firebaseDatabase;
        loadFirebaseData();
    } else {
        setTimeout(() => {
            loadLocalData();
            hideLoadingIndicator();
        }, 1000);
    }
}

function loadBackgroundFromLocalStorage() {
    const savedBackground = localStorage.getItem('harmony-background');
    if (savedBackground && savedBackground !== 'null' && savedBackground !== 'undefined') {
        document.body.style.backgroundImage = `url(${savedBackground})`;
    }
}

function loadFirebaseData() {
    if (!database) return;

    const paths = [
        'familyMembers', 'cars', 'traditions', 'notes', 
        'shoppingList', 'travels', 'quickAccessItems', 'lifeSphereProgress', 'hiddenSections'
    ];

    let loadedCount = 0;
    const totalPaths = paths.length;

    paths.forEach(path => {
        const dbRef = window.firebaseRef(database, path);
        window.firebaseOnValue(dbRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                updateDataArray(path, data);
            }
            
            loadedCount++;
            if (loadedCount === totalPaths) {
                hideLoadingIndicator();
            }
        });
    });

    setTimeout(() => {
        if (loadedCount < totalPaths) {
            loadLocalData();
            hideLoadingIndicator();
        }
    }, 3000);
}

function updateDataArray(path, data) {
    switch(path) {
        case 'familyMembers':
            familyMembers.length = 0;
            familyMembers.push(...data);
            updateFamilyGrid();
            break;
        case 'cars':
            cars.length = 0;
            cars.push(...data);
            updateCarsGrid();
            break;
        case 'traditions':
            traditions.length = 0;
            traditions.push(...data);
            updateTraditionsGrid();
            break;
        case 'notes':
            notes.length = 0;
            notes.push(...data);
            updateNotesGrid();
            break;
        case 'shoppingList':
            shoppingList.length = 0;
            shoppingList.push(...data);
            updateShoppingList();
            break;
        case 'travels':
            travels.length = 0;
            travels.push(...data);
            updateTravelsGrid();
            break;
        case 'quickAccessItems':
            quickAccessItems.length = 0;
            quickAccessItems.push(...data);
            updateQuickAccessButtons();
            break;
        case 'lifeSphereProgress':
            Object.keys(data).forEach(key => {
                lifeSphereProgress[key] = data[key];
            });
            updateLifeSpheresTracker();
            updateLifeSpheresStats();
            break;
        case 'hiddenSections':
            hiddenSections.length = 0;
            hiddenSections.push(...data);
            break;
    }
}

export function loadLocalData() {
    const savedData = {
        'harmony-family': familyMembers,
        'harmony-cars': cars,
        'harmony-traditions': traditions,
        'harmony-notes': notes,
        'harmony-shopping-list': shoppingList,
        'harmony-travels': travels,
        'harmony-sphere-progress': lifeSphereProgress,
        'harmony-quick-access': quickAccessItems,
        'harmony-hidden-sections': hiddenSections
    };

    Object.keys(savedData).forEach(key => {
        const saved = localStorage.getItem(key);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(savedData[key])) {
                savedData[key].length = 0;
                savedData[key].push(...parsed);
            } else if (typeof savedData[key] === 'object') {
                Object.keys(parsed).forEach(prop => {
                    savedData[key][prop] = parsed[prop];
                });
            }
        }
    });

    const savedTheme = localStorage.getItem('harmony-theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        const themeToggle = document.getElementById('dark-theme-toggle');
        if (themeToggle) themeToggle.checked = savedTheme === 'dark';
    }
}

export function saveData() {
    try {
        // Сохраняем все данные в localStorage
        localStorage.setItem('harmony-family', JSON.stringify(familyMembers));
        localStorage.setItem('harmony-cars', JSON.stringify(cars));
        localStorage.setItem('harmony-traditions', JSON.stringify(traditions));
        localStorage.setItem('harmony-notes', JSON.stringify(notes));
        localStorage.setItem('harmony-shopping-list', JSON.stringify(shoppingList));
        localStorage.setItem('harmony-travels', JSON.stringify(travels));
        localStorage.setItem('harmony-sphere-progress', JSON.stringify(lifeSphereProgress));
        localStorage.setItem('harmony-quick-access', JSON.stringify(quickAccessItems));
        localStorage.setItem('harmony-hidden-sections', JSON.stringify(hiddenSections));
        localStorage.setItem('harmony-theme', document.body.getAttribute('data-theme') || 'light');
        
        // Сохраняем фон
        const background = document.body.style.backgroundImage;
        if (background && background !== 'none') {
            const backgroundUrl = background.replace('url("', '').replace('")', '');
            localStorage.setItem('harmony-background', backgroundUrl);
        }
        
        // Данные для Firebase
        if (database) {
            saveToFirebase('familyMembers', familyMembers);
            saveToFirebase('cars', cars);
            saveToFirebase('traditions', traditions);
            saveToFirebase('notes', notes);
            saveToFirebase('shoppingList', shoppingList);
            saveToFirebase('travels', travels);
            saveToFirebase('quickAccessItems', quickAccessItems);
            saveToFirebase('lifeSphereProgress', lifeSphereProgress);
            saveToFirebase('hiddenSections', hiddenSections);
        }
    } catch (e) {
        console.error('Ошибка сохранения данных:', e);
    }
}

function saveToFirebase(path, data) {
    if (!database) return;
    
    try {
        const dbRef = window.firebaseRef(database, path);
        window.firebaseSet(dbRef, data);
    } catch (error) {
        console.error('Firebase save error:', error);
    }
}

function showLoadingIndicator() {
    let loader = document.getElementById('loading-indicator');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loading-indicator';
        loader.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">Загрузка данных...</div>
        `;
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-size: 18px;
        `;
        
        document.body.appendChild(loader);
    }
    loader.style.display = 'flex';
}

function hideLoadingIndicator() {
    const loader = document.getElementById('loading-indicator');
    if (loader) {
        loader.style.display = 'none';
    }
}