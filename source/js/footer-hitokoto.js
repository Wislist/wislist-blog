(() => {
  'use strict';

  const footer = document.getElementById('footer-hitokoto');
  if (!footer) return;
  const copyright = document.querySelector('.footer-inner .copyright');
  if (copyright) copyright.before(footer);
  footer.hidden = false;

  const text = document.getElementById('hitokoto-text');
  const measure = document.getElementById('hitokoto-measure');
  const link = document.getElementById('hitokoto-link');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const segmenter = typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter('zh-CN', { granularity: 'grapheme' }) : null;
  let visible = false;
  let suspended = false;
  let phase = 'waiting';
  let current;
  let upcoming;
  let characters = [];
  let position = 0;
  let timer;
  let request;

  const active = () => visible && !document.hidden && !suspended;
  const readingTime = () => Math.max(2400, Math.min(characters.length * 90, 5000));

  function schedule(delay) {
    clearTimeout(timer);
    if (active()) timer = setTimeout(advance, delay);
  }

  async function loadNext() {
    if (request || upcoming || !active()) return;
    const controller = new AbortController();
    request = controller;
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('https://v1.hitokoto.cn/?c=a&c=b&max_length=60', {
        signal: controller.signal,
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Hitokoto unavailable');
      const quote = await response.json();
      if (typeof quote.hitokoto !== 'string' || !quote.hitokoto.trim() ||
          typeof quote.uuid !== 'string' || !quote.uuid) {
        throw new Error('Invalid Hitokoto response');
      }
      upcoming = quote;
      if (phase === 'waiting') schedule(0);
    } catch (error) {
      // 接口不可用时保留真实的上一句，不显示操作说明或伪造新句。
      if (phase === 'waiting') {
        if (current) text.textContent = current.hitokoto;
        schedule(10000);
      }
    } finally {
      clearTimeout(timeout);
      request = null;
    }
  }

  function advance() {
    if (!active()) return;
    if (phase === 'waiting') {
      if (!upcoming) {
        loadNext();
        return;
      }
      current = upcoming;
      upcoming = null;
      characters = segmenter
        ? Array.from(segmenter.segment(current.hitokoto), part => part.segment)
        : Array.from(current.hitokoto);
      position = 0;
      measure.textContent = current.hitokoto;
      text.textContent = '';
      link.href = `https://hitokoto.cn/?uuid=${encodeURIComponent(current.uuid)}`;
      link.setAttribute('aria-label', current.hitokoto);
      phase = 'typing';
    }

    if (phase === 'typing') {
      position = reducedMotion.matches ? characters.length : position + 1;
      text.textContent = characters.slice(0, position).join('');
      if (position === characters.length) {
        phase = 'holding';
        loadNext();
        schedule(readingTime());
      } else {
        schedule(85);
      }
    } else if (phase === 'holding') {
      phase = reducedMotion.matches ? 'waiting' : 'erasing';
      schedule(0);
    } else if (phase === 'erasing') {
      position = Math.max(0, position - 1);
      text.textContent = characters.slice(0, position).join('');
      if (position === 0) phase = 'waiting';
      schedule(position === 0 ? 300 : 45);
    }
  }

  function resume() {
    schedule(phase === 'holding' ? readingTime() : 0);
  }

  // 离开页脚或切到后台时暂停，回来后继续，不在后台消耗公益接口。
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    resume();
  });
  observer.observe(footer);
  document.addEventListener('visibilitychange', resume);
  window.addEventListener('pagehide', () => {
    suspended = true;
    clearTimeout(timer);
    request?.abort();
  });
  window.addEventListener('pageshow', () => {
    suspended = false;
    resume();
  });
})();