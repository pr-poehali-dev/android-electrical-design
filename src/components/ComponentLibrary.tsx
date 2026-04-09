import { useState } from "react";
import Icon from "@/components/ui/icon";

export interface ComponentItem {
  id: string;
  name: string;
  symbol: string;
  category: string;
  description: string;
  params: string;
}

const COMPONENTS: ComponentItem[] = [
  { id: "resistor", name: "Резистор", symbol: "⊗", category: "passive", description: "Ограничивает ток в цепи", params: "1kΩ — 10MΩ" },
  { id: "capacitor", name: "Конденсатор", symbol: "⊟", category: "passive", description: "Накапливает электрический заряд", params: "1pF — 1000μF" },
  { id: "inductor", name: "Катушка", symbol: "⊞", category: "passive", description: "Создаёт магнитное поле", params: "1μH — 100mH" },
  { id: "diode", name: "Диод", symbol: "▷", category: "active", description: "Пропускает ток в одном направлении", params: "Vf = 0.7V" },
  { id: "led", name: "Светодиод", symbol: "◈", category: "active", description: "Излучает свет при прохождении тока", params: "Vf = 2.0V" },
  { id: "npn", name: "NPN транзистор", symbol: "⋔", category: "active", description: "Усиливает и переключает сигналы", params: "β = 100" },
  { id: "pnp", name: "PNP транзистор", symbol: "⋒", category: "active", description: "Комплементарный NPN", params: "β = 100" },
  { id: "battery", name: "Батарея", symbol: "⚡", category: "source", description: "Источник постоянного напряжения", params: "1.5V — 24V" },
  { id: "ac-source", name: "Генератор AC", symbol: "∿", category: "source", description: "Источник переменного напряжения", params: "50Hz, 220V" },
  { id: "gnd", name: "Земля", symbol: "⏚", category: "source", description: "Общая точка отсчёта потенциала", params: "0V REF" },
  { id: "switch", name: "Переключатель", symbol: "⊸", category: "control", description: "Замыкает/размыкает цепь", params: "ON / OFF" },
  { id: "fuse", name: "Предохранитель", symbol: "⊘", category: "control", description: "Защита от перегрузок", params: "0.5A — 30A" },
];

const CATEGORIES = [
  { id: "all", label: "Все", icon: "LayoutGrid" },
  { id: "passive", label: "Пассивные", icon: "Circle" },
  { id: "active", label: "Активные", icon: "Zap" },
  { id: "source", label: "Источники", icon: "Battery" },
  { id: "control", label: "Управление", icon: "ToggleLeft" },
];

interface ComponentLibraryProps {
  selectedComponent: string | null;
  onSelectComponent: (id: string) => void;
}

const ComponentLibrary = ({ selectedComponent, onSelectComponent }: ComponentLibraryProps) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = COMPONENTS.filter((c) => {
    const matchCat = activeCategory === "all" || c.category === activeCategory;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 pt-3 pb-2 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Box" size={14} className="text-primary" />
          <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-foreground">
            Компоненты
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground">{filtered.length}</span>
        </div>

        <div className="relative">
          <Icon name="Search" size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-muted/50 border border-border rounded-sm text-[11px] pl-7 pr-2 py-1.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-0.5 px-2 py-2 border-b border-border">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-1 py-1 rounded-sm text-[9px] tracking-wider uppercase transition-all
              ${activeCategory === cat.id
                ? "bg-primary/15 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
              }
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.map((comp, i) => (
          <button
            key={comp.id}
            onClick={() => onSelectComponent(comp.id)}
            className={`w-full text-left px-2.5 py-2 rounded-sm border transition-all duration-150 group animate-fade-in
              ${selectedComponent === comp.id
                ? "border-primary/50 bg-primary/10"
                : "border-transparent hover:border-border hover:bg-muted/30"
              }
            `}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="flex items-center gap-2.5">
              <span className={`text-lg w-6 text-center ${selectedComponent === comp.id ? "text-glow" : ""}`}>
                {comp.symbol}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-foreground truncate">
                  {comp.name}
                </div>
                <div className="text-[9px] text-muted-foreground truncate">{comp.params}</div>
              </div>
              <Icon
                name="Plus"
                size={12}
                className={`opacity-0 group-hover:opacity-60 transition-opacity ${selectedComponent === comp.id ? "!opacity-100 text-primary" : ""}`}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export { COMPONENTS };
export default ComponentLibrary;
