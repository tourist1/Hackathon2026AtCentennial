from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Smart Irrigation Hackathon Demo", version="1.0.0")
app.mount("/static", StaticFiles(directory="static"), name="static")

CROP_COEFFICIENTS = {
    "seedling": 0.4,
    "vegetative": 0.8,
    "flowering": 1.1,
    "fruiting": 1.0,
}

CROP_TARGETS = {
    "tomato": {
        "seedling": {"min": 22, "optimal": 28},
        "vegetative": {"min": 26, "optimal": 32},
        "flowering": {"min": 28, "optimal": 34},
        "fruiting": {"min": 26, "optimal": 31},
    },
    "corn": {
        "seedling": {"min": 20, "optimal": 26},
        "vegetative": {"min": 24, "optimal": 30},
        "flowering": {"min": 26, "optimal": 32},
        "fruiting": {"min": 24, "optimal": 29},
    },
    "lettuce": {
        "seedling": {"min": 25, "optimal": 30},
        "vegetative": {"min": 27, "optimal": 33},
        "flowering": {"min": 26, "optimal": 31},
        "fruiting": {"min": 24, "optimal": 29},
    },
}

SCENARIOS = {
    "baseline": {
        "crop": "tomato",
        "stage": "vegetative",
        "vwc": 28.0,
        "soil_temp": 23.0,
        "temp": 27.0,
        "humidity": 52.0,
        "wind": 4.0,
        "solar": 680.0,
        "rain_prob": 18.0,
        "soil_type": "loam",
    },
    "heatwave": {
        "crop": "tomato",
        "stage": "flowering",
        "vwc": 22.0,
        "soil_temp": 28.0,
        "temp": 34.0,
        "humidity": 30.0,
        "wind": 7.0,
        "solar": 960.0,
        "rain_prob": 8.0,
        "soil_type": "loam",
    },
    "rainstorm": {
        "crop": "corn",
        "stage": "vegetative",
        "vwc": 31.0,
        "soil_temp": 24.0,
        "temp": 22.0,
        "humidity": 82.0,
        "wind": 5.0,
        "solar": 300.0,
        "rain_prob": 84.0,
        "soil_type": "clay",
    },
    "dry_soil": {
        "crop": "lettuce",
        "stage": "seedling",
        "vwc": 16.0,
        "soil_temp": 30.0,
        "temp": 31.0,
        "humidity": 38.0,
        "wind": 6.5,
        "solar": 840.0,
        "rain_prob": 12.0,
        "soil_type": "sand",
    },
}


def sensor_agent(vwc: float, soil_temp: float) -> dict[str, Any]:
  if vwc < 15:
    state = "critical"
    message = "Soil moisture is below safe plant stress levels."
  elif vwc < 22:
    state = "warning"
    message = "Moisture is low and plant stress risk is increasing."
  elif vwc > 38:
    state = "saturated"
    message = "Soil is near saturation; avoid excess irrigation."
  else:
    state = "healthy"
    message = "Soil moisture is within a viable operational range."

  if soil_temp > 30:
    message += " Soil temperature is elevated and increases evapotranspiration."

  return {
      "agent": "Sensor Agent",
      "status": state,
      "summary": message,
      "metrics": {
          "vwc": round(vwc, 2),
          "soil_temp_c": round(soil_temp, 2),
      },
  }


def weather_agent(temp: float, humidity: float, wind: float, solar: float, rain_prob: float) -> dict[str, Any]:
  et0 = max(0.5, ((temp * 0.7) + (solar / 100) * 0.5 +
            (wind * 0.8) - (humidity * 0.3)) / 10)
  rain_delay = 1 - (rain_prob / 100)

  if rain_prob > 70:
    recommendation = "Heavy rainfall probability detected. Delay irrigation to avoid runoff."
  elif rain_prob > 40:
    recommendation = "Some chance of rainfall. Reduce the planned irrigation volume."
  else:
    recommendation = "No major rainfall expected in the next 24 hours. Proceed with demand-based irrigation."

  return {
      "agent": "Weather Agent",
      "status": "ok",
      "summary": recommendation,
      "metrics": {
          "temp_c": round(temp, 2),
          "humidity_pct": round(humidity, 2),
          "wind_kmh": round(wind, 2),
          "solar_wm2": round(solar, 2),
          "rain_probability_pct": round(rain_prob, 2),
          "et0_mm_day": round(et0, 2),
          "rain_delay_factor": round(rain_delay, 2),
      },
  }


def crop_agent(crop: str, stage: str) -> dict[str, Any]:
  crop_name = crop.lower()
  stage_name = stage.lower()
  coeff = CROP_COEFFICIENTS.get(stage_name, 0.8)
  targets = CROP_TARGETS.get(crop_name, CROP_TARGETS["tomato"]).get(
    stage_name, {"min": 24, "optimal": 30})

  return {
      "agent": "Crop Science Agent",
      "status": "ok",
      "summary": f"{crop.title()} is in the {stage_name} stage with crop coefficient {coeff}.",
      "metrics": {
          "crop": crop.title(),
          "stage": stage_name.title(),
          "kc": round(coeff, 2),
          "minimum_vwc_pct": round(targets["min"], 2),
          "optimal_vwc_pct": round(targets["optimal"], 2),
      },
  }


