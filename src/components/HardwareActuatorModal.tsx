import React, { useState } from 'react';
import { X, Cpu, Zap, Copy, Check, Radio, Play, CheckCircle2 } from 'lucide-react';
import { FarmZone } from '../types';

interface HardwareActuatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedZone: FarmZone;
  activeRelayPin: string;
  isIrrigating: boolean;
  onTestPulse: () => void;
}

export const HardwareActuatorModal: React.FC<HardwareActuatorModalProps> = ({
  isOpen,
  onClose,
  selectedZone,
  activeRelayPin,
  isIrrigating,
  onTestPulse,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMqtt, setCopiedMqtt] = useState(false);

  if (!isOpen) return null;

  const sampleMqttPayload = {
    topic: `agriflow/farm_01/zone_${selectedZone.id}/relay`,
    timestamp: new Date().toISOString(),
    payload: {
      zoneId: selectedZone.id,
      zoneName: selectedZone.name,
      gpio_pin: activeRelayPin,
      state: isIrrigating ? 'HIGH' : 'LOW',
      pulse_duration_seconds: isIrrigating ? 1800 : 0,
      flow_rate_lpm: selectedZone.flowRateLpm,
      safety_crc: '0x4F92A1',
    },
  };

  const sampleArduinoCode = `// ESP32 / Arduino AgriFlow Actuator Client
#include <WiFi.h>
#include <PubSubClient.h>

const int RELAY_PIN = 18; // Connected to Solenoid Valve
const char* mqtt_server = "broker.agriflow.local";

WiFiClient espClient;
PubSubClient client(espClient);

void callback(char* topic, byte* message, unsigned int length) {
  // Parse incoming JSON from AgriFlow Strategy Agent
  String messageTemp;
  for (int i = 0; i < length; i++) { messageTemp += (char)message[i]; }
  
  if (messageTemp.indexOf('"state":"HIGH"') > 0) {
    digitalWrite(RELAY_PIN, HIGH); // Valve Open
    Serial.println(">> AGRIFLOW: Solenoid Energized (Irrigating)");
  } else {
    digitalWrite(RELAY_PIN, LOW);  // Valve Closed
    Serial.println(">> AGRIFLOW: Solenoid De-energized (Safe)");
  }
}

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // Fail-safe default
  Serial.begin(115200);
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#12141A] border border-slate-800 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0F1117]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                Physical Hardware Bridge & MQTT Actuator Inspector
                <span className="px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                  $5 ESP32 Relay Prop
                </span>
              </h2>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mt-0.5">
                Direct physical relay connection for stage demos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Virtual Relay / LED Output Tester */}
          <div className="p-4 rounded-lg bg-black/40 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isIrrigating
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse ring-4 ring-emerald-500/20'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Target Relay Pin: {activeRelayPin}</span>
                  <span
                    className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                      isIrrigating
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    State: {isIrrigating ? 'HIGH (+3.3V)' : 'LOW (0V)'}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Assigned to {selectedZone.name} • Solenoid Valve #0{selectedZone.id}
                </p>
              </div>
            </div>

            <button
              onClick={onTestPulse}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.25)] border border-emerald-400"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isIrrigating ? 'Cut Off Relay' : 'Trigger 5s Hardware Test Pulse'}</span>
            </button>
          </div>

          {/* MQTT Broker JSON Transmission */}
          <div className="p-3.5 rounded-lg bg-black/40 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" /> Live MQTT Packet Payload
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(sampleMqttPayload, null, 2));
                  setCopiedMqtt(true);
                  setTimeout(() => setCopiedMqtt(false), 2000);
                }}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 bg-[#0F1117] border border-slate-800 px-2 py-0.5 rounded"
              >
                {copiedMqtt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy JSON</span>
              </button>
            </div>
            <pre className="p-2.5 rounded-lg bg-black/70 border border-slate-800 text-[11px] text-emerald-400 overflow-x-auto">
              {JSON.stringify(sampleMqttPayload, null, 2)}
            </pre>
          </div>

          {/* Microcontroller Firmware Example */}
          <div className="p-3.5 rounded-lg bg-black/40 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 font-semibold">ESP32 / Arduino Microcontroller C++ Code</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sampleArduinoCode);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 bg-[#0F1117] border border-slate-800 px-2 py-0.5 rounded"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy Code</span>
              </button>
            </div>
            <pre className="p-2.5 rounded-lg bg-black/70 border border-slate-800 text-[10px] text-slate-300 overflow-x-auto max-h-40">
              {sampleArduinoCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
