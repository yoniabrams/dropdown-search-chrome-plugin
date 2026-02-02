
document.addEventListener('mousedown', (e) => {
  // 1. Check for native <select>
  if (e.target.tagName === 'SELECT') {
    showSearchPopup(e.target, true);
    return;
  }

  // 2. Check for Custom Dropdowns (ARIA roles)
  const customDropdown = e.target.closest('[role="combobox"]');
  if (customDropdown) {
    showSearchPopup(customDropdown, false);
  }
});

function showSearchPopup(triggerEl, isNative) {
  const options = getOptions(triggerEl, isNative);
  if (options.length === 0) return; // Don't show if we found nothing

  const popup = document.createElement('div');
  popup.id = 'chrome-plugin-search-popup';
  
  // Position relative to the trigger element
  const rect = triggerEl.getBoundingClientRect();
  popup.style.top = `${rect.bottom + window.scrollY + 5}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;

  // Add Title
  const title = document.createElement('div');
  title.className = 'popup-title';
  title.textContent = "Quick Search";
  popup.appendChild(title);

  const input = document.createElement('input');
  input.placeholder = "Search options...";
  popup.appendChild(input);

  const listContainer = document.createElement('div');
  listContainer.className = 'search-results';
  popup.appendChild(listContainer);

  const render = (items) => {
    listContainer.innerHTML = '';
    items.forEach(item => {
      const div = document.createElement('div');
      div.textContent = item.text;
      div.onclick = () => {
        if (isNative) {
          item.element.selected = true;
          triggerEl.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          // Force click the hidden/real option in the website's menu
          item.element.click();
        }
        popup.remove();
      };
      listContainer.appendChild(div);
    });
  };

  input.addEventListener('input', () => {
    const term = input.value.toLowerCase();
    render(options.filter(o => o.text.toLowerCase().includes(term)));
  });

  // Close logic
  const closer = (e) => { if(!popup.contains(e.target)) { popup.remove(); document.removeEventListener('mousedown', closer); }};
  setTimeout(() => document.addEventListener('mousedown', closer), 10);

  render(options);
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

function getOptions(el, isNative) {
  if (isNative) {
    return Array.from(el.options).map(opt => ({
      text: opt.text,
      element: opt
    }));
  } else {
    // Look for list items (role="option") related to this combobox
    // Often they are in a <ul> or a separate container
    const listId = el.getAttribute('aria-controls');
    const listContainer = listId ? document.getElementById(listId) : document.body;
    
    return Array.from(listContainer.querySelectorAll('[role="option"]')).map(opt => ({
      text: opt.innerText.trim(),
      element: opt
    }));
  }
}