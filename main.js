let currentLat = null;
let currentLon = null;
const fallbackLat = 37.31931;
const fallbackLon = -122.02834;
if (navigator.getBattery) {
    navigator.getBattery().then(battery => {
        function updateBattery() {
            const level = Math.round(battery.level * 100);
            document.getElementById("battery").textContent = level + "%";
        }
        updateBattery();
        battery.addEventListener("levelchange", updateBattery);
    });
}
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });
    const date = now.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    document.getElementById("time").textContent = time;
    document.getElementById("date").textContent = date;
}
function getWeatherIcon(code) {
    if (code === 0) return "☀️";
    if (code === 1) return "🌤️";
    if (code === 2) return "⛅";
    if (code === 3) return "☁️";
    if (code >= 45 && code <= 48) return "🌫️";
    if (code >= 51 && code <= 67) return "🌧️";
    if (code >= 71 && code <= 77) return "❄️";
    if (code >= 80 && code <= 82) return "🌦️";
    if (code >= 95) return "⛈️";
    return "❓";
}
async function getWeather(lat, lon) {
    const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,uv_index&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto`
    );
    const data = await res.json();
    const temp = Math.round(data.current.temperature_2m);
    const icon = getWeatherIcon(data.current.weather_code);
    const uv = data.current.uv_index;
    const high = Math.round(data.daily.temperature_2m_max[0]);
    const low = Math.round(data.daily.temperature_2m_min[0]);
    document.getElementById("temp").textContent = "Temp.: " + temp + "º";
    document.getElementById("uv").textContent = "UV: " + (uv ?? "N/A");
    document.getElementById("condition").textContent = icon;
    document.getElementById("hl").textContent = `H: ${high}° L: ${low}°`;
}
async function getLocationName(lat, lon) {
    try {
        const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
        );
        const data = await res.json();
        let city = data.locality || data.city || data.localityInfo?.administrative?.[2]?.name || data.principalSubdivision || "Unknown";
let state = data.principalSubdivision || "";
document.getElementById("location").textContent =
    `${city}${state ? ", " + state : ""}`;
        const region = data.principalSubdivision || "";
        document.getElementById("location").textContent =
            `${city}, ${region}`;
    } catch (e) {
        document.getElementById("location").textContent =
            "Location unavailable";
    }
}
function initLocation() {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            currentLat = lat;
            currentLon = lon;
            updateAll(lat, lon);
        },
        () => {
            const lat = fallbackLat;
            const lon = fallbackLon;
            currentLat = lat;
            currentLon = lon;
            updateAll(lat, lon);
        },
        {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 0
        }
    );
}
function updateAll(lat, lon) {
    getWeather(lat, lon);
    getLocationName(lat, lon);
}
function toggleView() {
    const clock = document.getElementById("clock");
    const weather = document.getElementById("weather");
    if (!clock || !weather) return;
    clock.classList.toggle("active");
    weather.classList.toggle("active");
}
setInterval(updateClock, 1000);
setInterval(() => {
    if (currentLat !== null && currentLon !== null) {
        updateAll(currentLat, currentLon);
    }
}, 600000);
setInterval(toggleView, 10000);
updateClock();
initLocation();
