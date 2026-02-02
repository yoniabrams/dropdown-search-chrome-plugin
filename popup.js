// Function to find all options in all <select> tags on the page
function getDropdownOptions() {
  const selects = document.querySelectorAll('select');
  let allOptions = [];
  
  selects.forEach((select, selectIndex) => {
    Array.from(select.options).forEach((opt, optIndex) => {
      allOptions.push({
        text: opt.innerText,
        selectIdx: selectIndex,
        optionIdx: optIndex
      });
    });
  });
  return allOptions;
}

// Function to select the specific option
function selectOption(selectIdx, optionIdx) {
  const selects = document.querySelectorAll('select');
  const targetSelect = selects[selectIdx];
  if (targetSelect) {
    targetSelect.selectedIndex = optionIdx;
    targetSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }
}