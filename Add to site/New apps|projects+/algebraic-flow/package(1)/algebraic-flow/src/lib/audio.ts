// Simple Web Audio API synthesizer for UI sound effects

const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
let audioCtx: AudioContext | null = null;

const initAudio = () => {
    if (!audioCtx) {
        audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
};

interface SoundOptions {
    freq?: number;
    type?: OscillatorType;
    duration?: number;
    vol?: number;
}

const playTone = ({ freq = 440, type = 'sine', duration = 0.1, vol = 0.1 }: SoundOptions) => {
    const ctx = initAudio();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
};

export const playMove = () => {
    playTone({ freq: 600, type: 'triangle', duration: 0.1, vol: 0.1 });
};

export const playCombine = () => {
    const ctx = initAudio();
    if (!ctx) return;

    // Double tone for "combine"
    playTone({ freq: 400, type: 'sine', duration: 0.15, vol: 0.1 });
    setTimeout(() => {
        playTone({ freq: 800, type: 'sine', duration: 0.2, vol: 0.1 });
    }, 50);
};

export const playUndo = () => {
    playTone({ freq: 300, type: 'sawtooth', duration: 0.15, vol: 0.05 });
};

export const playSuccess = () => {
    const ctx = initAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio

    notes.forEach((freq, i) => {
        setTimeout(() => {
            playTone({ freq, type: 'triangle', duration: 0.4, vol: 0.1 });
        }, i * 100);
    });
};

export const playError = () => {
     playTone({ freq: 150, type: 'sawtooth', duration: 0.2, vol: 0.1 });
};
