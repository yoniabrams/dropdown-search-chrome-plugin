console.log("Script Loaded!");

document.addEventListener('mousedown', (e) => {
  // Check if we clicked a SELECT element
  if (e.target.tagName === 'SELECT') {
    const selectEl = e.target;
    
    // Don't open if our popup is already there
    if (document.getElementById('chrome-plugin-search-popup')) return;

    // Optional: stop the default dropdown from flickering open
    // e.preventDefault(); 

    showSearchPopup(selectEl);
  }
});

function showSearchPopup(originalSelect) {
  const options = Array.from(originalSelect.options).map(opt => ({
    text: opt.text,
    value: opt.value,
    index: opt.index
  }));

  const popup = document.createElement('div');
  popup.id = 'chrome-plugin-search-popup';

  // --- New Logic: Positioning ---
  const rect = originalSelect.getBoundingClientRect();
  // Place it right below the dropdown, aligned to the left
  popup.style.top = `${rect.bottom + window.scrollY + 5}px`; 
  popup.style.left = `${rect.left + window.scrollX}px`;

  // --- New Logic: Title ---
  const title = document.createElement('div');
  title.textContent = "Quick Search";
  title.style.cssText = "font-weight: bold; margin-bottom: 8px; color: #555; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;";
  popup.appendChild(title);

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = "Search options...";
  
  const listContainer = document.createElement('div');
  listContainer.className = 'search-results';

  input.addEventListener('input', () => {
    const searchTerm = input.value.toLowerCase();
    const filtered = options.filter(o => o.text.toLowerCase().includes(searchTerm));
    renderResults(filtered, listContainer, originalSelect, popup);
  });

  const closePopup = (e) => {
    if (!popup.contains(e.target) && e.target !== originalSelect) {
      popup.remove();
      document.removeEventListener('mousedown', closePopup);
    }
  };
  setTimeout(() => document.addEventListener('mousedown', closePopup), 10);

  renderResults(options, listContainer, originalSelect, popup);

  popup.appendChild(input);
  popup.appendChild(listContainer);
  document.body.appendChild(popup);
  
  input.focus();
}

function renderResults(items, container, originalSelect, popup) {
  container.innerHTML = '';
  items.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item.text;
    div.onclick = (e) => {
      e.stopPropagation(); // Prevent the click from bubbling
      originalSelect.selectedIndex = item.index;
      originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
      popup.remove();
    };
    container.appendChild(div);
  });
}