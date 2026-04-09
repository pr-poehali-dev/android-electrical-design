import { useState } from "react";
import Icon from "@/components/ui/icon";
import { COMPONENTS } from "@/components/ComponentLibrary";

const GUIDES = [
  {
    title: "Закон Ома",
    content: "V = I × R — напряжение равно произведению тока на сопротивление. Основной закон электрических цепей.",
    formula: "V = I · R",
  },
  {
    title: "Закон Кирхгофа (1)",
    content: "Сумма токов, входящих в узел, равна сумме токов, выходящих из него.",
    formula: "ΣI_вх = ΣI_вых",
  },
  {
    title: "Закон Кирхгофа (2)",
    content: "Сумма ЭДС в замкнутом контуре равна сумме падений напряжений.",
    formula: "ΣE = ΣI·R",
  },
  {
    title: "Мощность",
    content: "Мощность — произведение напряжения на ток. Измеряется в ваттах (Вт).",
    formula: "P = V · I",
  },
  {
    title: "Ёмкость",
    content: "Заряд конденсатора пропорционален приложенному напряжению и ёмкости.",
    formula: "Q = C · V",
  },
  {
    title: "Индуктивность",
    content: "ЭДС самоиндукции пропорциональна скорости изменения тока.",
    formula: "V = L · dI/dt",
  },
];

type Tab = "guide" | "components";

const InfoPanel = () => {
  const [tab, setTab] = useState<Tab>("guide");
  const [expandedGuide, setExpandedGuide] = useState<number | null>(0);
  const [expandedComp, setExpandedComp] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 pt-3 pb-2 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="BookOpen" size={14} className="text-violet-400" />
          <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-foreground">
            Справка
          </span>
        </div>
        <div className="flex gap-1">
          {[
            { id: "guide" as Tab, label: "Формулы", icon: "Calculator" },
            { id: "components" as Tab, label: "Компоненты", icon: "Cpu" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-sm text-[10px] tracking-wider uppercase transition-all
                ${tab === t.id
                  ? "bg-violet-500/15 text-violet-400 border border-violet-500/30"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
                }
              `}
            >
              <Icon name={t.icon} size={10} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {tab === "guide" && (
          <div className="space-y-1">
            {GUIDES.map((guide, i) => (
              <div
                key={i}
                className="border border-border rounded-sm overflow-hidden animate-fade-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <button
                  onClick={() => setExpandedGuide(expandedGuide === i ? null : i)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="text-[10px] text-violet-400 font-mono">{guide.formula}</span>
                  <span className="flex-1 text-[10px] text-foreground/80 truncate">{guide.title}</span>
                  <Icon
                    name="ChevronDown"
                    size={10}
                    className={`text-muted-foreground transition-transform ${expandedGuide === i ? "rotate-180" : ""}`}
                  />
                </button>
                {expandedGuide === i && (
                  <div className="px-3 pb-2.5 border-t border-border/50">
                    <div className="mt-2 text-center py-3 bg-muted/30 rounded-sm mb-2">
                      <span className="text-lg text-violet-300 font-mono">{guide.formula}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {guide.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "components" && (
          <div className="space-y-1">
            {COMPONENTS.map((comp, i) => (
              <div
                key={comp.id}
                className="border border-border rounded-sm overflow-hidden animate-fade-in"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <button
                  onClick={() => setExpandedComp(expandedComp === comp.id ? null : comp.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="text-sm">{comp.symbol}</span>
                  <span className="flex-1 text-[10px] text-foreground/80">{comp.name}</span>
                  <span className="text-[9px] text-muted-foreground/50">{comp.params}</span>
                </button>
                {expandedComp === comp.id && (
                  <div className="px-3 pb-2.5 border-t border-border/50">
                    <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
                      {comp.description}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <div className="flex-1 bg-muted/30 rounded-sm px-2 py-1.5">
                        <div className="text-[8px] text-muted-foreground/60 uppercase tracking-wider">Диапазон</div>
                        <div className="text-[10px] text-foreground/80 font-mono mt-0.5">{comp.params}</div>
                      </div>
                      <div className="flex-1 bg-muted/30 rounded-sm px-2 py-1.5">
                        <div className="text-[8px] text-muted-foreground/60 uppercase tracking-wider">Категория</div>
                        <div className="text-[10px] text-foreground/80 mt-0.5 capitalize">{comp.category}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPanel;
