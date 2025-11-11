import { familyMembers } from './app.js';
import { saveData } from './firebase.js';
import { compressImage } from './ui.js';

let editingFamilyId = null;

export function initializeFamily() {
    updateFamilyGrid();
    setupFamilyEventListeners();
}

export function updateFamilyGrid() {
    const familyGrid = document.getElementById('family-grid');
    if (!familyGrid) return;
    
    familyGrid.innerHTML = '';
    
    // УБИРАЕМ большую карточку добавления
    
    // Только карточки членов семьи
    familyMembers.forEach(member => {
        const memberCard = document.createElement('div');
        memberCard.className = 'family-card';
        memberCard.innerHTML = `
            <div class="card-actions">
                <button class="menu-btn" data-id="${member.id}">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-menu" id="menu-family-${member.id}">
                    <button class="dropdown-item edit-item" data-id="${member.id}">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    <button class="dropdown-item delete-item" data-id="${member.id}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            </div>
            <div class="member-avatar">
                ${member.photo ? 
                    `<img src="${member.photo}" alt="${member.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : 
                    `<i class="fas fa-user"></i>`
                }
            </div>
            <div class="member-name">${member.name}</div>
            <div class="member-details">${member.relation}</div>
            <div class="member-details">${member.birthdate || 'Дата рождения не указана'}</div>
        `;
        familyGrid.appendChild(memberCard);
    });
    
    setupFamilyCardEventListeners();
}

// Остальной код family.js без изменений...

function setupFamilyEventListeners() {
    const familyModal = document.getElementById('family-modal');
    const cancelFamily = document.getElementById('cancel-family');
    const saveFamily = document.getElementById('save-family');

    if (cancelFamily) cancelFamily.addEventListener('click', function() {
        familyModal.classList.remove('active');
    });

    if (saveFamily) saveFamily.addEventListener('click', function() {
        const name = document.getElementById('member-name').value;
        const relation = document.getElementById('member-relation').value;
        const birthdate = document.getElementById('member-birthdate').value;
        const photoFile = document.getElementById('member-photo').files[0];
        
        if (name && relation) {
            const processMember = function(photoData = null) {
                if (editingFamilyId) {
                    // Редактирование существующего члена семьи
                    const memberIndex = familyMembers.findIndex(member => member.id === editingFamilyId);
                    if (memberIndex !== -1) {
                        familyMembers[memberIndex].name = name;
                        familyMembers[memberIndex].relation = relation;
                        familyMembers[memberIndex].birthdate = birthdate;
                        if (photoData) {
                            familyMembers[memberIndex].photo = photoData;
                        }
                    }
                } else {
                    // Добавление нового члена семьи
                    familyMembers.push({
                        id: Date.now(),
                        name: name,
                        relation: relation,
                        birthdate: birthdate,
                        photo: photoData
                    });
                }
                
                updateFamilyGrid();
                familyModal.classList.remove('active');
                saveData();
                
                // Очистить форму
                document.getElementById('member-name').value = '';
                document.getElementById('member-relation').value = '';
                document.getElementById('member-birthdate').value = '';
                document.getElementById('member-photo').value = '';
            };
            
            if (photoFile) {
                compressImage(photoFile, 300, 300, 0.8, function(blob) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        processMember(e.target.result);
                    };
                    reader.readAsDataURL(blob);
                });
            } else {
                processMember();
            }
        }
    });
}

function setupFamilyCardEventListeners() {
    // Добавляем обработчики для кнопок меню
    document.querySelectorAll('.family-card .menu-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.getAttribute('data-id');
            const menu = document.getElementById(`menu-family-${id}`);
            
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
            const member = familyMembers.find(member => member.id === id);
            if (member) {
                editingFamilyId = id;
                document.getElementById('family-modal-title').textContent = 'Редактировать члена семьи';
                document.getElementById('member-name').value = member.name;
                document.getElementById('member-relation').value = member.relation;
                document.getElementById('member-birthdate').value = member.birthdate;
                document.getElementById('family-modal').classList.add('active');
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
            if (confirm('Вы уверены, что хотите удалить этого члена семьи?')) {
                const index = familyMembers.findIndex(member => member.id === id);
                if (index !== -1) {
                    familyMembers.splice(index, 1);
                    updateFamilyGrid();
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