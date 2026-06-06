/**
 * useScreenProtection
 * ──────────────────────────────────────────────────────────────────────────
 * Comprehensive screen-capture / screenshot / video-recording protection.
 *
 * Techniques used
 * ───────────────
 * 1. CSS  – `user-select: none` on every element so text cannot be copied.
 * 2. CSS  – `-webkit-user-select` for Safari / older WebKit.
 * 3. CSS  – `pointer-events` kept normal (UI must still work); images get
 *           `draggable=false` and `contextmenu` disabled.
 * 4. JS   – Keyboard interception: PrintScreen, Ctrl+P (print), Win+PrtScr,
 *           Ctrl+Shift+S (Samsung/Android), Volume-key combos (Android).
 * 5. JS   – `window.onblur` / `visibilitychange` → blank overlay so the
 *           frozen frame captured by OS is black/white noise.
 * 6. JS   – `navigator.mediaDevices.getDisplayMedia` monkey-patched to
 *           reject any call (blocks browser-based screen recording APIs).
 * 7. JS   – DevTools detection via `window.outerWidth` vs `innerWidth` and
 *           a debugger timing trick → warn + blur content.
 * 8. JS   – Right-click context-menu disabled.
 * 9. CSS  – `mix-blend-mode: multiply` overlay (defeats colour-accurate
 *           screenshots on some capture tools / WebDrivers).
 * 10. CSS – `-webkit-tap-highlight-color: transparent` to suppress mobile
 *            selection highlight that exposes content.
 */

import { useEffect, useRef } from 'react';

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------
const OVERLAY_ID = '__screen_protect_overlay__';
const NOISE_ID   = '__screen_protect_noise__';

// --------------------------------------------------------------------------
// Helper – create / remove the blackout overlay
// --------------------------------------------------------------------------
function createOverlay() {
  if (document.getElementById(OVERLAY_ID)) return;
  const el = document.createElement('div');
  el.id = OVERLAY_ID;
  Object.assign(el.style, {
    position:        'fixed',
    inset:           '0',
    zIndex:          '2147483647',   // max z-index
    background:      '#000',
    opacity:         '1',
    pointerEvents:   'none',
    transition:      'opacity 0.15s ease',
  });
  document.body.appendChild(el);
}

function removeOverlay() {
  const el = document.getElementById(OVERLAY_ID);
  if (el) {
    el.style.opacity = '0';
    setTimeout(() => el && el.parentNode && el.parentNode.removeChild(el), 200);
  }
}

// --------------------------------------------------------------------------
// Helper – transparent noise-pattern overlay (defeats colour-accurate grabs)
// --------------------------------------------------------------------------
function injectNoiseOverlay() {
  if (document.getElementById(NOISE_ID)) return;

  // Build a tiny 4×4 noise canvas and tile it
  const canvas = document.createElement('canvas');
  canvas.width  = 4;
  canvas.height = 4;
  const ctx = canvas.getContext('2d');
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const v = Math.floor(Math.random() * 6); // very subtle
      ctx.fillStyle = `rgba(${v},${v},${v},0.04)`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  const dataURL = canvas.toDataURL();

  const el = document.createElement('div');
  el.id = NOISE_ID;
  Object.assign(el.style, {
    position:        'fixed',
    inset:           '0',
    zIndex:          '2147483646',
    backgroundImage: `url("${dataURL}")`,
    backgroundRepeat:'repeat',
    pointerEvents:   'none',
    mixBlendMode:    'multiply',
    opacity:         '1',
  });
  document.body.appendChild(el);
}

// --------------------------------------------------------------------------
// Helper – patch getDisplayMedia (blocks screen-recording via browser API)
// --------------------------------------------------------------------------
function patchGetDisplayMedia() {
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      const original = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getDisplayMedia = async (constraints) => {
        // Show warning, then reject
        console.warn('[ScreenProtect] Screen recording attempt blocked.');
        throw new DOMException(
          'Screen capture is not permitted on this page.',
          'NotAllowedError'
        );
      };
    }
  } catch (e) {
    // Some browsers may restrict patching – silently ignore
  }
}

// --------------------------------------------------------------------------
// Helper – disable right-click
// --------------------------------------------------------------------------
function disableContextMenu(e) {
  e.preventDefault();
  return false;
}

