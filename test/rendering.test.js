const { bootApp, LEVELS, CELLS } = require('./harness');

describe('level tabs', () => {
  test('renders one tab per level with the first active', () => {
    const { document } = bootApp();
    const tabs = document.querySelectorAll('#levelTabs .level-tab');
    expect(tabs.length).toBe(LEVELS);
    expect(tabs[0].classList.contains('active')).toBe(true);
    expect(tabs[0].textContent).toBe('レベル1');
    expect(tabs[2].textContent).toBe('レベル3');
    expect(document.querySelectorAll('#levelTabs .level-tab.active').length).toBe(1);
  });

  test('clicking a tab moves the active state and re-renders the grid', () => {
    const { document } = bootApp();
    const tabs = document.querySelectorAll('#levelTabs .level-tab');
    tabs[1].click();
    const after = document.querySelectorAll('#levelTabs .level-tab');
    expect(after[1].classList.contains('active')).toBe(true);
    expect(after[0].classList.contains('active')).toBe(false);
    expect(document.getElementById('grid').children.length).toBe(CELLS);
  });
});

describe('grid rendering', () => {
  test('renders CELLS cells, all empty by default', () => {
    const { document } = bootApp();
    const cells = document.querySelectorAll('#grid .cell');
    expect(cells.length).toBe(CELLS);
    cells.forEach((c) => {
      expect(c.classList.contains('empty-slot')).toBe(true);
      expect(c.querySelector('.no-content').textContent).toBe('タップして設定');
    });
  });

  test('each cell exposes an edit button and is keyboard focusable', () => {
    const { document } = bootApp();
    const cell = document.querySelector('#grid .cell');
    expect(cell.getAttribute('tabindex')).toBe('0');
    expect(cell.querySelector('.edit-btn')).not.toBeNull();
  });

  test('default column count matches the selected 4-column option', () => {
    const { document } = bootApp();
    expect(document.getElementById('grid').style.gridTemplateColumns).toBe('repeat(4,1fr)');
  });
});

describe('column selector', () => {
  test('changing columns updates the grid template', () => {
    const { window, document } = bootApp();
    const sel = document.getElementById('colSelect');
    sel.value = '5';
    sel.dispatchEvent(new window.Event('change'));
    expect(document.getElementById('grid').style.gridTemplateColumns).toBe('repeat(5,1fr)');
  });
});
