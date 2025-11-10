// Central script for the project: sidebar, weather, news, and tasks
const DEFAULT_CITY = 'Elizabeth';
const WEATHER_API_KEY = '3881c52d695bd30fc33a09bf7ed5e071'; // existing key used in HTML
const NEWS_API_KEY = '52bb2c0d751248e78890cef156f49958';

function openSidebar() {
    document.getElementById('mySidebar').classList.add('open');
    document.getElementById('openSidebarBtn').style.display = 'none';
}
function closeSidebar() {
    document.getElementById('mySidebar').classList.remove('open');
    document.getElementById('openSidebarBtn').style.display = 'block';
}

async function fetchWeather() {
    const weatherDiv = document.getElementById('weatherData');
    const currentCityLabel = document.getElementById('currentCity');
    const storedCity = localStorage.getItem('city') || DEFAULT_CITY;
    if (currentCityLabel) currentCityLabel.textContent = 'City: ' + storedCity;
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(storedCity)}&appid=${WEATHER_API_KEY}&units=metric`);
        const data = await res.json();
        if (data.cod === 200) {
            weatherDiv.innerHTML = `
                <strong>${data.name}</strong><br>
                ${data.weather[0].main}, ${data.weather[0].description}<br>
                Temp: ${data.main.temp}&deg;C, Humidity: ${data.main.humidity}%
            `;
        } else {
            weatherDiv.innerText = 'Weather data unavailable.';
            console.warn('Weather API error:', data);
        }
    } catch (err) {
        weatherDiv.innerText = 'Weather data unavailable.';
        console.error(err);
    }
}

async function fetchNews() {
    const eventsDiv = document.getElementById('eventsData');
    try {
        const res = await fetch(`https://newsapi.org/v2/top-headlines?country=us&pageSize=3&apiKey=${NEWS_API_KEY}`);
        const data = await res.json();
        if (data.status === 'ok' && data.articles.length > 0) {
            eventsDiv.innerHTML = data.articles.map(a => `<div class="event-item"><a href="${a.url}" target="_blank">${a.title}</a></div>`).join('');
        } else {
            eventsDiv.innerText = 'No current events found.';
            console.warn('News API returned no articles or error:', data);
        }
    } catch (err) {
        eventsDiv.innerText = 'Events data unavailable.';
        console.error(err);
    }
}

// Tasks handling with localStorage persistence
let tasks = [];
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
function loadTasks() {
    const raw = localStorage.getItem('tasks');
    if (raw) {
        try { tasks = JSON.parse(raw); } catch { tasks = []; }
    }
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    tasks.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        li.className = 'task-item';
        li.addEventListener('click', () => { removeTaskElement(li, text); });
        list.appendChild(li);
    });
}
function addTask() {
    const input = document.getElementById('newTaskInput');
    const text = input.value.trim();
    const list = document.getElementById('taskList');
    if (!text) return;
    const li = document.createElement('li');
    li.textContent = text;
    li.className = 'task-item';
    li.addEventListener('click', () => { removeTaskElement(li, text); });
    list.appendChild(li);
    tasks.push(text);
    saveTasks();
    input.value = '';
}
function removeTaskElement(li, text) {
    li.remove();
    const idx = tasks.indexOf(text);
    if (idx > -1) tasks.splice(idx, 1);
    saveTasks();
}

document.addEventListener('DOMContentLoaded', () => {
    // wire up buttons
    const addBtn = document.getElementById('addTaskBtn');
    if (addBtn) addBtn.addEventListener('click', addTask);
    const input = document.getElementById('newTaskInput');
    if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });

    // city control
    const setCityBtn = document.getElementById('setCityBtn');
    const cityInput = document.getElementById('cityInput');
    if (setCityBtn && cityInput) {
        setCityBtn.addEventListener('click', () => {
            const c = cityInput.value.trim();
            if (!c) return;
            localStorage.setItem('city', c);
            document.getElementById('currentCity').textContent = 'City: ' + c;
            fetchWeather();
            cityInput.value = '';
        });
    }

    // load persisted tasks and initial data
    loadTasks();
    fetchWeather();
    fetchNews();
});

