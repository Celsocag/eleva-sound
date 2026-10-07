// Web Audio Engine for real sound amplification, bass boost and safety clipping
class AudioEngine {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isSynthesizing = false;
  private synthInterval: number | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Equalizer nodes
      this.bassFilter = this.ctx.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.value = 180;

      this.trebleFilter = this.ctx.createBiquadFilter();
      this.trebleFilter.type = 'highshelf';
      this.trebleFilter.frequency.value = 3500;

      // Dynamics Compressor (Hardware Protection Limiter to prevent speaker blowout)
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(10, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(16, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

      // Master Gain (Amplifier)
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(1.0, this.ctx.currentTime);

      // Spectrum Analyser
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;

      // Routing: source -> bass -> treble -> compressor -> gain -> analyser -> destination
      this.bassFilter.connect(this.trebleFilter);
      this.trebleFilter.connect(this.compressor);
      this.compressor.connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Set total volume boost: 100% -> gain 1.0, 200% -> gain 2.0, 300% -> gain 3.5, etc.
  public setBoostLevel(percent: number) {
    if (!this.gainNode || !this.ctx) return;
    
    // Smooth transition to prevent audio popping
    const targetGain = percent <= 100 
      ? percent / 100 
      : 1.0 + Math.pow((percent - 100) / 100, 1.35) * 2.5;

    this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
    this.gainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
  }

  public setBass(gainDb: number) {
    if (!this.bassFilter || !this.ctx) return;
    this.bassFilter.gain.setTargetAtTime(gainDb, this.ctx.currentTime, 0.05);
  }

  public setTreble(gainDb: number) {
    if (!this.trebleFilter || !this.ctx) return;
    this.trebleFilter.gain.setTargetAtTime(gainDb, this.ctx.currentTime, 0.05);
  }

  public setLimiterProtection(enabled: boolean) {
    if (!this.compressor || !this.ctx) return;
    if (enabled) {
      this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(18, this.ctx.currentTime);
    } else {
      this.compressor.threshold.setValueAtTime(-2, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(2, this.ctx.currentTime);
    }
  }

  // Generate an authentic acoustic preview loop (luxury deep electronic groove preview)
  public startAcousticDemo(onPlayingChange?: (isPlaying: boolean) => void) {
    this.init();
    if (!this.ctx || !this.bassFilter) return;

    if (this.isSynthesizing) {
      this.stopAcousticDemo();
      if (onPlayingChange) onPlayingChange(false);
      return;
    }

    this.isSynthesizing = true;
    if (onPlayingChange) onPlayingChange(true);

    const notes = [130.81, 164.81, 196.0, 246.94, 261.63, 196.0, 164.81]; // C3, E3, G3, B3, C4...
    let step = 0;

    const playChord = () => {
      if (!this.ctx || !this.bassFilter || !this.isSynthesizing) return;

      const osc = this.ctx.createOscillator();
      const oscSub = this.ctx.createOscillator();
      const env = this.ctx.createGain();

      const freq = notes[step % notes.length];
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(freq / 2, this.ctx.currentTime);

      // Envelope
      env.gain.setValueAtTime(0.001, this.ctx.currentTime);
      env.gain.exponentialRampToValueAtTime(0.35, this.ctx.currentTime + 0.05);
      env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

      osc.connect(env);
      oscSub.connect(env);
      env.connect(this.bassFilter);

      osc.start();
      oscSub.start();
      osc.stop(this.ctx.currentTime + 0.5);
      oscSub.stop(this.ctx.currentTime + 0.5);

      step++;
    };

    playChord();
    this.synthInterval = window.setInterval(playChord, 380);
  }

  public stopAcousticDemo() {
    this.isSynthesizing = false;
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  public getVisualizerData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(32);
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public isDemoPlaying(): boolean {
    return this.isSynthesizing;
  }
}

export const audioEngine = new AudioEngine();
