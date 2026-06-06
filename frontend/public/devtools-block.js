(function () {
  'use strict';

  // ── REDIRECT TARGET when tampering detected ────────────────────────────────
  function die() {
    document.documentElement.innerHTML = '';
    window.location.replace('about:blank');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 1. BLOCK CONTEXT MENU (right-click)
  // ══════════════════════════════════════════════════════════════════════════
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return false;
  }, true);

  // ══════════════════════════════════════════════════════════════════════════
  // 2. BLOCK ALL DEVTOOLS & SOURCE-VIEW KEYBOARD SHORTCUTS
  // ══════════════════════════════════════════════════════════════════════════
  var BLOCKED_KEYS = {
    123: true, // F12
  };
  var BLOCKED_CTRL_SHIFT = ['i','j','c','k','e','l','m','p','q'];
  var BLOCKED_CTRL       = ['u','s','a','p','h'];
  var BLOCKED_CTRL_ALT   = ['i','j'];

  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    var code = e.keyCode || e.which;

    if (BLOCKED_KEYS[code]) {
      e.preventDefault(); e.stopImmediatePropagation(); return false;
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && BLOCKED_CTRL_SHIFT.includes(k)) {
      e.preventDefault(); e.stopImmediatePropagation(); return false;
    }
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && BLOCKED_CTRL.includes(k)) {
      e.preventDefault(); e.stopImmediatePropagation(); return false;
    }
    if ((e.ctrlKey || e.metaKey) && e.altKey && BLOCKED_CTRL_ALT.includes(k)) {
      e.preventDefault(); e.stopImmediatePropagation(); return false;
    }
    // F1–F12 all blocked
    if (code >= 112 && code <= 123) {
      e.preventDefault(); e.stopImmediatePropagation(); return false;
    }
  }, true);

  // ══════════════════════════════════════════════════════════════════════════
  // 3. DEBUGGER TRAP — freezes DevTools console
  // ══════════════════════════════════════════════════════════════════════════
  var _dt = function () {};
  _dt.toString = function () {
    die();
    return '';
  };
  Object.defineProperty(_dt, 'name', {
    get: function () { die(); return ''; }
  });

  function debuggerLoop() {
    var t1 = performance.now();
    // eslint-disable-next-line no-debugger
    debugger;
    if (performance.now() - t1 > 80) die();
  }
  setInterval(debuggerLoop, 800);

  // ══════════════════════════════════════════════════════════════════════════
  // 4. WINDOW SIZE DETECTION (docked DevTools shrinks inner dimensions)
  // ══════════════════════════════════════════════════════════════════════════
  var _threshold = 150;
  function sizeCheck() {
    if (
      window.outerWidth  - window.innerWidth  > _threshold ||
      window.outerHeight - window.innerHeight > _threshold
    ) die();
  }
  setInterval(sizeCheck, 500);
  window.addEventListener('resize', sizeCheck);

  // ══════════════════════════════════════════════════════════════════════════
  // 5. CONSOLE OBJECT TAMPERING DETECTION
  // Detects when DevTools re-exposes console after being overridden
  // ══════════════════════════════════════════════════════════════════════════
  var _consoleMethods = ['log','warn','error','info','debug','table','dir','clear'];
  _consoleMethods.forEach(function (m) {
    try {
      var orig = console[m];
      console[m] = function () {
        die();
        return orig.apply(console, arguments);
      };
    } catch (ex) {}
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. toString / getter TRAP — fires when DevTools auto-inspects objects
  // ══════════════════════════════════════════════════════════════════════════
  var _trap = /./;
  _trap.toString = function () { die(); return ''; };
  setInterval(function () { console.log('%c', _trap); }, 1000);

  // ══════════════════════════════════════════════════════════════════════════
  // 7. DEVTOOLS GLOBAL DETECTION via chrome/firebug/safari APIs
  // ══════════════════════════════════════════════════════════════════════════
  function checkGlobals() {
    try {
      // Firebug
      if (window.console && window.console.firebug) die();
      // Firefox DevTools
      if (window._Firebug) die();
      // Chrome extensions that expose devtools
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__ &&
          window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers &&
          window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.size > 0) {
        // Allow React DevTools hook to exist but neutralize it
        try {
          window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = function () {};
          window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = function () {};
          window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberUnmount = function () {};
        } catch (ex) {}
      }
    } catch (ex) {}
  }
  setInterval(checkGlobals, 1000);

  // ══════════════════════════════════════════════════════════════════════════
  // 8. BLOCK TEXT SELECTION & DRAG
  // ══════════════════════════════════════════════════════════════════════════
  document.addEventListener('selectstart', function (e) {
    if (!['INPUT','TEXTAREA'].includes(e.target.tagName)) {
      e.preventDefault(); return false;
    }
  }, true);
  document.addEventListener('dragstart', function (e) {
    e.preventDefault(); return false;
  }, true);
  document.addEventListener('copy',  function (e) { e.preventDefault(); }, true);
  document.addEventListener('cut',   function (e) { e.preventDefault(); }, true);
  document.addEventListener('paste', function (e) {
    if (!['INPUT','TEXTAREA'].includes(e.target.tagName)) {
      e.preventDefault();
    }
  }, true);

  // ══════════════════════════════════════════════════════════════════════════
  // 9. BLOCK PRINT
  // ══════════════════════════════════════════════════════════════════════════
  window.addEventListener('beforeprint', function (e) {
    e.preventDefault();
    window.stop();
    return false;
  });
  // Override window.print itself
  try {
    Object.defineProperty(window, 'print', {
      value: function () {},
      writable: false,
      configurable: false
    });
  } catch (ex) {}

  // ══════════════════════════════════════════════════════════════════════════
  // 10. DISABLE VIEW-SOURCE PROTOCOL
  // ══════════════════════════════════════════════════════════════════════════
  window.addEventListener('beforeunload', function (e) {
    var url = document.activeElement && document.activeElement.href;
    if (url && url.startsWith('view-source:')) {
      e.preventDefault();
      return false;
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 11. FREEZE CONSOLE OBJECT — prevent devs reassigning it
  // ══════════════════════════════════════════════════════════════════════════
  try {
    Object.defineProperty(window, 'console', {
      get: function () { return { log:function(){}, warn:function(){}, error:function(){}, info:function(){}, debug:function(){}, table:function(){}, dir:function(){}, clear:function(){} }; },
      configurable: false
    });
  } catch (ex) {}

  // ══════════════════════════════════════════════════════════════════════════
  // 12. MUTATION OBSERVER — detects if someone injects script tags into DOM
  // ══════════════════════════════════════════════════════════════════════════
  var _observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.tagName === 'SCRIPT') {
          var src = node.src || '';
          var allowed = ['localhost', window.location.hostname];
          var isAllowed = allowed.some(function (h) { return src.includes(h) || src === ''; });
          if (!isAllowed) {
            node.parentNode && node.parentNode.removeChild(node);
            die();
          }
        }
      });
    });
  });
  _observer.observe(document.documentElement, { childList: true, subtree: true });

  // ══════════════════════════════════════════════════════════════════════════
  // 13. IFRAME / EMBED PROTECTION — refuse to run inside a frame
  // ══════════════════════════════════════════════════════════════════════════
  if (window.top !== window.self) {
    die();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 14. BLOCK ERUDA, VCONSOLE & OTHER MOBILE DEVTOOLS LIBRARIES
  // ══════════════════════════════════════════════════════════════════════════
  var DEVTOOLS_GLOBALS = ['eruda','vConsole','VConsole','__vconsole','__eruda','Firebug','firebug'];
  setInterval(function () {
    DEVTOOLS_GLOBALS.forEach(function (g) {
      if (window[g]) {
        try { window[g].destroy && window[g].destroy(); } catch (ex) {}
        try {
          Object.defineProperty(window, g, {
            get: function () { return undefined; },
            set: function () {},
            configurable: false
          });
        } catch (ex) {}
        die();
      }
    });
  }, 500);

}());
