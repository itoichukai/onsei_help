const { bootApp, LEVELS, CELLS } = require('./harness');

function emptyData() {
  return Array.from({ length: LEVELS }, () =>
    Array.from({ length: CELLS }, () => ({ label: '', imgSrc: '', audioB64: '', color: '' }))
  );
}

describe('saving edits', () => {
  test('saving persists the picked colour onto the cell', () => {
    const { window, document } = bootApp();
    window.openModal(0);
    document.getElementById('labelInput').value = 'あお';
    document.getElementById('colorPicker').querySelectorAll('button')[1].click(); // 青 -> #ddeeff
    document.getElementById('saveBtn').click();

    const stored = JSON.parse(window.localStorage.getItem('voca_data_v2'));
    expect(stored[0][0].color).toBe('#ddeeff');
    expect(document.querySelector('#grid .cell').style.background).toBe('rgb(221, 238, 255)');
  });

  test('saving closes the modal and clears the edit index', () => {
    const { window, document } = bootApp();
    window.openModal(1);
    document.getElementById('labelInput').value = 'x';
    document.getElementById('saveBtn').click();
    expect(document.getElementById('modalBg').classList.contains('open')).toBe(false);
  });

  test('edits are scoped to the currently selected level', () => {
    const { window, document } = bootApp();
    document.querySelectorAll('#levelTabs .level-tab')[1].click(); // level 2
    window.openModal(0);
    document.getElementById('labelInput').value = 'レベル2の項目';
    document.getElementById('saveBtn').click();

    const stored = JSON.parse(window.localStorage.getItem('voca_data_v2'));
    expect(stored[1][0].label).toBe('レベル2の項目');
    expect(stored[0][0].label).toBe('');
  });
});

describe('clearing a cell', () => {
  test('confirming clear wipes the cell contents', () => {
    const data = emptyData();
    data[0][0] = { label: 'けす', imgSrc: 'data:image/jpeg;base64,X', audioB64: 'data:audio/webm;base64,Y', color: '#fce8e8' };
    const { window, document } = bootApp({ storage: { voca_data_v2: JSON.stringify(data) } });

    window.confirm = () => true;
    window.openModal(0);
    document.getElementById('clearBtn').click();

    const stored = JSON.parse(window.localStorage.getItem('voca_data_v2'));
    expect(stored[0][0]).toEqual({ label: '', imgSrc: '', audioB64: '', color: '' });
    expect(document.querySelector('#grid .cell').classList.contains('empty-slot')).toBe(true);
  });

  test('declining the confirm dialog leaves the cell untouched', () => {
    const data = emptyData();
    data[0][0] = { label: 'のこす', imgSrc: '', audioB64: '', color: '' };
    const { window, document } = bootApp({ storage: { voca_data_v2: JSON.stringify(data) } });

    window.confirm = () => false;
    window.openModal(0);
    document.getElementById('clearBtn').click();

    expect(document.querySelector('#grid .cell .label').textContent).toBe('のこす');
  });
});
