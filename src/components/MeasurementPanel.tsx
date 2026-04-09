import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

interface MeasurementPanelProps {
  componentCount: number;
  isSimulating: boolean;
}

const MeasurementPanel = ({ componentCount, isSimulating }: MeasurementPanelProps) => {
  const [voltage, setVoltage] = useState(0);
  const [current, setCurrent] = useState(0);
  const [resistance, setResistance] = useState(0);
  const [power, setPower] = useState(0);
  const [frequency, setFrequency] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!isSimulating || componentCount === 0) {
      setVoltage(0);
      setCurrent(0);
      setResistance(0);
      setPower(0);
      setFrequency(0);
      setTime(0);
      return;
    }

    const interval = setInterval(() => {
      const v = 3.3 + Math.sin(Date.now() / 500) * 1.2 + (Math.random() - 0.5) * 0.1;
      const r = 1000 * componentCount + Math.random() * 100;
      const i = (v / r) * 1000;
      setVoltage(v);
      setCurrent(i);
      setResistance(r);
      setPower(v * (i / 1000));
      setFrequency(50 + Math.sin(Date.now() / 2000) * 0.5);
      setTime((prev) => prev + 0.05);
    }, 50);

    return () => clearInterval(interval);
  }, [isSimulating, componentCount]);

  const measurements = [
    { label: "Напряжение", value: voltage.toFixed(2), unit: "V", color: "text-emerald-400", icon: "Zap" },
    { label: "Ток", value: current.toFixed(3), unit: "mA", color: "text-sky-400", icon: "Activity" },
    { label: "Сопротивление", value: resistance.toFixed(0), unit: "Ω", color: "text-amber-400", icon: "CircleDot" },
    { label: "Мощность", value: power.toFixed(4), unit: "W", color: "text-rose-400", icon: "Flame" },
    { label: "Частота", value: frequency.toFixed(2), unit: "Hz", color: "text-violet-400", icon: "Waves" },
    { label: "Время", value: time.toFixed(1), unit: "s", color: "text-teal-400", icon: "Clock" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 pt-3 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="Gauge" size={14} className="text-accent" />
          <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-foreground">
            Измерения
          </span>
          <div className={`ml-auto flex items-center gap-1.5 text-[9px] ${isSimulating ? "text-primary" : "text-muted-foreground/50"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isSimulating ? "bg-primary animate-pulse-glow" : "bg-muted-foreground/30"}`} />
            {isSimulating ? "LIVE" : "IDLE"}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {measurements.map((m, i) => (
          <div
            key={m.label}
            className="px-3 py-2.5 rounded-sm border border-border bg-muted/20 animate-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Icon name={m.icon} size={10} className={m.color} />
                <span className="text-[9px] text-muted-foreground tracking-wider uppercase">
                  {m.label}
                </span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-semibold tabular-nums ${isSimulating ? m.color : "text-muted-foreground/30"}`}>
                {isSimulating ? m.value : "—"}
              </span>
              <span className="text-[10px] text-muted-foreground">{m.unit}</span>
            </div>

            {isSimulating && (
              <div className="mt-1.5 h-0.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-100`}
                  style={{
                    width: `${Math.min(100, (parseFloat(m.value) / (parseFloat(m.value) + 1)) * 100)}%`,
                    backgroundColor: `var(--tw-${m.color})`,
                    background: m.color === "text-emerald-400" ? "#34d399"
                      : m.color === "text-sky-400" ? "#38bdf8"
                      : m.color === "text-amber-400" ? "#fbbf24"
                      : m.color === "text-rose-400" ? "#fb7185"
                      : m.color === "text-violet-400" ? "#a78bfa"
                      : "#2dd4bf"
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-3 py-2 border-t border-border">
        <div className="grid grid-cols-2 gap-2 text-[9px] text-muted-foreground/50">
          <div>Компонентов: <span className="text-foreground/70">{componentCount}</span></div>
          <div className="text-right">Обновление: <span className="text-foreground/70">50ms</span></div>
        </div>
      </div>
    </div>
  );
};

export default MeasurementPanel;
