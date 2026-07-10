import { useCallback, useEffect, useState } from "react";

export type AmbientMode = "auto" | "day" | "night";
export type AmbientEffective = "day" | "night";

const STORAGE_KEY = "ambientMode";

function timeOfDayEffective(): AmbientEffective {
  const hour = new Date().getHours();
  return hour >= 7 && hour < 19 ? "day" : "night";
}

function readStoredMode(): AmbientMode {
  if (typeof window === "undefined") return "auto";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "day" || stored === "night" || stored === "auto") return stored;
  return "auto";
}

/**
 * Ambient Light Adaptive UI hook.
 * Tries the standard Web Sensor API (AmbientLightSensor) when available and permitted.
 * Falls back gracefully to time-of-day detection, or a manual override, adjusting
 * CSS custom properties (via a `data-ambient` attribute on <html>) that drive
 * neon glow intensity, background brightness, and contrast across the app.
 */
export function useAmbientLight() {
  const [mode, setModeState] = useState<AmbientMode>(() => readStoredMode());
  const [effective, setEffective] = useState<AmbientEffective>(() =>
    readStoredMode() === "auto" ? timeOfDayEffective() : (readStoredMode() as AmbientEffective),
  );
  const [sensorActive, setSensorActive] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-ambient", effective);
  }, [effective]);

  useEffect(() => {
    if (mode !== "auto") {
      setEffective(mode);
      setSensorActive(false);
      return;
    }

    let cancelled = false;
    type LightSensor = { start: () => void; stop: () => void; onreading: (() => void) | null; illuminance?: number };
    let sensor: LightSensor | null = null;

    const applyTimeOfDay = () => {
      if (!cancelled) setEffective(timeOfDayEffective());
    };

    // Try the Web Sensor API's AmbientLightSensor where supported (Chromium, secure context, permission granted).
    const AmbientLightSensorCtor = (window as unknown as { AmbientLightSensor?: new () => LightSensor }).AmbientLightSensor;

    if (AmbientLightSensorCtor) {
      try {
        sensor = new AmbientLightSensorCtor();
        const activeSensor = sensor;
        activeSensor.onreading = () => {
          if (cancelled) return;
          const lux = activeSensor.illuminance ?? 0;
          setSensorActive(true);
          setEffective(lux < 40 ? "night" : "day");
        };
        activeSensor.start();
      } catch {
        applyTimeOfDay();
      }
    } else {
      applyTimeOfDay();
    }

    // Re-evaluate time-of-day fallback periodically in case the sensor is unavailable/denied.
    const interval = window.setInterval(() => {
      if (!sensorActive) applyTimeOfDay();
    }, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      try {
        sensor?.stop();
      } catch {
        // no-op: sensor may already be stopped or unsupported
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const setMode = useCallback((next: AmbientMode) => {
    setModeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    if (next !== "auto") setEffective(next);
    else setEffective(timeOfDayEffective());
  }, []);

  return { mode, effective, sensorActive, setMode };
}
