
type SoundscapeEngine = {
  start: () => Promise<void>;
  stop: () => void;
  setMuted: (muted: boolean) => void;
  isRunning: () => boolean;
};

function createNoiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function createSoundscapeEngine(): SoundscapeEngine {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let running = false;
  let mistTimer: number | null = null;
  let nodes: AudioNode[] = [];

  const disconnectAll = () => {
    nodes.forEach((n) => {
      try {
        n.disconnect();
      } catch {
      }
    });
    nodes = [];
  };

  const stopMist = () => {
    if (mistTimer !== null) {
      window.clearTimeout(mistTimer);
      mistTimer = null;
    }
  };

  const scheduleMist = () => {
    if (!ctx || !master || !running) return;
    const delay = 8000 + Math.random() * 14000;
    mistTimer = window.setTimeout(() => {
      if (!ctx || !master || !running) return;

      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 0.35);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 4200;
      filter.Q.value = 0.7;
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.028, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      noise.start(now);
      noise.stop(now + 0.35);
      noise.onended = () => {
        try {
          noise.disconnect();
          filter.disconnect();
          gain.disconnect();
        } catch {
        }
      };

      scheduleMist();
    }, delay);
  };

  return {
    async start() {
      if (running) return;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = ctx ?? new AudioCtx();
      if (ctx.state === 'suspended') await ctx.resume();

      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      const oscA = ctx.createOscillator();
      oscA.type = 'sine';
      oscA.frequency.value = 46;
      const oscB = ctx.createOscillator();
      oscB.type = 'triangle';
      oscB.frequency.value = 69.3;
      const padFilter = ctx.createBiquadFilter();
      padFilter.type = 'lowpass';
      padFilter.frequency.value = 180;
      padFilter.Q.value = 0.6;
      const padGain = ctx.createGain();
      padGain.gain.value = 0.11;
      oscA.connect(padFilter);
      oscB.connect(padFilter);
      padFilter.connect(padGain);
      padGain.connect(master);
      oscA.start();
      oscB.start();

      const crackle = ctx.createBufferSource();
      crackle.buffer = createNoiseBuffer(ctx, 3);
      crackle.loop = true;
      const crackleFilter = ctx.createBiquadFilter();
      crackleFilter.type = 'bandpass';
      crackleFilter.frequency.value = 900;
      crackleFilter.Q.value = 0.4;
      const crackleGain = ctx.createGain();
      crackleGain.gain.value = 0.018;
      crackle.connect(crackleFilter);
      crackleFilter.connect(crackleGain);
      crackleGain.connect(master);
      crackle.start();

      nodes = [oscA, oscB, padFilter, padGain, crackle, crackleFilter, crackleGain, master];

      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(0, now);
      master.gain.linearRampToValueAtTime(0.85, now + 2.4);

      running = true;
      scheduleMist();
    },

    stop() {
      if (!running || !ctx || !master) {
        running = false;
        return;
      }
      stopMist();
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.6);
      window.setTimeout(() => {
        disconnectAll();
        running = false;
      }, 650);
    },

    setMuted(muted: boolean) {
      if (!ctx || !master || !running) return;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(muted ? 0 : 0.85, now + 0.35);
    },

    isRunning() {
      return running;
    },
  };
}