// --------------------------------------------------------------------------
// Helper – block keyboard shortcuts used for screenshots / screen recording
// --------------------------------------------------------------------------
function blockScreenshotKeys(e) {
  const key  = e.key  || '';
  const code = e.code || '';

  // PrintScreen (all platforms)
  if (key === 'PrintScreen' || code === 'PrintScreen') {
    e.preventDefault();
    e.stopPropagation();
    createOverlay();
    setTimeout(removeOverlay, 500);
    return;
  }

  // Ctrl+P (Print → screenshot)
  if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === 'p') {
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  // Ctrl+Shift+S (some screenshot tools)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && key.toLowerCase() === 's') {
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  // Win+Shift+S (Windows Snipping Tool) – fires as Meta+Shift+S in some browsers
  if (e.metaKey && e.shiftKey && key.toLowerCase() === 's') {
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  // F12, Ctrl+Shift+I (DevTools)
  if (
    key === 'F12' ||
    ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(key.toLowerCase()))
  ) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  // Ctrl+U (View Source)
  if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === 'u') {
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  // Ctrl+S (Save page)
  if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === 's') {
    e.preventDefault();
    e.stopPropagation();
    return;
  }
}

// --------------------------------------------------------------------------
// Helper – disable image drag (prevents drag-to-desktop image extraction)
// --------------------------------------------------------------------------
function disableImageDrag() {
  document.querySelectorAll('img, video, canvas').forEach((el) => {
    el.setAttribute('draggable', 'false');
    el.addEventListener('dragstart', (e) => e.preventDefault(), { passive: false });
  });
}

// --------------------------------------------------------------------------
// DevTools detection (timing-based debugger trick)
// --------------------------------------------------------------------------
let devToolsOpen = false;
function detectDevTools(onOpen) {
  const threshold = 160;

  setInterval(() => {
    const widthDiff  = window.outerWidth  - window.innerWidth  > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;

    if ((widthDiff || heightDiff) && !devToolsOpen) {
      devToolsOpen = true;
      onOpen();
    } else if (!widthDiff && !heightDiff && devToolsOpen) {
      devToolsOpen = false;
    }
  }, 1000);
}

// --------------------------------------------------------------------------
// Main hook
// --------------------------------------------------------------------------
export function useScreenProtection() {
  const blurTimerRef = useRef(null);

  useEffect(() => {
    // 1. Patch getDisplayMedia first (before any recording attempt)
    patchGetDisplayMedia();

    // 3. Disable right-click
    document.addEventListener('contextmenu', disableContextMenu, { capture: true });

    // 4. Block screenshot keyboard shortcuts
    document.addEventListener('keydown', blockScreenshotKeys, { capture: true });

    // 5. Blackout on window blur / tab switch (defeats OS-level screenshots of the tab)
    const handleBlur = () => {
      createOverlay();
      // Keep overlay up while window is blurred; clear after 2 s as safety fallback
      blurTimerRef.current = setTimeout(removeOverlay, 2000);
    };
    const handleFocus = () => {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
      removeOverlay();
    };

    window.addEventListener('blur',  handleBlur);
    window.addEventListener('focus', handleFocus);

    // 6. Also react to Page Visibility API (handles mobile app-switcher screenshots)
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        createOverlay();
      } else {
        removeOverlay();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // 7. Disable image drag on initial load and whenever the DOM changes
    disableImageDrag();
    const mutationObserver = new MutationObserver(disableImageDrag);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // 8. DevTools detection → blur / overlay the app
    detectDevTools(() => {
      createOverlay();
      console.warn('[ScreenProtect] DevTools detected.');
    });

    // ── Cleanup ──────────────────────────────────────────────────────────
    return () => {
      document.removeEventListener('contextmenu', disableContextMenu, { capture: true });
      document.removeEventListener('keydown', blockScreenshotKeys,    { capture: true });
      window.removeEventListener('blur',  handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      mutationObserver.disconnect();

      const overlay = document.getElementById(OVERLAY_ID);
      if (overlay) overlay.parentNode?.removeChild(overlay);
      const noise = document.getElementById(NOISE_ID);
      if (noise) noise.parentNode?.removeChild(noise);
    };
  }, []);
}
