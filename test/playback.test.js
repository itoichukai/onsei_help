const { bootApp, LEVELS, CELLS } = require('./harness');

function emptyData() {
  return Array.from({ length: LEVELS }, () =>
    Array.from({ length: CELLS }, () => ({ label: '', imgSrc: '', audioB64: '', color: '' }))
  );
}

function withAudioCell(cellIdx = 0, extra = {}) {
  const data = emptyData();
  data[0][cellIdx] = {
    label: 'おと',
    imgSrc: '',
    audioB64: 'data:audio/webm;base64,SOUND',
    color: '',
    ...extra,
  };
  const created = [];
  class FakeAudio {
    constructor(src) {
      this.src = src;
      this.volume = 1;
      this.paused = false;
      created.push(this);
    }
    play() {
      this.paused = false;
      return Promise.resolve();
    }
    pause() {
      this.paused = true;
    }
  }
  const boot = bootApp({
    storage: { voca_data_v2: JSON.stringify(data) },
    audioFactory: FakeAudio,
  });
  return { ...boot, created };
}

describe('playCell', () => {
  test('clicking an audio cell plays it and marks it playing', () => {
    const { document, created } = withAudioCell(0);
    const cell = document.querySelectorAll('#grid .cell')[0];
    cell.click();

    expect(created.length).toBe(1);
    expect(created[0].src).toBe('data:audio/webm;base64,SOUND');
    expect(cell.classList.contains('playing')).toBe(true);
  });

  test('audio ending removes the playing highlight', () => {
    const { document, created } = withAudioCell(0);
    const cell = document.querySelectorAll('#grid .cell')[0];
    cell.click();
    expect(typeof created[0].onended).toBe('function');
    created[0].onended();
    expect(cell.classList.contains('playing')).toBe(false);
  });

  test('clicking an empty cell opens the modal instead of playing', () => {
    const { window, document, created } = withAudioCell(0);
    const emptyCell = document.querySelectorAll('#grid .cell')[1];
    emptyCell.click();
    expect(created.length).toBe(0);
    expect(document.getElementById('modalBg').classList.contains('open')).toBe(true);
  });

  test('starting a second clip stops the first', () => {
    const data = emptyData();
    data[0][0] = { label: 'a', imgSrc: '', audioB64: 'data:audio/webm;base64,A', color: '' };
    data[0][1] = { label: 'b', imgSrc: '', audioB64: 'data:audio/webm;base64,B', color: '' };
    const created = [];
    class FakeAudio {
      constructor(src) { this.src = src; this.volume = 1; this.paused = false; created.push(this); }
      play() { return Promise.resolve(); }
      pause() { this.paused = true; }
    }
    const { document } = bootApp({
      storage: { voca_data_v2: JSON.stringify(data) },
      audioFactory: FakeAudio,
    });
    const cells = document.querySelectorAll('#grid .cell');
    cells[0].click();
    cells[1].click();
    expect(created.length).toBe(2);
    expect(created[0].paused).toBe(true);
    expect(cells[0].classList.contains('playing')).toBe(false);
    expect(cells[1].classList.contains('playing')).toBe(true);
  });

  test('the volume slider sets the volume of played audio', () => {
    const { window, document, created } = withAudioCell(0);
    const slider = document.getElementById('volSlider');
    slider.value = '0.25';
    slider.dispatchEvent(new window.Event('input'));

    document.querySelectorAll('#grid .cell')[0].click();
    expect(created[0].volume).toBeCloseTo(0.25);
  });

  test('pressing Enter on a cell plays its audio', () => {
    const { window, document, created } = withAudioCell(0);
    const cell = document.querySelectorAll('#grid .cell')[0];
    const evt = new window.KeyboardEvent('keydown', { key: 'Enter' });
    cell.dispatchEvent(evt);
    expect(created.length).toBe(1);
  });
});
