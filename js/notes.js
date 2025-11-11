import { notes } from './app.js';
import { saveData } from './firebase.js';

let editingNoteId = null;

export function initializeNotes() {
    updateNotesGrid();
    setupNotesEventListeners();
}

export function updateNotesGrid() {
    const notesGrid = document.getElementById('notes-grid');
    if (!notesGrid) return;
    
    notesGrid.innerHTML = '';
    
    if (notes.length === 0) {
        notesGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon"><i class="fas fa-sticky-note"></i></div>
                <div>Пока нет заметок</div>
            </div>
        `;
        return;
    }
    
    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-card';
        noteElement.innerHTML = `
            <div class="note-actions">
                <button class="menu-btn" data-id="${note.id}">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-menu" id="menu-note-${note.id}">
                    <button class="dropdown-item edit-item" data-id="${note.id}">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    <button class="dropdown-item delete-item" data-id="${note.id}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            </div>
            <div class="note-title">${note.title}</div>
            <div class="note-content">${note.content}</div>
            <div class="note-date">${note.date}</div>
        `;
        notesGrid.appendChild(noteElement);
    });
    
    setupNotesCardEventListeners();
}

function setupNotesEventListeners() {
    // Модальное окно для добавления/редактирования заметки
    const noteModal = document.getElementById('note-modal');
    const cancelNote = document.getElementById('cancel-note');
    const saveNote = document.getElementById('save-note');
    const noteContent = document.getElementById('note-content');

    // Добавляем ограничение символов для текста заметки
    if (noteContent) {
        noteContent.addEventListener('input', function() {
            const maxLength = 500;
            const currentLength = this.value.length;
            const counter = document.getElementById('note-counter') || createCounter();
            
            counter.textContent = `${currentLength}/${maxLength}`;
            
            if (currentLength > maxLength) {
                this.value = this.value.substring(0, maxLength);
                counter.textContent = `${maxLength}/${maxLength}`;
                counter.style.color = '#ff3b30';
            } else {
                counter.style.color = currentLength > 450 ? '#ff9500' : '#8e8e93';
            }
        });
    }

    function createCounter() {
        const counter = document.createElement('div');
        counter.id = 'note-counter';
        counter.className = 'note-counter';
        counter.textContent = '0/500';
        counter.style.cssText = `
            text-align: right;
            font-size: 12px;
            color: #8e8e93;
            margin-top: 5px;
        `;
        noteContent.parentNode.appendChild(counter);
        return counter;
    }

    if (cancelNote) {
        cancelNote.addEventListener('click', function() {
            if (noteModal) noteModal.classList.remove('active');
            const counter = document.getElementById('note-counter');
            if (counter) counter.remove();
        });
    }

    if (saveNote) {
        saveNote.addEventListener('click', function() {
            const title = document.getElementById('note-title').value;
            const content = document.getElementById('note-content').value;
            
            if (title && content) {
                if (editingNoteId) {
                    // Редактирование существующей заметки
                    const noteIndex = notes.findIndex(note => note.id === editingNoteId);
                    if (noteIndex !== -1) {
                        notes[noteIndex].title = title;
                        notes[noteIndex].content = content;
                        notes[noteIndex].date = new Date().toLocaleDateString('ru-RU');
                    }
                } else {
                    // Добавление новой заметки
                    notes.push({
                        id: Date.now(),
                        title: title,
                        content: content,
                        date: new Date().toLocaleDateString('ru-RU')
                    });
                }
                
                updateNotesGrid();
                if (noteModal) noteModal.classList.remove('active');
                saveData();
                
                // Очистить форму
                document.getElementById('note-title').value = '';
                document.getElementById('note-content').value = '';
                const counter = document.getElementById('note-counter');
                if (counter) counter.remove();
            }
        });
    }
}

function setupNotesCardEventListeners() {
    // Добавляем обработчики для кнопок меню
    document.querySelectorAll('.note-card .menu-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = this.getAttribute('data-id');
            const menu = document.getElementById(`menu-note-${id}`);
            
            if (!menu) return; // Защита от null
            
            // Закрыть все открытые меню
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                if (m !== menu && m) m.classList.remove('active');
            });
            
            menu.classList.toggle('active');
        });
    });
    
    // Добавляем обработчики для кнопок редактирования
    document.querySelectorAll('.note-card .edit-item').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            const note = notes.find(note => note.id === id);
            if (note) {
                editingNoteId = id;
                const modalTitle = document.getElementById('note-modal-title');
                const noteModal = document.getElementById('note-modal');
                
                if (modalTitle) modalTitle.textContent = 'Редактировать заметку';
                if (document.getElementById('note-title')) document.getElementById('note-title').value = note.title;
                if (document.getElementById('note-content')) document.getElementById('note-content').value = note.content;
                if (noteModal) noteModal.classList.add('active');
            }
            
            // Закрыть меню
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                if (m) m.classList.remove('active');
            });
        });
    });
    
    // Добавляем обработчики для кнопок удаления
    document.querySelectorAll('.note-card .delete-item').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = parseInt(this.getAttribute('data-id'));
            if (confirm('Вы уверены, что хотите удалить эту заметку?')) {
                const index = notes.findIndex(note => note.id === id);
                if (index !== -1) {
                    notes.splice(index, 1);
                    updateNotesGrid();
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