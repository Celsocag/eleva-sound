import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { audioEngine } from './audioEngine';

// Mock Capacitor Core
vi.mock('@capacitor/core', () => ({
  registerPlugin: vi.fn().mockReturnValue({
    setSystemBoost: vi.fn().mockResolvedValue(undefined),
  }),
}));

// Mock audioEngine
vi.mock('./audioEngine', () => ({
  audioEngine: {
    setBoostLevel: vi.fn(),
    setLimiterProtection: vi.fn(),
    setBass: vi.fn(),
    setTreble: vi.fn(),
    startAcousticDemo: vi.fn(),
  },
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<App />);
    expect(screen.getByText('ELEVA')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument(); // volume text
  });

  it('changes volume via slider', () => {
    render(<App />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 150 } });
    
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(audioEngine.setBoostLevel).toHaveBeenCalledWith(150);
  });

  it('shows impediment warning on high volume for iOS', () => {
    // Mock iOS user agent
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'iPhone',
      configurable: true,
    });
    
    render(<App />);
    const slider = screen.getByRole('slider');
    act(() => {
      fireEvent.change(slider, { target: { value: 200 } });
    });
    
    expect(screen.getByText('CALIBRAÇÃO iOS REQUERIDA')).toBeInTheDocument();
    
    // Test dismissing the popup
    const confirmButton = screen.getByText('CONFIRMAR CALIBRAÇÃO');
    fireEvent.click(confirmButton);
    expect(screen.queryByText('CALIBRAÇÃO iOS REQUERIDA')).not.toBeInTheDocument();
  });

  it('shows impediment warning on high volume for Android', () => {
    // Mock Android user agent
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Android',
      configurable: true,
    });
    
    render(<App />);
    const slider = screen.getByRole('slider');
    act(() => {
      fireEvent.change(slider, { target: { value: 200 } });
    });
    
    expect(screen.getByText('LIMITE DE MÍDIA ANDROID')).toBeInTheDocument();
  });

  it('handles global window mouse/touch events and unmounts', () => {
    const { unmount } = render(<App />);
    const knob = screen.getByText('NATURAL').parentElement?.parentElement;
    if (!knob) throw new Error('Knob not found');

    fireEvent.mouseDown(knob, { clientY: 500 });
    
    // Global mousemove
    fireEvent(window, new MouseEvent('mousemove', { clientY: 400 }));
    // Global mouseup
    fireEvent(window, new MouseEvent('mouseup'));

    fireEvent.touchStart(knob, { touches: [{ clientY: 500 }] });
    // Global touchmove
    fireEvent(window, new TouchEvent('touchmove', { touches: [{ clientY: 300 } as any] }));
    // Global touchend
    fireEvent(window, new TouchEvent('touchend'));
    
    unmount(); // covers useEffect cleanup
  });
  
  it('dynamic color transitions correctly', () => {
    render(<App />);
    const slider = screen.getByRole('slider');
    
    fireEvent.change(slider, { target: { value: 150 } });
    // Color should change (100 -> 200 range)
    expect(screen.getByText('150')).toHaveStyle('color: rgb(255, 225, 178)');
    
    fireEvent.change(slider, { target: { value: 250 } });
    // Color should change (200 -> 300 range)
    expect(screen.getByText('250')).toHaveStyle('color: rgb(255, 113, 65)');
  });
});
