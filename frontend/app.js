// Application State
let state = {
    notes: [],
    searchQuery: '',
    activeFilter: 'all',
    // Form temporary states
    newNoteColor: '#20242c',
    newNoteIsPinned: false,
    // Modal temporary states
    editNoteColor: '#20242c',
    editNoteIsPinned: false
};

// API Endpoints
const API_URL = '/api/notes';

// DOM Elements
const noteForm = document.getElementById('noteForm');
const collapsedTrigger = document.getElementById('collapsedTrigger');
const closeFormBtn = document.getElementById('closeFormBtn');
const notesGrid = document.getElementById('notesGrid');
const pinnedGrid = document.getElementById('pinnedGrid');
const pinnedSection = document.getElementById('pinnedSection');
const othersSection = document.getElementById('othersSection');
const othersTitle = document.getElementById('othersTitle');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const filterTabs = document.querySelectorAll('.filter-tab');

// Modal Elements
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const modalPinBtn = document.getElementById('modalPinBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const noteContentTextarea = document.getElementById('noteContent');

// Colors Palette Map
const COLORS = {
    '#20242c': 'Charcoal',
    '#3c2a4d': 'Plum',
    '#1a3d3c': 'Teal',
    '#1e295d': 'Indigo',
    '#283a24': 'Forest'
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    fetchNotes();
    setupEventListeners();
    setupColorPickers();
});

// Setup Color Picker Buttons
function setupColorPickers() {
    // New Note Form Colors
    const formPalette = document.getElementById('formColorPalette');
    formPalette.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            formPalette.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.newNoteColor = btn.dataset.color;
            
            // Highlight trigger background
            const trigger = document.querySelector('.color-btn-trigger');
            trigger.style.color = state.newNoteColor !== '#20242c' ? state.newNoteColor : '';
        });
    });

    // Edit Modal Colors
    const modalPalette = document.getElementById('modalColorPalette');
    modalPalette.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', () => {
            modalPalette.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.editNoteColor = btn.dataset.color;
            
            // Sync modal theme border
            const modalCard = document.getElementById('modalCard');
            modalCard.setAttribute('data-theme-color', state.editNoteColor);
        });
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Collapse / Expand form
    collapsedTrigger.addEventListener('click', expandForm);
    closeFormBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        collapseForm();
    });

    // Close form on click outside
    document.addEventListener('click', (e) => {
        if (!noteForm.contains(e.target) && noteForm.classList.contains('expanded')) {
            collapseForm();
        }
    });

    // Auto-expand textarea in form
    noteContentTextarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Pin button in Create Form
    const formPinBtn = document.getElementById('formPinBtn');
    formPinBtn.addEventListener('click', () => {
        state.newNoteIsPinned = !state.newNoteIsPinned;
        formPinBtn.classList.toggle('active', state.newNoteIsPinned);
        formPinBtn.title = state.newNoteIsPinned ? 'Pinned' : 'Pin Note';
    });

    // Form Submission
    noteForm.addEventListener('submit', handleCreateNote);

    // Search input
    searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
        render();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        state.searchQuery = '';
        clearSearchBtn.style.display = 'none';
        searchInput.focus();
        render();
    });

    // Category Filter tabs
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.activeFilter = tab.dataset.category;
            render();
        });
    });

    // Modal Events
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeModal();
    });
    modalPinBtn.addEventListener('click', () => {
        state.editNoteIsPinned = !state.editNoteIsPinned;
        modalPinBtn.classList.toggle('active', state.editNoteIsPinned);
    });
    editForm.addEventListener('submit', handleUpdateNote);
}

// Expand / Collapse Form Logic
function expandForm() {
    noteForm.classList.remove('collapsed');
    noteForm.classList.add('expanded');
    document.getElementById('noteTitle').focus();
}

function collapseForm() {
    noteForm.classList.remove('expanded');
    noteForm.classList.add('collapsed');
    
    // Reset Form Fields
    noteForm.reset();
    noteContentTextarea.style.height = 'auto';
    
    // Reset color options
    state.newNoteColor = '#20242c';
    state.newNoteIsPinned = false;
    
    const formPinBtn = document.getElementById('formPinBtn');
    formPinBtn.classList.remove('active');
    
    const formPalette = document.getElementById('formColorPalette');
    formPalette.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
    formPalette.querySelector('[data-color="#20242c"]').classList.add('active');
    
    const trigger = document.querySelector('.color-btn-trigger');
    trigger.style.color = '';
}

