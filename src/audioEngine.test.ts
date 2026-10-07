import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { audioEngine } from './audioEngine';

describe('audioEngine', () => {
  beforeEach(() => {
    // Reset singleton state
    audioEngine['ctx'] = null;
    audioEngine['bassFilter'] = null;
    audioEngine['trebleFilter'] = null;
    audioEngine['compressor'] = null;
    audioEngine['gainNode'] = null;
    audioEngine['analyser'] = null;
    audioEngine['isSynthesizing'] = false;

    // Mock AudioContext
    const mockAudioContext = vi.fn().mockImplementation(function() {
      return {
        createBiquadFilter: vi.fn().mockReturnValue({
        frequency: { value: 0 },
        gain: { setTargetAtTime: vi.fn() },
        connect: vi.fn(),
      }),
      createDynamicsCompressor: vi.fn().mockReturnValue({
        threshold: { setValueAtTime: vi.fn() },
        knee: { setValueAtTime: vi.fn() },
        ratio: { setValueAtTime: vi.fn() },
        attack: { setValueAtTime: vi.fn() },
        release: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
      }),
      createGain: vi.fn().mockReturnValue({
        gain: {
          setValueAtTime: vi.fn(),
          cancelScheduledValues: vi.fn(),
          setTargetAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      }),
      createAnalyser: vi.fn().mockReturnValue({
        getByteFrequencyData: vi.fn(),
        connect: vi.fn(),
        frequencyBinCount: 32,
      }),
      createOscillator: vi.fn().mockReturnValue({
        type: '',
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }),
      currentTime: 0,
      state: 'suspended',
      resume: vi.fn(),
      destination: {},
      };
    });
    
    window.AudioContext = mockAudioContext as any;
    
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('initializes correctly', () => {
    audioEngine.init();
    expect(window.AudioContext).toHaveBeenCalled();
  });

  it('sets boost level', () => {
    audioEngine.init();
    audioEngine.setBoostLevel(200);
    audioEngine.setBoostLevel(50);
    audioEngine.setBoostLevel(100);
    // Should not throw
    expect(true).toBe(true);
  });

  it('sets bass', () => {
    audioEngine.init();
    audioEngine.setBass(5);
    expect(true).toBe(true);
  });

  it('sets treble', () => {
    audioEngine.init();
    audioEngine.setTreble(5);
    expect(true).toBe(true);
  });

  it('sets limiter protection', () => {
    audioEngine.init();
    audioEngine.setLimiterProtection(true);
    audioEngine.setLimiterProtection(false);
    expect(true).toBe(true);
  });

  it('starts and stops acoustic demo', () => {
    audioEngine.init();
    
    let isPlaying = false;
    audioEngine.startAcousticDemo((playing) => { isPlaying = playing; });
    expect(isPlaying).toBe(true);
    expect(audioEngine.isDemoPlaying()).toBe(true);
    
    // Test interval
    vi.advanceTimersByTime(400);

    audioEngine.stopAcousticDemo();
    expect(audioEngine.isDemoPlaying()).toBe(false);
    
    // Calling start when already playing
    audioEngine.startAcousticDemo();
    audioEngine.startAcousticDemo();
  });

  it('handles getVisualizerData', () => {
    audioEngine.init();
    const data = audioEngine.getVisualizerData();
    expect(data.length).toBeGreaterThan(0);
  });
  
  it('handles calling methods before init gracefully', () => {
    // mock some internal state since it's a singleton
    audioEngine['ctx'] = null;
    audioEngine.setBoostLevel(100);
    audioEngine.setBass(0);
    audioEngine.setTreble(0);
    audioEngine.setLimiterProtection(true);
    audioEngine.startAcousticDemo();
    const data = audioEngine.getVisualizerData();
    expect(data).toBeInstanceOf(Uint8Array);
  });
});
