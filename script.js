lucide.createIcons();

/* 1. CHUYỂN TAB & BONG BÓNG TRƯỢT TỐC ĐỘ CAO (GPU TRANSLATE3D) */
function switchTab(tabId, btnElem) {
    document.querySelectorAll('.page-tab').forEach(tab => tab.classList.remove('active-tab'));
    document.querySelectorAll('.apple-nav-item button').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active-tab');
    btnElem.classList.add('active');
    
    if (typeof resetGliderToActive === 'function') resetGliderToActive();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener("DOMContentLoaded", () => {
    const navList = document.getElementById("appleNavList");
    const glider = document.getElementById("navGlider");
    const navButtons = document.querySelectorAll(".apple-nav-item button");

    function moveGliderTo(element) {
        if (!element || !glider || !navList) return;
        const navRect = navList.getBoundingClientRect();
        const btnRect = element.getBoundingClientRect();

        // Mở rộng viền bong bóng thêm 8px (mỗi bên 4px) cho phồng to đẹp mắt
        const paddingOffset = 4;
        const leftPosition = (btnRect.left - navRect.left) - paddingOffset;
        const buttonWidth = btnRect.width + (paddingOffset * 2);

        glider.style.transform = `translate3d(${leftPosition}px, 0, 0)`;
        glider.style.width = `${buttonWidth}px`;
        glider.style.opacity = "1";
    }

    window.resetGliderToActive = function() {
        const activeBtn = document.querySelector(".apple-nav-item button.active");
        if (activeBtn) {
            moveGliderTo(activeBtn);
        } else {
            glider.style.opacity = "0";
        }
    };

    navButtons.forEach((btn) => {
        btn.addEventListener("mouseenter", () => moveGliderTo(btn));
    });

    navList.addEventListener("mouseleave", () => resetGliderToActive());

    setTimeout(resetGliderToActive, 100);
    window.addEventListener("resize", resetGliderToActive);
});

/* 2. DỮ LIỆU SENSOR & CÁC CHỨC NĂNG HỆ THỐNG */
function updateClock() {
    const now = new Date();
    document.querySelectorAll('.realtimeClock').forEach(el => el.innerText = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    document.querySelectorAll('.realtimeDate').forEach(el => el.innerText = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
}
setInterval(updateClock, 1000); updateClock();

let port, reader;
const maxPoints = 15;

Chart.defaults.color = '#86868b';
const createChart = (ctxId, label, borderColor) => {
    const el = document.getElementById(ctxId);
    if (!el) return null;
    return new Chart(el, {
        type: 'line',
        data: { labels: [], datasets: [{ label, data: [], borderColor, borderWidth: 2, fill: true, tension: 0.3, pointRadius: 2 }] },
        options: { responsive: true, scales: { y: { beginAtZero: false } } }
    });
};

const tempChartOverview = createChart('tempChartOverview', 'Temperature (°C)', '#1d1d1f');
const humChartOverview = createChart('humChartOverview', 'Humidity (%)', '#6e6e73');
const tempChartTab = createChart('tempChartTab', 'Temperature (°C)', '#1d1d1f');
const humChartTab = createChart('humChartTab', 'Humidity (%)', '#6e6e73');

function calculateSmartphoneNits(rawInput) {
    if (rawInput === undefined || rawInput === null || isNaN(rawInput)) return "--";
    let val = parseFloat(rawInput);
    if (val <= 1023) {
        let inverted = 1023 - Math.max(0, Math.min(1023, val)); 
        let nits = (inverted / 1023) * 500;
        return Math.round(nits);
    }
    return Math.round(val);
}

function evaluateHealthCheck(temp, hum, nits) {
    document.querySelectorAll('.iconHealthTemp').forEach(iconTemp => {
        const card = iconTemp.closest('.health-card');
        const statusTemp = card.querySelector('.health-status');
        const descTemp = card.querySelector('.health-desc');

        iconTemp.className = 'health-icon iconHealthTemp'; 
        statusTemp.className = 'health-status statusHealthTemp';

        if (temp >= 20 && temp <= 26) {
            iconTemp.classList.add('bg-good'); statusTemp.classList.add('status-good');
            statusTemp.innerText = "Optimal Range"; descTemp.innerText = "Perfect temperature for living and working comfortably.";
        } else if (temp < 20) {
            iconTemp.classList.add('bg-warning'); statusTemp.classList.add('status-warning');
            statusTemp.innerText = "Too Cold"; descTemp.innerText = "Temperature is low. Consider turning off the AC or closing windows.";
        } else {
            iconTemp.classList.add('bg-danger'); statusTemp.classList.add('status-danger');
            statusTemp.innerText = "Too Hot"; descTemp.innerText = "High temperature detected. Turn on the air conditioner or fan.";
        }
    });

    document.querySelectorAll('.iconHealthHum').forEach(iconHum => {
        const card = iconHum.closest('.health-card');
        const statusHum = card.querySelector('.health-status');
        const descHum = card.querySelector('.health-desc');

        iconHum.className = 'health-icon iconHealthHum'; 
        statusHum.className = 'health-status statusHealthHum';

        if (hum >= 40 && hum <= 60) {
            iconHum.classList.add('bg-good'); statusHum.classList.add('status-good');
            statusHum.innerText = "Healthy Moisture"; descHum.innerText = "Ideal humidity level to prevent skin dryness and mold.";
        } else if (hum < 40) {
            iconHum.classList.add('bg-warning'); statusHum.classList.add('status-warning');
            statusHum.innerText = "Too Dry"; descHum.innerText = "Air is overly dry. This may cause respiratory or skin issues.";
        } else {
            iconHum.classList.add('bg-danger'); statusHum.classList.add('status-danger');
            statusHum.innerText = "Too Humid"; descHum.innerText = "High humidity detected. This promotes mold growth and discomfort.";
        }
    });

    document.querySelectorAll('.iconHealthLight').forEach(iconLight => {
        const card = iconLight.closest('.health-card');
        const statusLight = card.querySelector('.health-status');
        const descLight = card.querySelector('.health-desc');

        iconLight.className = 'health-icon iconHealthLight'; 
        statusLight.className = 'health-status statusHealthLight';

        if (nits >= 150 && nits <= 350) {
            iconLight.classList.add('bg-good'); statusLight.classList.add('status-good');
            statusLight.innerText = "Comfortable Light"; descLight.innerText = "Lighting is sufficient and safe for the human eye.";
        } else if (nits < 150) {
            iconLight.classList.add('bg-warning'); statusLight.classList.add('status-warning');
            statusLight.innerText = "Too Dim"; descLight.innerText = "Poor lighting condition. Turn on lights to avoid eye strain.";
        } else {
            iconLight.classList.add('bg-danger'); statusLight.classList.add('status-danger');
            statusLight.innerText = "Too Bright"; descLight.innerText = "Excessively bright light detected. Close curtains to protect your eyes.";
        }
    });
}

async function requestNewPort() {
    try {
        port = await navigator.serial.requestPort();
        startReading(port);
    } catch (err) {}
}

async function startReading(selectedPort) {
    try {
        await selectedPort.open({ baudRate: 9600 });
        document.getElementById('statusBadge').classList.add('connected');
        document.getElementById('statusText').innerText = "Connected";
        document.getElementById('btnConnectText').innerText = "Auto-Connected";

        const textDecoder = new TextDecoderStream();
        selectedPort.readable.pipeTo(textDecoder.writable);
        reader = textDecoder.readable.getReader();

        let buffer = "";
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += value;
            let lines = buffer.split("\n");
            buffer = lines.pop();
            for (let line of lines) parseData(line.trim());
        }
    } catch (err) {
        document.getElementById('statusBadge').classList.remove('connected');
        document.getElementById('statusText').innerText = "Disconnected";
        document.getElementById('btnConnectText').innerText = "Connect USB";
    }
}

let currentTemp = 0, currentHum = 0, currentNits = 0;

function parseData(jsonStr) {
    if (!jsonStr) return;
    let cleanStr = jsonStr.substring(jsonStr.indexOf('{'), jsonStr.lastIndexOf('}') + 1);
    if (!cleanStr) return;

    try {
        let data = JSON.parse(cleanStr);
        let timeLabel = new Date().toLocaleTimeString();

        if (data.temp !== undefined) {
            currentTemp = data.temp;
            document.querySelectorAll('.valTemp').forEach(el => el.innerText = data.temp);
            updateChart(tempChartOverview, timeLabel, data.temp);
            updateChart(tempChartTab, timeLabel, data.temp);
        }
        if (data.hum !== undefined) {
            currentHum = data.hum;
            document.querySelectorAll('.valHum').forEach(el => el.innerText = data.hum);
            updateChart(humChartOverview, timeLabel, data.hum);
            updateChart(humChartTab, timeLabel, data.hum);
        }
        if (data.ldr !== undefined) {
            currentNits = calculateSmartphoneNits(data.ldr);
            document.querySelectorAll('.valLdr').forEach(el => el.innerText = currentNits);
        }
        if (data.pot !== undefined) document.querySelectorAll('.valPot').forEach(el => el.innerText = data.pot);
        
        evaluateHealthCheck(currentTemp, currentHum, currentNits);

        if (data.husky !== undefined) {
            let huskyVal = String(data.husky).trim();
            if (huskyVal === "Dang quet...") huskyVal = "Scanning...";
            if (huskyVal === "Loi ket noi!") huskyVal = "Connection Error";
            if (huskyVal === "KHUON MAT LA!") huskyVal = "UNKNOWN FACE";

            const isValidFace = huskyVal.length > 0 && huskyVal !== "Scanning..." && huskyVal !== "Connection Error" && huskyVal !== "UNKNOWN FACE";

            if (isValidFace) {
                triggerFaceIDSequence(huskyVal);
            } else {
                document.querySelectorAll('.valHusky').forEach(el => el.innerText = huskyVal);
            }
        }
    } catch (e) {}
}

function triggerFaceIDSequence(detectedName) {
    const huskyCards = document.querySelectorAll('.huskyCard');
    const huskyElems = document.querySelectorAll('.valHusky');
    const dropTags = document.querySelectorAll('.nameDropTag');
    
    huskyCards.forEach(c => c.classList.add('faceid-success'));
    huskyElems.forEach(el => el.innerText = "Successful");
    document.querySelectorAll('.valDetectedName').forEach(el => el.innerText = detectedName);
    
    setTimeout(() => dropTags.forEach(tag => tag.classList.add('show-drop-tag')), 100);
    
    setTimeout(() => {
        dropTags.forEach(tag => tag.classList.remove('show-drop-tag'));
        setTimeout(() => {
            huskyCards.forEach(c => c.classList.remove('faceid-success'));
            huskyElems.forEach(el => el.innerText = "Scanning...");
        }, 300);
    }, 2500);
}

function updateChart(chart, label, value) {
    if (!chart) return;
    if (chart.data.labels.length >= maxPoints) { chart.data.labels.shift(); chart.data.datasets[0].data.shift(); }
    chart.data.labels.push(label); chart.data.datasets[0].data.push(value); chart.update();
}