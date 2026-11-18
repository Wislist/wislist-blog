/* First-party visitor cards. One statistics submission per document; no retries. */
(function () {
  'use strict';
  if (window.__visitorSidebarLoaded) return;
  window.__visitorSidebarLoaded = true;

  function start() {
    if (!document.getElementById('visitor-sidebar')) return;
    const base = 'https://twikoo.wislist0721.workers.dev';
    const element = id => document.getElementById(id);
    const setText = (id, text) => { element(id).textContent = text; };

    function greet(hour) {
      setText('visitor-weather-title', hour < 6 ? '夜深了，注意休息' : hour < 11 ? '早上好，欢迎来访' : hour < 14 ? '中午好，欢迎来访' : hour < 18 ? '下午好，欢迎来访' : '晚上好，欢迎来访');
    }
    greet(new Date().getHours());

    function renderWeather(data) {
        // localTime is already wall-clock time at the estimated location, not UTC.
        const hour = typeof data.localTime === 'string' && data.localTime.match(/^\d{4}-\d{2}-\d{2}T(\d{2}):/);
        if (hour && Number(hour[1]) < 24) greet(Number(hour[1]));
        const location = [data.city, data.region, data.country].filter(part => typeof part === 'string' && part.trim());
        setText('visitor-location', location.length ? location.join(' · ') + '（IP 估算）' : '暂时无法识别所在城市（IP 估算）');
        setText('visitor-location-note', hour ? '问候依据访问者当地时间；位置由 IP 估算。' : '问候依据浏览器时间；位置由 IP 估算。');
        const weather = data.weather;
        const descriptions = {
          0: '晴', 1: '大部晴朗', 2: '局部多云', 3: '阴',
          45: '雾', 48: '雾凇', 51: '小毛毛雨', 53: '毛毛雨', 55: '强毛毛雨',
          56: '轻微冻毛毛雨', 57: '强冻毛毛雨', 61: '小雨', 63: '中雨', 65: '大雨',
          66: '轻微冻雨', 67: '强冻雨', 71: '小雪', 73: '中雪', 75: '大雪', 77: '米雪',
          80: '小阵雨', 81: '中阵雨', 82: '强阵雨', 85: '小阵雪', 86: '强阵雪',
          95: '雷暴', 96: '雷暴伴小冰雹', 99: '雷暴伴强冰雹'
        };
        if (!weather || !Number.isFinite(weather.temperature) || !Number.isFinite(weather.apparentTemperature)) {
          setText('visitor-weather', '天气暂不可用，请稍后再访。');
        } else {
          const description = descriptions[weather.code] || '天气状况未知';
          setText('visitor-weather', description + ' · ' + Math.round(weather.temperature) + '°C · 体感 ' + Math.round(weather.apparentTemperature) + '°C');
        }
    }

    async function loadWeather() {
      const key = 'wislist.weather.v1';
      const status = element('visitor-weather-status');
      try {
        const cached = JSON.parse(sessionStorage.getItem(key) || 'null');
        const age = cached && Date.now() - cached.savedAt;
        if (cached && age >= 0 && age < 600000 && cached.data.weather && Number.isFinite(cached.data.weather.temperature)) {
          // Advance the cached local wall clock instead of freezing the greeting.
          const local = Date.parse(cached.data.localTime + 'Z');
          if (Number.isFinite(local)) cached.data.localTime = new Date(local + age).toISOString().slice(0, 19);
          renderWeather(cached.data);
          status.setAttribute('aria-busy', 'false');
          return;
        }
      } catch (error) { /* Storage may be unavailable; request live weather. */ }
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      try {
        const response = await fetch(base + '/visitor-weather', { signal: controller.signal });
        if (!response.ok) throw new Error('Weather unavailable');
        const data = await response.json();
        renderWeather(data);
        if (data.weather && Number.isFinite(data.weather.temperature) && Number.isFinite(data.weather.apparentTemperature)) {
          try { sessionStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data })); } catch (error) { /* Rendering does not depend on storage. */ }
        }
      } catch (error) {
        setText('visitor-location', '暂时无法获取位置与天气。');
        setText('visitor-weather', '天气服务暂不可用。');
        setText('visitor-location-note', '问候依据浏览器时间；不申请定位权限。');
      } finally {
        clearTimeout(timer);
        status.setAttribute('aria-busy', 'false');
      }
    }

    async function loadStats() {
      const status = element('visitor-stats-status');
      if (['localhost', '127.0.0.1', '::1', '[::1]'].includes(location.hostname) || location.protocol === 'file:') {
        status.textContent = '本地预览不计数';
        status.setAttribute('aria-busy', 'false');
        return;
      }
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      try {
        const key = 'wislist.visitorId';
        let visitorId;
        try { visitorId = localStorage.getItem(key); } catch (error) { /* Storage may be disabled. */ }
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitorId || '')) {
          visitorId = crypto.randomUUID();
          try { localStorage.setItem(key, visitorId); } catch (error) { /* Keep this document's UUID. */ }
        }
        const response = await fetch(base + '/site-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorId }),
          signal: controller.signal
        });
        if (!response.ok) throw new Error('Statistics unavailable');
        const data = await response.json();
        if (![data.views, data.visitors, data.todayViews].every(value => Number.isSafeInteger(value) && value >= 0) || !/^\d{4}-\d{2}-\d{2}$/.test(data.since)) {
          throw new Error('Invalid statistics');
        }
        setText('visitor-total-views', data.views.toLocaleString('zh-CN'));
        setText('visitor-total-visitors', data.visitors.toLocaleString('zh-CN'));
        setText('visitor-today-views', data.todayViews.toLocaleString('zh-CN'));
        setText('visitor-stats-since', data.since);
        element('visitor-stats-values').hidden = false;
        status.textContent = '实时访问统计';
      } catch (error) {
        status.textContent = '访问统计暂不可用；本页不自动重试。';
      } finally {
        clearTimeout(timer);
        status.setAttribute('aria-busy', 'false');
      }
    }
    loadWeather();
    loadStats();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
