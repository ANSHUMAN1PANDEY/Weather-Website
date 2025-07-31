const apiKey = 'bd9f39e8d452aebda7925455a21ff038';

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) getWeatherByCity(city);
});

locationBtn.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(
        (pos) => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        () => alert("Location access denied.")
    );
});

function getWeatherByCity(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(res => res.json())
        .then(data => {
            updateCurrentWeather(data);
            getForecast(data.coord.lat, data.coord.lon);
            getAirPollution(data.coord.lat, data.coord.lon);
        })
        .catch(() => alert("City not found"));
}

function getWeatherByCoords(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(res => res.json())
        .then(data => {
            updateCurrentWeather(data);
            getForecast(lat, lon);
            getAirPollution(lat, lon);
        });
}

function updateCurrentWeather(data) {
    document.querySelector('.current-weather h2').innerHTML = `${Math.round(data.main.temp)}&deg;C`;
    document.querySelector('.current-weather p:nth-child(3)').innerText = data.weather[0].description;
    document.querySelector('.weather-icon img').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.querySelector('.card-footer p:nth-child(1)').innerText = `📅 ${new Date().toLocaleDateString()}`;
    document.querySelector('.card-footer p:nth-child(2)').innerText = `📍 ${data.name}, ${data.sys.country}`;

    document.getElementById('humidityVal').innerText = `${data.main.humidity}%`;
    document.getElementById('pressureVal').innerText = `${data.main.pressure} hPa`;
    document.getElementById('VisibilityVal').innerText = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById('WindSpeedVal').innerText = `${data.wind.speed} m/s`;
    document.getElementById('feelsVal').innerHTML = `${Math.round(data.main.feels_like)}&deg;C`;

    const sunriseElement = document.querySelectorAll('.sunrise-sunset .item h2')[0];
    const sunsetElement = document.querySelectorAll('.sunrise-sunset .item h2')[1];
    sunriseElement.innerText = convertUnixToTime(data.sys.sunrise);
    sunsetElement.innerText = convertUnixToTime(data.sys.sunset);
}

function convertUnixToTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(res => res.json())
        .then(data => {
            const forecastItems = document.querySelectorAll('.forecast-item');
            let count = 0;
            for (let i = 0; i < data.list.length && count < forecastItems.length; i += 8) {
                const forecast = data.list[i];
                const el = forecastItems[count];
                el.querySelector('img').src = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
                el.querySelector('.icon-wrapper span').innerHTML = `${Math.round(forecast.main.temp)}&deg;C`;
                el.querySelectorAll('p')[0].innerText = forecast.weather[0].main;
                el.querySelectorAll('p')[1].innerText = new Date(forecast.dt_txt).toDateString();
                count++;
            }

            const hourlyCards = document.querySelectorAll('.hourly-forecast .card');
            for (let j = 0; j < hourlyCards.length && j < data.list.length; j++) {
                const hour = data.list[j];
                const hourTime = new Date(hour.dt_txt).getHours();
                hourlyCards[j].querySelectorAll('p')[0].innerText = hourTime + ":00";
                hourlyCards[j].querySelector('img').src = `https://openweathermap.org/img/wn/${hour.weather[0].icon}.png`;
                hourlyCards[j].querySelectorAll('p')[1].innerHTML = `${Math.round(hour.main.temp)}&deg;C`;
            }
        });
}

function getAirPollution(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
        .then(res => res.json())
        .then(data => {
            const aqi = data.list[0].main.aqi;
            const labels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
            const airIndex = document.querySelector('.air-index');
            airIndex.innerText = labels[aqi - 1];
            airIndex.className = `air-index aqi-${aqi}`;

            const components = data.list[0].components;
            const keys = ["pm2_5", "pm10", "so2", "co", "no", "no2", "nh3", "o3"];
            const items = document.querySelectorAll('.air-indices .item');

            keys.forEach((key, idx) => {
                if (items[idx]) {
                    items[idx].querySelector('h2').innerText = components[key].toFixed(1);
                }
            });
        });
}
window.onload = function () {
    getWeatherByCity("New Delhi");
};