def strategy_agent(vwc: float, temp: float, rain_prob: float, crop_target: dict[str, float]) -> dict[str, Any]:
  min_vwc = crop_target["min"]
  optimal_vwc = crop_target["optimal"]
  demand = max(0.0, optimal_vwc - vwc)

  if rain_prob > 70:
    action = "skip"
    liters = 0.0
    reason = "Rain probability is high, so irrigation is postponed to protect runoff and nutrient loss."
  elif vwc <= min_vwc - 1.5:
    action = "irrigate"
    liters = round((demand * 4.5) + (temp * 0.6), 1)
    reason = "Soil moisture is below the crop safety threshold. Irrigation is required."
  elif vwc < optimal_vwc:
    action = "partial"
    liters = round((demand * 2.3) + (temp * 0.25), 1)
    reason = "Moisture deficit exists but a partial irrigation cycle is enough to avoid oversaturation."
  else:
    action = "skip"
    liters = 0.0
    reason = "Current soil moisture is sufficient for the crop stage. No irrigation needed."

  return {
      "agent": "Strategy Agent",
      "status": "ok",
      "summary": reason,
      "metrics": {
          "action": action,
          "required_liters": liters,
          "deficit_pct": round(max(0.0, optimal_vwc - vwc), 2),
          "rain_probability_pct": round(rain_prob, 2),
      },
  }


def actuator_agent(action: str, liters: float) -> dict[str, Any]:
  if action == "skip":
    status = "idle"
    summary = "Valve remains closed; no active watering requested."
  elif action == "partial":
    status = "partial_open"
    summary = "Valve opened at a reduced duty cycle for efficient watering."
  else:
    status = "open"
    summary = "Valve opened for a full irrigation cycle."

  return {
      "agent": "Actuator Agent",
      "status": status,
      "summary": summary,
      "metrics": {
          "action": action,
          "liters_to_apply": round(liters, 2),
          "duty_cycle_pct": 100 if action == "irrigate" else 50 if action == "partial" else 0,
      },
  }


def build_decision(payload: dict[str, Any]) -> dict[str, Any]:
  crop = payload.get("crop", "tomato")
  stage = payload.get("stage", "vegetative")
  vwc = float(payload.get("vwc", 28.0))
  soil_temp = float(payload.get("soil_temp", 23.0))
  temp = float(payload.get("temp", 27.0))
  humidity = float(payload.get("humidity", 52.0))
  wind = float(payload.get("wind", 4.0))
  solar = float(payload.get("solar", 680.0))
  rain_prob = float(payload.get("rain_prob", 18.0))

  sensor = sensor_agent(vwc, soil_temp)
  weather = weather_agent(temp, humidity, wind, solar, rain_prob)
  crop_info = crop_agent(crop, stage)
  target = crop_info["metrics"]
  strategy = strategy_agent(vwc, temp, rain_prob, {
                            "min": target["minimum_vwc_pct"], "optimal": target["optimal_vwc_pct"]})
  actuator = actuator_agent(
    strategy["metrics"]["action"], strategy["metrics"]["required_liters"])

  savings = max(0.0, 45.0 - strategy["metrics"]["required_liters"])
  cost = max(0.0, 12.0 - (strategy["metrics"]["required_liters"] * 0.08))
  wue = round((target["optimal_vwc_pct"] / max(1.0,
              strategy["metrics"]["required_liters"] + 1.0)) * 10, 2)

  response = {
      "timestamp": datetime.now(timezone.utc).isoformat(),
      "crop": crop.title(),
      "stage": stage.title(),
      "soil": {
          "vwc_pct": round(vwc, 2),
          "soil_temp_c": round(soil_temp, 2),
          "status": sensor["status"],
      },
      "weather": {
          "temp_c": round(temp, 2),
          "humidity_pct": round(humidity, 2),
          "rain_probability_pct": round(rain_prob, 2),
          "et0_mm_day": weather["metrics"]["et0_mm_day"],
      },
      "decision": {
          "action": strategy["metrics"]["action"],
          "liters": strategy["metrics"]["required_liters"],
          "reason": strategy["summary"],
      },
      "metrics": {
          "water_saved_l": round(savings, 2),
          "energy_cost_usd": round(cost, 2),
          "wue_index": wue,
          "depletion_pct": round(max(0.0, target["optimal_vwc_pct"] - vwc), 2),
      },
      "agents": [sensor, weather, crop_info, strategy, actuator],
  }
  return response


@app.get("/")
def serve_index() -> FileResponse:
  return FileResponse("static/index.html")


@app.get("/api/health")
def health() -> dict[str, str]:
  return {"status": "ok", "message": "Smart irrigation system is running."}


@app.get("/api/simulate")
def simulate(scenario: str = "baseline") -> dict[str, Any]:
  payload = SCENARIOS.get(scenario, SCENARIOS["baseline"])
  return build_decision(payload)


@app.post("/api/simulate")
def simulate_post(payload: dict[str, Any]) -> dict[str, Any]:
  return build_decision(payload)
