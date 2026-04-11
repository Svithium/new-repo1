const weather_codes = {
     0: { name: "Clear Sky",               icon: { day: "☀️", night: "🌙" } },
     1: { name: "Mainly Clear",            icon: { day: "🌤️", night: "🌙" } },
     2: { name: "Partly Cloudy",           icon: { day: "⛅", night: "🌥️" } },
     3: { name: "Overcast",               icon: { day: "☁️", night: "☁️" } },
     45: { name: "Fog",                   icon: { day: "🌫️", night: "🌫️" } },
     48: { name: "Rime Fog",              icon: { day: "🌫️", night: "🌫️" } },
     51: { name: "Light Drizzle",         icon: { day: "🌦️", night: "🌧️" } },
     53: { name: "Moderate Drizzle",      icon: { day: "🌧️", night: "🌧️" } },
     55: { name: "Heavy Drizzle",         icon: { day: "🌧️", night: "🌧️" } },
     56: { name: "Light Freezing Drizzle",icon: { day: "🌧️", night: "🌧️" } },
     57: { name: "Dense Freezing Drizzle",icon: { day: "🌨️", night: "🌨️" } },
     61: { name: "Slight Rain",           icon: { day: "🌦️", night: "🌧️" } },
     63: { name: "Moderate Rain",         icon: { day: "🌧️", night: "🌧️" } },
     65: { name: "Heavy Rain",            icon: { day: "🌧️", night: "🌧️" } },
     66: { name: "Light Freezing Rain",   icon: { day: "🌨️", night: "🌨️" } },
     67: { name: "Heavy Freezing Rain",   icon: { day: "🌨️", night: "🌨️" } },
     71: { name: "Slight Snowfall",       icon: { day: "🌨️", night: "🌨️" } },
     73: { name: "Moderate Snowfall",     icon: { day: "❄️", night: "❄️" } },
     75: { name: "Heavy Snowfall",        icon: { day: "❄️", night: "❄️" } },
     77: { name: "Snow Grains",           icon: { day: "🌨️", night: "🌨️" } },
     80: { name: "Slight Rain Showers",   icon: { day: "🌦️", night: "🌧️" } },
     81: { name: "Moderate Rain Showers", icon: { day: "🌧️", night: "🌧️" } },
     82: { name: "Violent Rain Showers",  icon: { day: "⛈️", night: "⛈️" } },
     85: { name: "Light Snow Showers",    icon: { day: "🌨️", night: "🌨️" } },
     86: { name: "Heavy Snow Showers",    icon: { day: "❄️", night: "❄️" } },
     95: { name: "Thunderstorm",          icon: { day: "⛈️", night: "⛈️" } },
     96: { name: "Slight Hailstorm",      icon: { day: "🌩️", night: "🌩️" } },
     99: { name: "Heavy Hailstorm",       icon: { day: "⛈️", night: "⛈️" } },
};

const searchBox = document.getElementById("search-box");
const weatherDetailsElem = document.getElementById("weather-details");
const locationTxt = document.getElementById("location");
const weatherCondName = document.getElementById("weather-condition-name");
const temperatureTxt = document.getElementById("temperature");
const humidityTxt = document.getElementById("humidity");
const windSpeedTxt = document.getElementById("wind-speed");
const locationInput = document.getElementById("location-input");
const dailyForecastElems = document.getElementById("daily-forecast");
const errTxt = document.getElementById("errTxt");

async function getLocation(location) {
     const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=1&language=en&format=json`);
     const data = await res.json();
     const result = data.results[0];
     return { name: result.name || "", lat: result.latitude, lon: result.longitude };
}

async function getWeather(location) {
     const { lat, lon, name } = await getLocation(location);
     const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min`);
     const data = await res.json();
     return { name, current: data.current, daily: data.daily };
}

searchBox.addEventListener("submit", async e => {
     e.preventDefault();
     weatherDetailsElem.classList.remove("active");
     dailyForecastElems.innerHTML = "";

     if (locationInput.value.trim() === "") {
          errTxt.textContent = "Please Enter a Location To Get Weather Details";
     } else {
          errTxt.textContent = "";
          try {
               const weather = await getWeather(locationInput.value);
               const { temperature_2m, relative_humidity_2m, is_day, weather_code, wind_speed_10m } = weather.current;
               const { weather_code: daily_weather_code, temperature_2m_max, temperature_2m_min, time } = weather.daily;

               const weatherCondition = weather_codes[weather_code];
               const emoji = is_day ? weatherCondition.icon.day : weatherCondition.icon.night;

               locationTxt.textContent = weather.name;
               temperatureTxt.textContent = temperature_2m;
               humidityTxt.textContent = relative_humidity_2m;
               windSpeedTxt.textContent = wind_speed_10m;
               weatherCondName.textContent = weatherCondition.name;

               const iconElem = document.getElementById("weather-condition-icon");
               iconElem.outerHTML = `<span id="weather-condition-icon" style="font-size:80px;line-height:1;display:block;text-align:center;">${emoji}</span>`;

               document.getElementById("humidity-icon").textContent = "💧";
               document.getElementById("wind-icon").textContent = "💨";

               for (let i = 0; i < 7; i++) {
                    const weatherCond = weather_codes[daily_weather_code[i]];
                    const elem = document.createElement("div");
                    elem.className = "card";
                    elem.innerHTML = `
                         <span style="font-size:40px;line-height:1;">${weatherCond.icon.day}</span>
                         <div class="temps">
                              <p class="temp" title="Maximum Temperature">${temperature_2m_max[i]}°</p>
                              <p class="temp" title="Minimum Temperature">${temperature_2m_min[i]}°</p>
                         </div>
                         <p class="date">${time[i]}</p>`;
                    dailyForecastElems.appendChild(elem);
               }

               weatherDetailsElem.classList.add("active");
          } catch {
               errTxt.textContent = "Location Not Found";
          }
     }
});