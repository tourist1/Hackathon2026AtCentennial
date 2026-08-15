const state = {
  scenario: "baseline",
};

const elements = {
  decisionAction: document.getElementById("decision-action"),
  decisionReason: document.getElementById("decision-reason"),
  soilMoisture: document.getElementById("soil-moisture"),
  moistureBar: document.getElementById("moisture-bar"),
  waterNeeded: document.getElementById("water-needed"),
  waterSaved: document.getElementById("water-saved"),
  weatherStatus: document.getElementById("weather-status"),
  weatherDetail: document.getElementById("weather-detail"),
  cropName: document.getElementById("crop-name"),
  cropStage: document.getElementById("crop-stage"),
  soilTemp: document.getElementById("soil-temp"),
  humidity: document.getElementById("humidity"),
  et0: document.getElementById("et0"),
  wue: document.getElementById("wue"),
  energyCost: document.getElementById("energy-cost"),
  depletion: document.getElementById("depletion"),
  rainProbability: document.getElementById("rain-probability"),
  agentLog: document.getElementById("agent-log"),
};

function updateMeter(value) {
  const safeValue = Math.max(0, Math.min(100, value));
  elements.moistureBar.style.width = `${safeValue}%`;
}

function renderAgents(agentList) {
  elements.agentLog.innerHTML = "";

  agentList.forEach((agent) => {
    const li = document.createElement("li");
    const heading = document.createElement("strong");
    heading.textContent = agent.agent;
    const summary = document.createElement("div");
    summary.textContent = `${agent.summary}`;

    const metrics = document.createElement("div");
    metrics.className = "muted";
    metrics.textContent = JSON.stringify(agent.metrics);

    li.appendChild(heading);
    li.appendChild(summary);
    li.appendChild(metrics);
    elements.agentLog.appendChild(li);
  });
}

async function fetchSimulation(scenario) {
  const response = await fetch(`/api/simulate?scenario=${scenario}`);
  const data = await response.json();

  elements.decisionAction.textContent = data.decision.action.toUpperCase();
  elements.decisionReason.textContent = data.decision.reason;
  elements.soilMoisture.textContent = `${data.soil.vwc_pct}%`;
  elements.waterNeeded.textContent = `${data.decision.liters} L`;
  elements.waterSaved.textContent = `Projected water saved: ${data.metrics.water_saved_l} L`;
  elements.weatherStatus.textContent = `${data.weather.temp_c}°C / ${data.weather.humidity_pct}% RH`;
  elements.weatherDetail.textContent = `Rain chance ${data.weather.rain_probability_pct}% and ET0 ${data.weather.et0_mm_day} mm/day`;
  elements.cropName.textContent = data.crop;
  elements.cropStage.textContent = data.stage;
  elements.soilTemp.textContent = `${data.soil.soil_temp_c}°C`;
  elements.humidity.textContent = `${data.weather.humidity_pct}%`;
  elements.et0.textContent = `${data.weather.et0_mm_day} mm/day`;
  elements.wue.textContent = `${data.metrics.wue_index}`;
  elements.energyCost.textContent = `$${data.metrics.energy_cost_usd}`;
  elements.depletion.textContent = `${data.metrics.depletion_pct}%`;
  elements.rainProbability.textContent = `${data.weather.rain_probability_pct}%`;

  updateMeter(data.soil.vwc_pct);
  renderAgents(data.agents);
}

function bindScenarioButtons() {
  document.querySelectorAll(".scenario").forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".scenario")
        .forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      state.scenario = button.dataset.scenario;
      fetchSimulation(state.scenario);
    });
  });
}

bindScenarioButtons();
fetchSimulation(state.scenario);
