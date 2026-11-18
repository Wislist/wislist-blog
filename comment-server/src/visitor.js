const localOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/

function json (data, headers, status = 200) {
  return Response.json(data, { status, headers })
}

export async function visitorRequest (request, env) {
  const path = new URL(request.url).pathname
  if (path !== '/visitor-weather' && path !== '/site-stats') return null

  const origin = request.headers.get('Origin')
  const allowed = origin === 'https://wislist.site' || localOrigin.test(origin || '')
  const headers = { 'Cache-Control': 'no-store', Vary: 'Origin' }
  if (allowed) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Content-Type'
  }
  if (origin && !allowed) return json({ error: 'Origin not allowed' }, headers, 403)
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })

  if (path === '/visitor-weather') {
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, headers, 405)
    const cf = request.cf || {}
    const result = { city: cf.city || '', region: cf.region || '', country: cf.country || '', localTime: '', weather: null }
    if (cf.timezone) {
      try {
        result.localTime = new Intl.DateTimeFormat('sv-SE', {
          timeZone: cf.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
        }).format(new Date()).replace(' ', 'T')
      } catch {}
    }
    if (!cf.latitude || !cf.longitude) {
      return json({ ...result, weatherError: '无法估算当前位置' }, headers)
    }
    const url = new URL('https://api.open-meteo.com/v1/forecast')
    url.search = new URLSearchParams({
      latitude: Number(cf.latitude).toFixed(1), longitude: Number(cf.longitude).toFixed(1), timezone: 'auto',
      current: 'temperature_2m,apparent_temperature,weather_code,is_day,wind_speed_10m'
    }).toString()
    try {
      // Cache only provider weather, never a visitor's city or location metadata.
      const cache = caches.default
      const cacheKey = new Request(new URL('/__weather-cache?' + url.searchParams, request.url))
      const cached = await cache.match(cacheKey)
      const response = cached || await fetch(url, { signal: AbortSignal.timeout(4000) })
      if (!response.ok) throw new Error('Weather service unavailable')
      const payload = await response.json()
      const { current } = payload
      if (!current || !Number.isFinite(current.temperature_2m) || !Number.isFinite(current.apparent_temperature) || !Number.isInteger(current.weather_code)) {
        throw new Error('Invalid weather response')
      }
      if (!cached) {
        await cache.put(cacheKey, Response.json(payload, { headers: { 'Cache-Control': 'public, max-age=600' } }))
      }
      result.localTime = result.localTime || current.time || ''
      result.weather = {
        temperature: current.temperature_2m, apparentTemperature: current.apparent_temperature,
        code: current.weather_code, isDay: current.is_day === 1, windSpeed: current.wind_speed_10m
      }
      return json(result, headers)
    } catch (error) {
      console.error('Visitor weather failed', error)
      return json({ ...result, weatherError: '天气服务暂时不可用' }, headers)
    }
  }

  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, headers, 405)
  if (!allowed || origin !== 'https://wislist.site') return json({ error: 'Only production visits are counted' }, headers, 403)
  let body
  try { body = await request.json() } catch { return json({ error: 'Invalid JSON' }, headers, 400) }
  if (typeof body.visitorId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.visitorId)) {
    return json({ error: 'Invalid visitor ID' }, headers, 400)
  }
  try {
    // D1 batch is transactional. changes() belongs to the immediately preceding
    // INSERT, so unique-browser and page-view counters advance together.
    const results = await env.DB.batch([
      env.DB.prepare('INSERT OR IGNORE INTO site_visitors (id) VALUES (?)').bind(body.visitorId),
      env.DB.prepare(`UPDATE site_metrics SET views = views + 1, visitors = visitors + changes(),
        today_views = CASE WHEN today_date = date('now', '+8 hours') THEN today_views + 1 ELSE 1 END,
        today_date = date('now', '+8 hours') WHERE id = 1`),
      env.DB.prepare('SELECT views, visitors, today_views AS todayViews, since FROM site_metrics WHERE id = 1')
    ])
    return json(results[2].results[0], headers)
  } catch (error) {
    console.error('Site metrics failed', error)
    return json({ error: '访问统计暂时不可用' }, headers, 503)
  }
}
