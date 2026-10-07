import React, { useState, useEffect, useRef, useCallback } from 'react';
import { audioEngine } from './audioEngine';

export const App: React.FC = () => {
  // Volume: 0% to 300%
  const [volume, setVolume] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Invisible impediment detection & Guided Popup
  const [impedimentDetected, setImpedimentDetected] = useState<boolean>(false);
  const [impedimentMessage, setImpedimentMessage] = useState<{ title: string; desc: string; action: string } | null>(null);

  // Knob interaction state
  const isDragging = useRef<boolean>(false);
  const startY = useRef<number>(0);
  const startVal = useRef<number>(100);

  // Sync with Web Audio Engine (limiter is ALWAYS silently active)
  useEffect(() => {
    audioEngine.setBoostLevel(volume);
    audioEngine.setLimiterProtection(true); // Hardware safety silently enforced
    audioEngine.setBass(volume > 150 ? 5 : 2);
    audioEngine.setTreble(volume > 200 ? 4 : 1);
  }, [volume]);

  // "Under the hood" system limitation watcher
  const checkSystemImpediment = useCallback((val: number) => {
    if (val > 195 && !impedimentDetected) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);

      if (isIOS) {
        setImpedimentMessage({
          title: 'CALIBRAÇÃO iOS REQUERIDA',
          desc: 'O iOS atenua sons fortes por padrão. Para atingir potência plena sem compressão artificial, desmarque "Reduzir Sons Altos" em Ajustes > Sons e Tato.',
          action: 'CONFIRMAR CALIBRAÇÃO'
        });
        setImpedimentDetected(true);
      } else if (isAndroid) {
        setImpedimentMessage({
          title: 'LIMITE DE MÍDIA ANDROID',
          desc: 'O hardware requer liberação do limitador do sistema operacional. Certifique-se de que o "Limite de volume de mídia" em Configurações > Sons esteja desativado.',
          action: 'LIBERAR POTÊNCIA'
        });
        setImpedimentDetected(true);
      }
    }
  }, [impedimentDetected]);

  // Knob drag & touch handling
  const handleStart = (clientY: number) => {
    isDragging.current = true;
    startY.current = clientY;
    startVal.current = volume;

    if (!isPlaying) {
      audioEngine.startAcousticDemo(() => setIsPlaying(true));
    }
  };

  const handleMove = useCallback((clientY: number) => {
    if (!isDragging.current) return;
    const deltaY = startY.current - clientY;
    // 200px drag = 300% change
    const deltaVal = Math.round((deltaY / 220) * 300);
    const nextVal = Math.min(300, Math.max(0, startVal.current + deltaVal));
    setVolume(nextVal);
    checkSystemImpediment(nextVal);
  }, [checkSystemImpediment]);

  const handleEnd = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const onMouseUp = () => handleEnd();
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientY);
    };
    const onTouchEnd = () => handleEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleMove]);

  // Dynamic progressive color transitions across the entire range (0% -> 300%)
  // 0% - 100%: Pure Minimalist Monochrome White / Platinum (#ffffff)
  // 101% - 199%: Subtle Champagne Gold (#f5d590 -> #f0b850)
  // 200% - 300%: Aggressive Overdrive Crimson Red (#ff5a5a -> #ff2a2a)
  const getDynamicColor = () => {
    if (volume <= 100) {
      return '#ffffff';
    } else if (volume <= 200) {
      // Interpolate from white to champagne gold
      const factor = (volume - 100) / 100;
      const r = 255;
      const g = Math.round(255 - factor * (255 - 195)); // 255 -> 195
      const b = Math.round(255 - factor * (255 - 100)); // 255 -> 100
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Interpolate from gold to vivid crimson red
      const factor = (volume - 200) / 100;
      const r = 255;
      const g = Math.round(195 - factor * 165); // 195 -> 30
      const b = Math.round(100 - factor * 70);  // 100 -> 30
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const dynamicColor = getDynamicColor();

  const getDynamicGlow = () => {
    if (volume <= 100) return 'rgba(255, 255, 255, 0.2)';
    if (volume <= 200) return 'rgba(240, 184, 80, 0.45)';
    return 'rgba(255, 42, 42, 0.75)';
  };

  // SVG Circumference: 2 * Math.PI * 115 = ~722.5
  const strokeDash = 722.5;
  const progressOffset = strokeDash - (volume / 300) * strokeDash;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '50px 24px 60px 24px',
      position: 'relative',
      overflow: 'hidden',
      color: '#ffffff',
    }}>

      {/* TOP: Eleva Logo with custom 100+ emblem */}
      <header style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
      }}>
        {/* Typographic and Vector Hybrid Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          {/* Name ELEVA */}
          <span className="brand-font" style={{
            fontSize: '17px',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            paddingLeft: '0.35em',
          }}>
            ELEVA
          </span>

          {/* Minimalist Divider */}
          <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />

          {/* Custom "100" with "+" breaking through the 2nd zero with mathematical precision */}
          <svg width="74" height="34" viewBox="0 0 100 50" fill="none" style={{ overflow: 'visible' }}>
            {/* Digit "1" */}
            <text x="6" y="37" fill="#ffffff" fontSize="34" fontWeight="300" fontFamily="'Space Grotesk', sans-serif">1</text>
            
            {/* First "0" (Center: x=46, y=25, Radius: 14) */}
            <circle cx="46" cy="25" r="14" stroke="#ffffff" strokeWidth="2.2" />

            {/* Second "0" (Center: x=80, y=25, Radius: 14, Stroke: 2.2) */}
            <circle cx="80" cy="25" r="14" stroke="#ffffff" strokeWidth="2.2" />

            {/* Cross INSIDE the circle (WHITE, perfectly centered at x=80, y=25) */}
            {/* Inner bounds: from y=(25-13)=12 to y=(25+13)=38; from x=(80-13)=67 to x=(80+13)=93 */}
            <line x1="80" y1="12" x2="80" y2="38" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="square" />
            <line x1="67" y1="25" x2="93" y2="25" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="square" />

            {/* Cross OUTSIDE the circle (RED, perfectly collinear and straight) */}
            {/* Top red tip */}
            <line x1="80" y1="4" x2="80" y2="12" stroke="#ff2a2a" strokeWidth="2.4" strokeLinecap="round" />
            {/* Bottom red tip */}
            <line x1="80" y1="38" x2="80" y2="46" stroke="#ff2a2a" strokeWidth="2.4" strokeLinecap="round" />
            {/* Left red tip */}
            <line x1="59" y1="25" x2="67" y2="25" stroke="#ff2a2a" strokeWidth="2.4" strokeLinecap="round" />
            {/* Right red tip */}
            <line x1="93" y1="25" x2="101" y2="25" stroke="#ff2a2a" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </div>
      </header>

      {/* CENTER: The Pure Knob */}
      <div 
        onMouseDown={(e) => handleStart(e.clientY)}
        onTouchStart={(e) => e.touches[0] && handleStart(e.touches[0].clientY)}
        style={{
          width: '280px',
          height: '280px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'ns-resize',
          touchAction: 'none',
        }}
      >
        {/* Reactive Ambient Glow matching dynamicColor */}
        <div style={{
          position: 'absolute',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          boxShadow: `0 0 55px ${getDynamicGlow()}`,
          opacity: volume > 100 ? 0.9 : 0.2,
          transition: 'box-shadow 0.15s ease, opacity 0.15s ease',
          pointerEvents: 'none',
        }} />

        {/* Dynamic Contour SVG Ring */}
        <svg 
          style={{ 
            position: 'absolute', 
            width: '100%', 
            height: '100%', 
            transform: 'rotate(-90deg)', 
            pointerEvents: 'none' 
          }} 
          viewBox="0 0 280 280"
        >
          {/* Static track */}
          <circle
            cx="140"
            cy="140"
            r="115"
            fill="none"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="2"
          />
          {/* Active colored contour */}
          <circle
            cx="140"
            cy="140"
            r="115"
            fill="none"
            stroke={dynamicColor}
            strokeWidth={volume > 200 ? '3' : '2'}
            strokeDasharray={strokeDash}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            style={{ 
              transition: isDragging.current ? 'stroke 0.1s ease' : 'stroke-dashoffset 0.1s ease, stroke 0.15s ease',
              filter: `drop-shadow(0 0 6px ${getDynamicGlow()})`
            }}
          />
        </svg>

        {/* Inner Knob Surface */}
        <div style={{
          width: '210px',
          height: '210px',
          borderRadius: '50%',
          backgroundColor: '#050505',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 20px 40px rgba(0, 0, 0, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Numeric Value */}
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span 
              className="font-numeric" 
              style={{
                fontSize: '68px',
                fontWeight: 300,
                color: dynamicColor,
                letterSpacing: '-2px',
                lineHeight: 1,
                textShadow: volume > 200 ? `0 0 25px ${getDynamicGlow()}` : 'none',
                transition: 'color 0.15s ease',
              }}
            >
              {volume}
            </span>
            <span style={{
              fontSize: '18px',
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.35)',
              marginLeft: '2px',
            }}>
              %
            </span>
          </div>

          <span style={{
            fontSize: '9px',
            color: 'rgba(255, 255, 255, 0.3)',
            letterSpacing: '0.3em',
            marginTop: '8px',
            textTransform: 'uppercase',
          }}>
            {volume <= 100 ? 'NATURAL' : volume <= 200 ? 'BOOST' : 'OVERDRIVE'}
          </span>
        </div>
      </div>

      {/* BOTTOM: Minimalist Interactive Slider synchronized with contour color */}
      <div style={{
        width: '100%',
        maxWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px',
      }}>
        {/* Native Touch & Mouse Slider Bar */}
        <div style={{ width: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
          {/* Colored Active Progress Line beneath thumb */}
          <div 
            style={{
              position: 'absolute',
              left: 0,
              height: '2px',
              width: `${(volume / 300) * 100}%`,
              backgroundColor: dynamicColor,
              boxShadow: `0 0 10px ${getDynamicGlow()}`,
              transition: isDragging.current ? 'background-color 0.15s ease' : 'width 0.1s ease, background-color 0.15s ease',
              pointerEvents: 'none',
              zIndex: 1,
            }} 
          />

          <input
            type="range"
            min="0"
            max="300"
            value={volume}
            onChange={(e) => {
              const val = Number(e.target.value);
              setVolume(val);
              checkSystemImpediment(val);
              if (!isPlaying) audioEngine.startAcousticDemo(() => setIsPlaying(true));
            }}
            className="obsidian-slider"
            style={{ zIndex: 2 }}
          />
        </div>

        {/* Minimal Subtle Caption */}
        <span style={{
          fontSize: '9px',
          letterSpacing: '0.25em',
          color: 'rgba(255, 255, 255, 0.25)',
          textTransform: 'uppercase',
        }}>
          SLIDER DE CALIBRAÇÃO
        </span>
      </div>

      {/* UNDER-THE-HOOD GUIDED POPUP (Apenas se detectar impedimento de hardware) */}
      {impedimentDetected && impedimentMessage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.94)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px',
          zIndex: 100,
        }}>
          <div style={{
            maxWidth: '360px',
            width: '100%',
            backgroundColor: '#0a0a0a',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '16px',
          }}>
            {/* Minimal Icon */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={dynamicColor} strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>

            <h3 style={{
              fontSize: '12px',
              letterSpacing: '0.25em',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: '#ffffff',
            }}>
              {impedimentMessage.title}
            </h3>

            <p style={{
              fontSize: '12px',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: 300,
            }}>
              {impedimentMessage.desc}
            </p>

            <button
              onClick={() => setImpedimentDetected(false)}
              style={{
                width: '100%',
                marginTop: '8px',
                padding: '14px 0',
                backgroundColor: dynamicColor,
                border: 'none',
                color: '#000000',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.2em',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {impedimentMessage.action}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
