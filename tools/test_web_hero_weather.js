#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const index = fs.readFileSync(path.join(__dirname, '..', 'web', 'index.html'), 'utf8');
let checks = 0;
function ok(condition, label) {
  checks += 1;
  if (!condition) throw new Error(label);
}

const forecastSource = index.match(/function openMeteoUtcMs\(value\)\{[\s\S]*?\n  function getT0PadWeather/);
const artSource = index.match(/function heroWeatherNumber\(value\)\{[\s\S]*?\n  function heroMount/);
ok(!!forecastSource, 'T-0 forecast selector is extractable');
ok(!!artSource, 'hero weather renderer is extractable');

const forecastFunctions = new Function(
  `${forecastSource[0].replace(/\n  function getT0PadWeather[\s\S]*$/, '')}\n`+
  'return {openMeteoUtcMs,pickT0Forecast};'
)();
const artFunctions = new Function(
  `${artSource[0].replace(/\n  function heroMount[\s\S]*$/, '')}\n`+
  'return {heroWeatherState,heroWeatherSummary,heroArt};'
)();

const hourly = {
  time:['2026-08-05T11:00','2026-08-05T12:00','2026-08-05T13:00'],
  temperature_2m:[19,20,21], precipitation_probability:[10,70,40],
  precipitation:[0,1.2,.2], weather_code:[1,61,3], cloud_cover:[15,95,80],
  wind_speed_10m:[8,18,12], wind_direction_10m:[90,120,130],
  wind_gusts_10m:[14,42,24], visibility:[20000,7000,14000]
};
const selected = forecastFunctions.pickT0Forecast(hourly, Date.parse('2026-08-05T12:18:00Z'));
ok(selected && selected.temp === 20, 'nearest forecast hour is selected for scheduled T-0');
ok(selected && selected.code === 61 && selected.prob === 70, 'weather condition and probability stay on the same hour');
ok(selected && selected.forecastFor === '2026-08-05T12:00:00.000Z', 'GMT timestamps are normalized explicitly');
ok(forecastFunctions.pickT0Forecast(hourly, Date.parse('2026-08-05T15:00:00Z')) === null,
  'forecast more than ninety minutes from T-0 is rejected');

ok(artFunctions.heroWeatherState({code:0}).kind === 'CLEAR', 'WMO clear remains the untouched signature scene');
ok(artFunctions.heroWeatherState({code:3}).kind === 'CLOUD', 'overcast maps to cloud art');
ok(artFunctions.heroWeatherState({code:61}).kind === 'RAIN', 'rain maps to rain art');
ok(artFunctions.heroWeatherState({code:73}).kind === 'SNOW', 'snow maps to snow art');
ok(artFunctions.heroWeatherState({code:45}).kind === 'FOG', 'fog maps to low fog art');
ok(artFunctions.heroWeatherState({code:0,gust:48}).kind === 'WIND', 'strong gusts map to wind art');
ok(artFunctions.heroWeatherState({code:95,gust:60}).kind === 'STORM', 'storm takes precedence over strong wind');
ok(artFunctions.heroWeatherState({code:null,cloud:null,wind:null,gust:null,visibility:null}).kind === 'CLEAR',
  'missing numeric fields never become false fog or zero-value telemetry');

const rainArt = artFunctions.heroArt(1, 'pad', {code:61});
const stormArt = artFunctions.heroArt(0, 'pad', {code:95});
const clearArt = artFunctions.heroArt(1, 'pad', {code:0});
ok(rainArt.includes('|S C|') && rainArt.includes('( o.o )'), 'rain preserves the rocket and blinking cat silhouettes');
ok(stormArt.includes('|S C|') && stormArt.includes('FÉLICETTE'), 'storm preserves the signature crew scene');
ok(clearArt.includes('                 *'), 'clear weather leaves the original sky frame intact');
const clearWidth = Math.max(...clearArt.split('\n').map(line => line.length));
ok([3,45,61,73,95].every(code => Math.max(...artFunctions.heroArt(1,'pad',{code}).split('\n').map(line => line.length)) <= clearWidth),
  'weather layers never widen the mobile ASCII scene');
ok(artFunctions.heroWeatherSummary(selected,{kind:'RAIN'}).includes('PRECIP 70%'),
  'visible forecast summary carries precipitation probability');
ok(artFunctions.heroWeatherSummary(selected,{kind:'RAIN'}).endsWith('OPEN-METEO'),
  'visible forecast summary attributes its source');

ok(index.includes('&timezone=GMT&forecast_days=16&wind_speed_unit=kmh'), 'forecast request uses GMT and the supported sixteen-day horizon');
ok(index.includes('precipitation_probability,precipitation,weather_code,cloud_cover'), 'forecast requests weather-driving hourly fields');
ok(index.includes('wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility'), 'forecast requests wind and visibility fields');
ok(index.includes("localStorage.getItem('sc_pad_t0_wx_v1')"), 'T-0 forecast has a dedicated device cache');
ok(index.includes('now-cached.t<30*60*1000'), 'normal forecast cache prevents requests for thirty minutes');
ok(index.includes('target>now+16*24*60*60*1000'), 'missions beyond the forecast horizon produce no request');
ok(index.includes("if(!off&&weatherKey)getT0PadWeather(m)"), 'only a real mission with a valid weather key primes hero weather');
ok(index.includes("art.dataset.weather=weather?weather.kind.toLowerCase():'none'"), 'rendered hero exposes its weather state for QA');
ok(index.includes('T-0 weather forecast:'), 'accessible hero label discloses forecast semantics');
ok(index.includes('<span class="lbl">T-0 WX</span>'), 'mission panel labels weather as a T-0 forecast');
ok((index.match(/heroArtTimer=setInterval/g) || []).length === 1, 'weather reuses the existing low-motion hero timer');

const script = index.match(/<script>([\s\S]*?)<\/script>/);
ok(!!script, 'main script exists');
new Function(script[1]);
checks += 1;

console.log(`T-0 hero weather checks OK (${checks})`);