// Fetch Notes from API
async function fetchNotes() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch notes.');
        state.notes = await response.json();
        render();
    } catch (err) {
        console.error(err);
        showToast('Could not load notes from database.', 'danger');
    }
}

// Handle Note Creation
async function handleCreateNote(e) {
    e.preventDefault();
    const title = document.getElementById('noteTitle').value.trim();
    const content = noteContentTextarea.value.trim();
    const category = document.getElementById('noteCategory').value;

    if (!content) return;

    const payload = {
        title: title || null,
        content: content,
        category: category,
        color: state.newNoteColor,
        is_pinned: state.newNoteIsPinned
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to save note.');

        const savedNote = await response.json();
        state.notes.unshift(savedNote); // Add to local state (will be sorted correctly by render/fetch)
        
        // Re-fetch to apply database sort logic cleanly
        await fetchNotes();
        collapseForm();
        showToast('Note created successfully!', 'success');
    } catch (err) {
        console.error(err);
        showToast('Error saving note.', 'danger');
    }
}

// Open Edit Modal
function openEditModal(note) {
    document.getElementById('editNoteId').value = note.id;
    document.getElementById('editNoteTitle').value = note.title || '';
    document.getElementById('editNoteContent').value = note.content;
    document.getElementById('editNoteCategory').value = note.category;
    
    state.editNoteColor = note.color || '#20242c';
    state.editNoteIsPinned = note.is_pinned;

    // Apply color in modal palette
    const modalPalette = document.getElementById('modalColorPalette');
    modalPalette.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
    const matchingBtn = modalPalette.querySelector(`[data-color="${state.editNoteColor}"]`);
    if (matchingBtn) matchingBtn.classList.add('active');

    // Update modal card theme style
    const modalCard = document.getElementById('modalCard');
    modalCard.setAttribute('data-theme-color', state.editNoteColor);

    // Apply pin active state
    modalPinBtn.classList.toggle('active', state.editNoteIsPinned);

    // Open Modal
    editModal.style.display = 'flex';
    document.getElementById('editNoteContent').focus();
}

function closeModal() {
    editModal.style.display = 'none';
    editForm.reset();
}

// Handle Note Update (Modal)
async function handleUpdateNote(e) {
    e.preventDefault();
    const id = document.getElementById('editNoteId').value;
    const title = document.getElementById('editNoteTitle').value.trim();
    const content = document.getElementById('editNoteContent').value.trim();
    const category = document.getElementById('editNoteCategory').value;

    if (!content) return;

    const payload = {
        title: title || null,
        content: content,
        category: category,
        color: state.editNoteColor,
        is_pinned: state.editNoteIsPinned
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to update note.');

        await fetchNotes(); // Refresh from DB
        closeModal();
        showToast('Note updated!', 'success');
    } catch (err) {
        console.error(err);
        showToast('Error updating note.', 'danger');
    }
}

// Toggle Pin Status directly from Note Card
async function togglePin(id, event) {
    if (event) event.stopPropagation(); // Avoid opening modal

    try {
        const response = await fetch(`${API_URL}/${id}/pin`, {
            method: 'PATCH'
        });

        if (!response.ok) throw new Error('Failed to toggle pin.');

        await fetchNotes();
        showToast('Pin status updated', 'info');
    } catch (err) {
        console.error(err);
        showToast('Error updating pin status.', 'danger');
    }
}

// Delete Note
async function deleteNote(id, event) {
    if (event) event.stopPropagation(); // Avoid opening modal

    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete note.');

        // Find card in DOM and apply fade-out animation first
        const card = document.querySelector(`.note-card[data-id="${id}"]`);
        if (card) {
            card.style.animation = 'toastOut 0.25s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards';
            setTimeout(async () => {
                state.notes = state.notes.filter(n => n.id !== parseInt(id));
                render();
            }, 250);
        } else {
            state.notes = state.notes.filter(n => n.id !== parseInt(id));
            render();
        }

        showToast('Note deleted', 'info');
    } catch (err) {
        console.error(err);
        showToast('Error deleting note.', 'danger');
    }
}

