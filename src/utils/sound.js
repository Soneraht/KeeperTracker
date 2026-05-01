export const playNotifSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const pulses = [
      {freq:1400, start:0.00, dur:0.18},
      {freq:900,  start:0.22, dur:0.14},
      {freq:1400, start:0.40, dur:0.18},
      {freq:900,  start:0.62, dur:0.14},
      {freq:1600, start:0.80, dur:0.25},
    ];
    pulses.forEach(({freq, start, dur}) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.55, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.01);
    });
  } catch(e) {}
};

export const playSoftNotifSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [660, 880].forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.18);
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.16);
      osc.start(ctx.currentTime + i * 0.18);
      osc.stop(ctx.currentTime + i * 0.18 + 0.17);
    });
  } catch(e) {}
};