// ==========================================================================
// 1. Core DOM Element Cache Declarations
// ==========================================================================
const noteForm = document.querySelector('#note-form');
const noteInput = document.querySelector('#note-input');
const noteCategory = document.querySelector('#note-category');
const notesList = document.querySelector('#notes-list');
const noteCountMessage = document.querySelector('#note-count');
const errorMessage = document.querySelector('#error-message');
const searchInput = document.querySelector('#search-input');
const clearAllButton = document.querySelector('#clear-all-btn');

// ==========================================================================
// 2. State Memory Management (Init and LocalStorage Hookups)
// ==========================================================================
let notesArray = [];

function loadNotesFromStorage() {
  try {
    const rawData = localStorage.getItem('quicknotes_persisted_dataset');
    notesArray = rawData ? JSON.parse(rawData) : [];
  } catch (error) {
    console.error("Storage read failed. Resetting memory structure state.", error);
    notesArray = [];
  }
}

function saveNotesToStorage() {
  localStorage.setItem('quicknotes_persisted_dataset', JSON.stringify(notesArray));
}

// ==========================================================================
// 3. UI Template Matrix Renderer (Rebuilds structural nodes dynamically)
// ==========================================================================
function render(filteredTerm = '') {
  // Purge the list target before rebuilding
  notesList.innerHTML = '';
  
  // Transform and normalize search terms to ensure matching stability
  const cleanedSearchTerm = filteredTerm.trim().toLowerCase();
  
  const displayCollection = notesArray.filter(note => 
    note.text.toLowerCase().includes(cleanedSearchTerm)
  );

  // Manage visibility rules for the "Clear All" utility button
  if (notesArray.length > 0) {
    clearAllButton.classList.remove('hidden');
  } else {
    clearAllButton.classList.add('hidden');
  }

  // Handle empty search results matches
  if (displayCollection.length === 0) {
    const fallbackItem = document.createElement('li');
    fallbackItem.className = 'no-match-message';
    fallbackItem.textContent = notesArray.length === 0 
      ? 'Your workspace is empty. Add a note above!' 
      : 'No notes match your search.';
    notesList.appendChild(fallbackItem);
  } else {
    // Generate functional elements sequentially for target notes
    displayCollection.forEach(note => {
      const li = document.createElement('li');
      // Assign custom classification styling tokens safely
      li.className = `note-item category-${note.category}`;
      
      const contentContainer = document.createElement('div');
      contentContainer.className = 'note-content-block';
      
      const pText = document.createElement('p');
      pText.className = 'note-text-display';
      pText.textContent = note.text;
      
      const metaRow = document.createElement('div');
      metaRow.className = 'note-meta-row';
      
      const spanBadge = document.createElement('span');
      spanBadge.className = 'badge';
      spanBadge.textContent = note.category;
      
      const spanTime = document.createElement('span');
      spanTime.className = 'timestamp';
      spanTime.textContent = note.createdAt;
      
      metaRow.appendChild(spanBadge);
      metaRow.appendChild(spanTime);
      contentContainer.appendChild(pText);
      contentContainer.appendChild(metaRow);
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.setAttribute('aria-label', `Delete note: ${note.text.substring(0, 15)}...`);
      
      // Wire deletion closures pointing directly to the item id
      deleteBtn.addEventListener('click', () => deleteNote(note.id));
      
      li.appendChild(contentContainer);
      li.appendChild(deleteBtn);
      
      notesList.appendChild(li);
    });
  }
  
  // Update counter tracking strings metrics accurately
  updateCountsDisplay();
}

// ==========================================================================
// 4. Data Processing Actions (Add, Delete, Validation, Count Metrics)
// ==========================================================================
function addNote(event) {
  event.preventDefault();
  
  const rawTextValue = noteInput.value;
  const targetCategory = noteCategory.value;
  
  // Validation processing parameters
  const scrubbedText = rawTextValue.trim();
  
  if (scrubbedText.length === 0) {
    errorMessage.textContent = 'Please type a note first.';
    return;
  }
  
  if (scrubbedText.length > 200) {
    errorMessage.textContent = 'Notes must be 200 characters or fewer.';
    return;
  }
  
  // Clear error parameters upon validation success pass
  errorMessage.textContent = '';
  
  // Format consistent localization timestamp strings
  const timestampOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  const structuredTimestamp = new Date().toLocaleDateString('en-US', timestampOptions);
  
  const newNoteObject = {
    id: Date.now() + Math.random(), // Generates an isolated distinct floating tracker ID
    text: scrubbedText,
    category: targetCategory,
    createdAt: structuredTimestamp
  };
  
  notesArray.unshift(newNoteObject); // Insert newest items at the top
  saveNotesToStorage();
  
  // Reset active inputs and pull standard workspace re-render updates
  noteInput.value = '';
  searchInput.value = '';
  render();
}

function deleteNote(targetId) {
  notesArray = notesArray.filter(note => note.id !== targetId);
  saveNotesToStorage();
  render(searchInput.value);
}

function updateCountsDisplay() {
  const totalNotes = notesArray.length;
  if (totalNotes === 0) {
    noteCountMessage.textContent = 'You have no notes yet.';
  } else if (totalNotes === 1) {
    noteCountMessage.textContent = 'You have 1 note.';
  } else {
    noteCountMessage.textContent = `You have ${totalNotes} notes.`;
  }
}

// ==========================================================================
// 5. Global Bonus Action Handling Mechanics
// ==========================================================================
function clearEntireWorkspace() {
  const userConfirmed = confirm("Delete all notes?");
  if (userConfirmed) {
    notesArray = [];
    saveNotesToStorage();
    searchInput.value = '';
    render();
  }
}

// ==========================================================================
// 6. Interactive Pipeline Event Hooks Registry
// ==========================================================================
noteForm.addEventListener('submit', addNote);

searchInput.addEventListener('input', (event) => {
  render(event.target.value);
});

clearAllButton.addEventListener('click', clearEntireWorkspace);

// Initialize system memory pipelines on page setup execution completes
window.addEventListener('DOMContentLoaded', () => {
  loadNotesFromStorage();
  render();
});
