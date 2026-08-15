# Smart Irrigation Hackathon Demo

This project is a lightweight smart irrigation prototype for a hackathon. It simulates a multi-agent decision system for agricultural water management and presents results in a simple web dashboard.

## What it includes

- Python backend with FastAPI
- JavaScript frontend dashboard
- Simulated sensor, weather, crop, strategy, and actuator agents
- Irrigation metrics and crop-stage decision logic
- Scenario presets for heatwave, rainstorm, dry soil, and baseline conditions

## Run locally

```bash
cd /home/master/Hackathon2026AtCentennial
/home/master/Hackathon2026AtCentennial/venv/bin/python -m pip install -r requirements.txt
/home/master/Hackathon2026AtCentennial/venv/bin/python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

Then open:

- http://localhost:8000
- http://localhost:8000/api/health

## Project idea

The app demonstrates a smart irrigation system that evaluates:

- soil moisture conditions
- weather and rain risk
- crop stage and crop coefficient
- irrigation action and projected water savings

This makes it suitable for a hackathon pitch around water sustainability, optimization, and precision agriculture.