// UI Render Engine
function render() {
    // Filter Notes
    let filteredNotes = state.notes;

    // Apply category filter
    if (state.activeFilter !== 'all') {
        filteredNotes = filteredNotes.filter(note => note.category === state.activeFilter);
    }

    // Apply search filter
    if (state.searchQuery) {
        filteredNotes = filteredNotes.filter(note => {
            const titleMatch = note.title && note.title.toLowerCase().includes(state.searchQuery);
            const contentMatch = note.content.toLowerCase().includes(state.searchQuery);
            const categoryMatch = note.category.toLowerCase().includes(state.searchQuery);
            return titleMatch || contentMatch || categoryMatch;
        });
    }

    // Empty state check
    if (filteredNotes.length === 0) {
        emptyState.style.display = 'flex';
        pinnedSection.style.display = 'none';
        othersSection.style.display = 'none';
        return;
    } else {
        emptyState.style.display = 'none';
    }

    // Split Pinned and Others
    const pinnedNotes = filteredNotes.filter(n => n.is_pinned);
    const regularNotes = filteredNotes.filter(n => !n.is_pinned);

    // Render Pinned Grid
    if (pinnedNotes.length > 0) {
        pinnedSection.style.display = 'block';
        pinnedGrid.innerHTML = '';
        pinnedNotes.forEach(note => {
            pinnedGrid.appendChild(createNoteCard(note));
        });
    } else {
        pinnedSection.style.display = 'none';
    }

    // Render Regular Grid
    if (regularNotes.length > 0) {
        othersSection.style.display = 'block';
        notesGrid.innerHTML = '';
        regularNotes.forEach(note => {
            notesGrid.appendChild(createNoteCard(note));
        });
        
        // Show heading "Notes" only if we have pinned notes active
        othersTitle.style.display = pinnedNotes.length > 0 ? 'block' : 'none';
    } else {
        othersSection.style.display = 'none';
    }
}

// Note Card template creation
function createNoteCard(note) {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.dataset.id = note.id;
    card.setAttribute('data-theme-color', note.color || '#20242c');
    
    // Format creation date
    const dateStr = formatDate(note.updated_at || note.created_at);

    card.innerHTML = `
        <div class="note-card-header">
            <h3 class="note-card-title">${escapeHTML(note.title || '')}</h3>
            <button class="note-card-pin ${note.is_pinned ? 'pinned' : ''}" title="${note.is_pinned ? 'Unpin Note' : 'Pin Note'}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-.44-1.24l-2.78-3.47A2 2 0 0 1 15 9.3V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4.3a2 2 0 0 1-.78 1.23L5.44 14a2 2 0 0 0-.44 1.24Z"/></svg>
            </button>
        </div>
        <div class="note-card-content">${escapeHTML(note.content)}</div>
        <div class="note-card-footer">
            <span class="note-date">${dateStr}</span>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="note-tag">${escapeHTML(note.category)}</span>
                <div class="note-card-actions">
                    <button class="card-action-btn edit-btn" title="Edit Note">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </button>
                    <button class="card-action-btn delete-btn" title="Delete Note">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Event listeners
    card.addEventListener('click', () => openEditModal(note));
    
    const pinBtn = card.querySelector('.note-card-pin');
    pinBtn.addEventListener('click', (e) => togglePin(note.id, e));

    const editBtn = card.querySelector('.edit-btn');
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditModal(note);
    });

    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => deleteNote(note.id, e));

    return card;
}

// Date Formatter Helper
function formatDate(dateString) {
    if (!dateString) return 'Just now';
    
    // FastAPI sends ISO string (sometimes UTC). Let's parse it.
    // Replace Z or offset if SQLite didn't include it
    let dateStr = dateString;
    if (!dateStr.endsWith('Z') && !dateStr.includes('+')) {
        dateStr += 'Z'; // Assume UTC
    }
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Just now';

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// HTML Escape Helper to prevent XSS
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Toast Notifications Helper
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);

    // Auto-remove after 4 seconds (matching CSS animation transition)
    setTimeout(() => {
        toast.remove();
    }, 4000);
}
