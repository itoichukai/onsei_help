const { bootApp, LEVELS, CELLS } = require('./harness');

function emptyData() {
  return Array.from({ length: LEVELS }, () =>
    Array.from({ length: CELLS }, () => ({ label: '', imgSrc: '', audioB64: '', color: '' }))
  );
}

describe('loading persisted data', () => {
  test('populates the grid from localStorage on boot', () => {
    const data = emptyData();
    data[0][0] = { label: 'ありがとう', imgSrc: '', audioB64: '', color: '#ddeeff' };
    const { document } = bootApp({ storage: { voca_data_v2: JSON.stringify(data) } });

    const first = document.querySelector('#grid .cell');
    expect(first.querySelector('.label').textContent).toBe('ありがとう');
    expect(first.classList.contains('empty-slot')).toBe(false);
    expect(first.style.background).toBe('rgb(221, 238, 255)');
  });

  test('a cell with audio gets the has-audio class and a badge', () => {
    const data = emptyData();
    data[0][2] = { label: 'はい', imgSrc: '', audioB64: 'data:audio/webm;base64,AAA', color: '' };
    const { document } = bootApp({ storage: { voca_data_v2: JSON.stringify(data) } });

    const cell = document.querySelectorAll('#grid .cell')[2];
    expect(cell.classList.contains('has-audio')).toBe(true);
    expect(cell.querySelector('.badge')).not.toBeNull();
  });

  test('a cell with an image renders an <img> with alt text', () => {
    const data = emptyData();
    data[0][1] = { label: 'ねこ', imgSrc: 'data:image/jpeg;base64,BBB', audioB64: '', color: '' };
    const { document } = bootApp({ storage: { voca_data_v2: JSON.stringify(data) } });

    const img = document.querySelectorAll('#grid .cell')[1].querySelector('img');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('data:image/jpeg;base64,BBB');
    expect(img.getAttribute('alt')).toBe('ねこ');
  });

  test('malformed stored JSON is ignored and the app still boots', () => {
    const { document } = bootApp({ storage: { voca_data_v2: '{not valid json' } });
    expect(document.querySelectorAll('#grid .cell').length).toBe(CELLS);
    expect(document.querySelector('#grid .cell').classList.contains('empty-slot')).toBe(true);
  });
});

describe('saving data', () => {
  test('saving a label writes JSON to localStorage and re-renders', () => {
    const { window, document } = bootApp();

    window.openModal(0);
    document.getElementById('labelInput').value = 'こんにちは';
    document.getElementById('saveBtn').click();

    const stored = JSON.parse(window.localStorage.getItem('voca_data_v2'));
    expect(stored[0][0].label).toBe('こんにちは');
    expect(document.querySelector('#grid .cell .label').textContent).toBe('こんにちは');
  });

  test('label is trimmed before saving', () => {
    const { window, document } = bootApp();
    window.openModal(3);
    document.getElementById('labelInput').value = '  トイレ  ';
    document.getElementById('saveBtn').click();

    const stored = JSON.parse(window.localStorage.getItem('voca_data_v2'));
    expect(stored[0][3].label).toBe('トイレ');
  });

  test('saved data survives a reload round-trip', () => {
    const first = bootApp();
    first.window.openModal(5);
    first.window.document.getElementById('labelInput').value = 'みず';
    first.window.document.getElementById('saveBtn').click();
    const raw = first.window.localStorage.getItem('voca_data_v2');

    const second = bootApp({ storage: { voca_data_v2: raw } });
    expect(second.document.querySelectorAll('#grid .cell')[5].querySelector('.label').textContent).toBe('みず');
  });
});
