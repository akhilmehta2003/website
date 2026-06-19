/**
 * Genex Logistics - Advanced Web Analytics & Form Tracking Client
 * Exposes page timing, behavioral retention flow, form abandonment, and exit beacons.
 */
(function() {
  const BACKEND_URL = 'http://localhost:5000'; // Target Node.js Express server
  
  // 1. Identity & Session Helpers
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
  }

  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Get or initialize persistent visitor ID
  function getVisitorId() {
    let visitorId = getCookie('visitor_id');
    if (!visitorId) {
      visitorId = generateUUID();
      setCookie('visitor_id', visitorId, 365); // 1 year persistence
    }
    return visitorId;
  }

  // Get or initialize tab-session ID
  function getSessionId() {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = generateUUID();
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  const visitorId = getVisitorId();
  const sessionId = getSessionId();

  // 2. Event Dispatch Engine
  function sendEvent(payload, useBeacon = false) {
    // Inject system state metadata
    const fullPayload = {
      visitorId,
      sessionId,
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timestamp: new Date().toISOString(),
      ...payload
    };

    const targetUrl = `${BACKEND_URL}/api/analytics/event`;

    if (useBeacon && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([JSON.stringify(fullPayload)], { type: 'application/json' });
      navigator.sendBeacon(targetUrl, blob);
    } else {
      fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload),
        keepalive: true
      }).catch(err => console.warn('Analytics push failed:', err));
    }
  }

  // 3. Performance ("Buffer Time") Tracker
  function trackPerformance() {
    // Use modern PerformanceObserver if available, otherwise fallback to window.load
    const perfData = {};
    
    const navEntries = window.performance.getEntriesByType('navigation');
    if (navEntries && navEntries.length > 0) {
      const nav = navEntries[0];
      perfData.loadTimeMs = Math.round(nav.loadEventEnd || (performance.now()));
      perfData.ttfbMs = Math.round(nav.responseStart - nav.requestStart);
      
      // Cache hits analysis
      if (nav.transferSize === 0 && nav.decodedBodySize > 0) {
        perfData.cacheStatus = 'disk-cache';
      } else {
        perfData.cacheStatus = 'network';
      }
    } else {
      // Legacy Timing API fallback
      const timing = window.performance.timing;
      if (timing) {
        perfData.loadTimeMs = timing.loadEventEnd - timing.navigationStart;
        perfData.ttfbMs = timing.responseStart - timing.requestStart;
        perfData.cacheStatus = 'legacy';
      }
    }

    sendEvent({
      eventType: 'pageview',
      loadTimeMs: perfData.loadTimeMs || 0,
      ttfbMs: perfData.ttfbMs || 0,
      cacheStatus: perfData.cacheStatus || 'unknown'
    });
  }

  // Hook performance loading after fully rendered
  if (document.readyState === 'complete') {
    setTimeout(trackPerformance, 100);
  } else {
    window.addEventListener('load', () => setTimeout(trackPerformance, 100));
  }

  // 4. Inactivity & Idle Time Tracker
  let idleTime = 0;
  let isIdle = false;
  const IDLE_THRESHOLD_SECONDS = 15; // 15 seconds threshold
  let idleInterval;

  function resetIdleTimer() {
    if (isIdle) {
      isIdle = false;
      sendEvent({
        eventType: 'user_active',
        idleDurationSec: idleTime
      });
    }
    idleTime = 0;
  }

  // Listen for activity metrics
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(evt => {
    window.addEventListener(evt, resetIdleTimer, { passive: true });
  });

  idleInterval = setInterval(() => {
    idleTime++;
    if (idleTime >= IDLE_THRESHOLD_SECONDS && !isIdle) {
      isIdle = true;
      sendEvent({
        eventType: 'user_idle',
        idleDurationSec: idleTime
      });
    }
  }, 1000);

  // 5. Form Abandonment & In-Progress Fields Tracker
  let formStarted = false;
  let formSubmitted = false;
  const touchedFields = new Set();
  const formElement = document.getElementById('contact-inquiry-form');

  if (formElement) {
    const inputs = formElement.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      // Monitor field focus
      input.addEventListener('focus', () => {
        if (!formStarted) {
          formStarted = true;
          sendEvent({ eventType: 'form_start', target: 'form#contact-inquiry-form' });
        }
        touchedFields.add(input.id || input.name);
      });

      // Monitor field typing inputs
      input.addEventListener('input', () => {
        touchedFields.add(input.id || input.name);
      });
    });

    // Capture success state to cancel abandonment trigger
    formElement.addEventListener('submit', () => {
      formSubmitted = true;
      sendEvent({
        eventType: 'form_submit_click',
        target: 'form#contact-inquiry-form',
        value: Array.from(touchedFields).join(',')
      });
    });
  }

  // 6. Behavioral Journey & Drop-off exit page trigger
  function handleExitBeacon() {
    clearInterval(idleInterval);
    
    // If B2B RFP was started but never sent, trigger form abandonment beacon
    if (formStarted && !formSubmitted) {
      sendEvent({
        eventType: 'form_abandon',
        target: 'form#contact-inquiry-form',
        value: Array.from(touchedFields).join(',')
      }, true);
    }

    // Capture exit page parameters
    sendEvent({
      eventType: 'exit_page',
      idleDurationSec: idleTime
    }, true);
  }

  // Modern browsers: visibilitychange is highly reliable on mobile & desktop exit
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      handleExitBeacon();
    }
  });

  // Fallback for older browsers
  window.addEventListener('beforeunload', handleExitBeacon);

})();
