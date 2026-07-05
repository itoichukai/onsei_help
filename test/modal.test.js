const { bootApp, LEVELS, CELLS } = require('./harness');

function emptyData() {
  return Array.from({ length: LEVELS }, () =>
    Array.from({ length: CELLS }, () => ({ label: '', imgSrc: '', audioB64: '', color: '' }))
  );
}

describe('openModal', () => {
  test('opening an empty cell shows the modal with a blank label', () => {
    const { window, document } = bootApp();
    window.openModal(0);
    expect(document.getElementById('modalBg').classList.contains('open')).toBe(true);
    expect(document.getElementById('labelInput').value).toBe('');
    expect(document.getElementById('imgPreview').style.display).toBe('none');
    expect(document.getElementById('imgPlaceholder').style.display).toBe('flex');
    expect(document.getElementById('recPreview').style.display).toBe('none');
  });

  test('opening a populated cell prefills label, image and audio previews', () => {
    const data = emptyData();
    data[0][0] = { label: 'おはよう', imgSrc: 'data:image/jpeg;base64,IMG', audioB64: 'data:audio/webm;base64,AUD', color: '' };
    const { window, document } = bootApp({ storage: { voca_data_v2: JSON.stringify(data) } });

    window.openModal(0);
    expect(document.getElementById('labelInput').value).toBe('おはよう');
    const imgPrev = document.getElementById('imgPreview');
    expect(imgPrev.style.display).toBe('block');
    expect(imgPrev.getAttribute('src')).toBe('data:image/jpeg;base64,IMG');
    expect(document.getElementById('imgPlaceholder').style.display).toBe('none');
    const recPrev = document.getElementById('recPreview');
    expect(recPrev.style.display).toBe('block');
    expect(recPrev.getAttribute('src')).toBe('data:audio/webm;base64,AUD');
  });

  test('clicking the edit button on a cell opens the modal', () => {
    const { document } = bootApp();
    document.querySelectorAll('#grid .cell')[4].querySelector('.edit-btn').click();
    expect(document.getElementById('modalBg').classList.contains('open')).toBe(true);
  });

  test('closeModal hides the modal', () => {
    const { window, document } = bootApp();
    window.openModal(0);
    window.closeModal();
    expect(document.getElementById('modalBg').classList.contains('open')).toBe(false);
  });

  test('clicking the backdrop closes the modal', () => {
    const { window, document } = bootApp();
    window.openModal(0);
    const bg = document.getElementById('modalBg');
    const evt = new window.Event('click');
    Object.defineProperty(evt, 'target', { value: bg });
    bg.dispatchEvent(evt);
    expect(bg.classList.contains('open')).toBe(false);
  });
});

describe('color picker', () => {
  test('builds a swatch for every configured color', () => {
    const { window, document } = bootApp();
    window.openModal(0);
    expect(document.querySelectorAll('#colorPicker button').length).toBe(8);
  });

  test('selecting a swatch highlights it and records the value', () => {
    const { window, document } = bootApp();
    window.openModal(0);
    const cp = document.getElementById('colorPicker');
    const green = cp.querySelectorAll('button')[2]; // 緑 -> #e6f5e0
    green.click();
    expect(green.style.borderColor).toBe('rgb(55, 138, 221)'); // #378add
    expect(cp._sel).toBe('#e6f5e0');
  });

  test('the swatch matching the cell colour starts pre-selected', () => {
    const data = emptyData();
    data[0][0] = { label: '', imgSrc: '', audioB64: '', color: '#fff8dd' };
    const { window, document } = bootApp({ storage: { voca_data_v2: JSON.stringify(data) } });
    window.openModal(0);
    const cp = document.getElementById('colorPicker');
    expect(cp._sel).toBe('#fff8dd');
    const yellow = cp.querySelectorAll('button')[3];
    expect(yellow.style.borderColor).toBe('rgb(55, 138, 221)');
  });
});

describe('image controls', () => {
  test('the clear-image button hides the preview and restores the placeholder', () => {
    const data = emptyData();
    data[0][0] = { label: '', imgSrc: 'data:image/jpeg;base64,IMG', audioB64: '', color: '' };
    const { window, document } = bootApp({ storage: { voca_data_v2: JSON.stringify(data) } });
    window.openModal(0);
    expect(document.getElementById('imgPreview').style.display).toBe('block');

    document.getElementById('imgClearBtn').click();
    expect(document.getElementById('imgPreview').style.display).toBe('none');
    expect(document.getElementById('imgPlaceholder').style.display).toBe('flex');
  });
});
