import { useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import ComponentLibrary, { COMPONENTS } from "@/components/ComponentLibrary";
import CircuitCanvas from "@/components/CircuitCanvas";
import MeasurementPanel from "@/components/MeasurementPanel";
import InfoPanel from "@/components/InfoPanel";
import SaveLoadDialog from "@/components/SaveLoadDialog";
import { useToast } from "@/hooks/use-toast";

interface PlacedComponent {
  id: string;
  type: string;
  label: string;
  symbol: string;
  x: number;
  y: number;
  rotation: number;
}

type RightPanel = "measurements" | "info";

const Index = () => {
  const { toast } = useToast();
  const [selectedLibComponent, setSelectedLibComponent] = useState<string | null>(null);
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>([]);
  const [selectedPlaced, setSelectedPlaced] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [rightPanel, setRightPanel] = useState<RightPanel>("measurements");
  const [dialogMode, setDialogMode] = useState<"save" | "load" | null>(null);
  const [projectName, setProjectName] = useState("");

  const handleDropComponent = useCallback(
    (x: number, y: number) => {
      if (!selectedLibComponent) return;
      const compDef = COMPONENTS.find((c) => c.id === selectedLibComponent);
      if (!compDef) return;

      const newComp: PlacedComponent = {
        id: `${compDef.id}-${Date.now()}`,
        type: compDef.id,
        label: compDef.name,
        symbol: compDef.symbol,
        x,
        y,
        rotation: 0,
      };
      setPlacedComponents((prev) => [...prev, newComp]);
    },
    [selectedLibComponent]
  );

  const handleMoveComponent = useCallback((id: string, x: number, y: number) => {
    setPlacedComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, x, y } : c))
    );
  }, []);

  const handleRotateComponent = useCallback((id: string) => {
    setPlacedComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, rotation: (c.rotation + 90) % 360 } : c))
    );
  }, []);

  const handleDeleteSelected = () => {
    if (!selectedPlaced) return;
    setPlacedComponents((prev) => prev.filter((c) => c.id !== selectedPlaced));
    setSelectedPlaced(null);
  };

  const handleClearAll = () => {
    setPlacedComponents([]);
    setSelectedPlaced(null);
    setIsSimulating(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="h-11 border-b border-border bg-card/50 backdrop-blur flex items-center px-4 gap-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-sm bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Icon name="Cpu" size={13} className="text-primary" />
          </div>
          <span className="text-[12px] font-semibold tracking-[0.12em] uppercase text-foreground">
            CircuitLab
          </span>
          <span className="text-[9px] text-muted-foreground/40 tracking-widest">v1.0</span>
        </div>

        <div className="h-4 w-px bg-border" />

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-[10px] tracking-wider uppercase transition-all border
              ${isSimulating
                ? "bg-primary/15 text-primary border-primary/40 glow-green"
                : "bg-muted/50 text-muted-foreground border-border hover:text-foreground hover:border-primary/30"
              }
            `}
          >
            <Icon name={isSimulating ? "Pause" : "Play"} size={11} />
            {isSimulating ? "Стоп" : "Запуск"}
          </button>

          <button
            onClick={handleDeleteSelected}
            disabled={!selectedPlaced}
            className="flex items-center gap-1 px-2.5 py-1 rounded-sm text-[10px] tracking-wider uppercase border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all disabled:opacity-20 disabled:pointer-events-none"
          >
            <Icon name="Trash2" size={11} />
            Удалить
          </button>

          <button
            onClick={handleClearAll}
            disabled={placedComponents.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 rounded-sm text-[10px] tracking-wider uppercase border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all disabled:opacity-20 disabled:pointer-events-none"
          >
            <Icon name="RotateCcw" size={11} />
            Очистить
          </button>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/50">
            <Icon name="Layers" size={10} />
            <span>{placedComponents.length} эл.</span>
          </div>
          <div className={`flex items-center gap-1.5 text-[9px] ${isSimulating ? "text-primary" : "text-muted-foreground/30"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isSimulating ? "bg-primary animate-pulse-glow" : "bg-muted-foreground/20"}`} />
            {isSimulating ? "Симуляция" : "Ожидание"}
          </div>

          <button
            onClick={() => setDialogMode("save")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-sm text-[10px] tracking-wider uppercase border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all"
          >
            <Icon name="Save" size={11} />
            Сохранить
          </button>
          <button
            onClick={() => setDialogMode("load")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-sm text-[10px] tracking-wider uppercase border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all"
          >
            <Icon name="FolderOpen" size={11} />
            Загрузить
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Component Library */}
        <aside className="w-56 border-r border-border bg-card/30 shrink-0">
          <ComponentLibrary
            selectedComponent={selectedLibComponent}
            onSelectComponent={setSelectedLibComponent}
          />
        </aside>

        {/* Center: Canvas */}
        <main className="flex-1 relative">
          <CircuitCanvas
            placedComponents={placedComponents}
            onDropComponent={handleDropComponent}
            onSelectComponent={setSelectedPlaced}
            selectedId={selectedPlaced}
            onMoveComponent={handleMoveComponent}
            onRotateComponent={handleRotateComponent}
          />

          {selectedLibComponent && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-card/90 border border-primary/30 rounded-sm backdrop-blur glow-green animate-fade-in">
              <span className="text-sm">
                {COMPONENTS.find((c) => c.id === selectedLibComponent)?.symbol}
              </span>
              <span className="text-[10px] text-primary tracking-wider uppercase">
                {COMPONENTS.find((c) => c.id === selectedLibComponent)?.name}
              </span>
              <span className="text-[9px] text-muted-foreground">— кликните на холст для размещения</span>
              <button
                onClick={() => setSelectedLibComponent(null)}
                className="ml-2 text-muted-foreground hover:text-foreground"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          )}
        </main>

        {/* Right: Measurements / Info */}
        <aside className="w-60 border-l border-border bg-card/30 shrink-0 flex flex-col">
          <div className="flex border-b border-border">
            {[
              { id: "measurements" as RightPanel, label: "Измерения", icon: "Gauge" },
              { id: "info" as RightPanel, label: "Справка", icon: "BookOpen" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setRightPanel(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[9px] tracking-wider uppercase transition-all border-b-2
                  ${rightPanel === t.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <Icon name={t.icon} size={11} />
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden">
            {rightPanel === "measurements" ? (
              <MeasurementPanel
                componentCount={placedComponents.length}
                isSimulating={isSimulating}
              />
            ) : (
              <InfoPanel />
            )}
          </div>
        </aside>
      </div>

      {/* Status Bar */}
      <footer className="h-6 border-t border-border bg-card/30 flex items-center px-4 text-[9px] text-muted-foreground/40 tracking-wider shrink-0">
        <div className="flex items-center gap-4">
          <span>GRID: 20px</span>
          <span>SNAP: ON</span>
          <span>ZOOM: 100%</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          {projectName && <span className="text-foreground/50">{projectName}</span>}
          <span>CircuitLab v1.0</span>
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-primary/60" />
            READY
          </span>
        </div>
      </footer>

      {dialogMode && (
        <SaveLoadDialog
          mode={dialogMode}
          currentName={projectName}
          currentComponents={placedComponents}
          onClose={() => setDialogMode(null)}
          onSaved={(project) => {
            setProjectName(project.name);
            setDialogMode(null);
            toast({ title: "Сохранено", description: `Проект «${project.name}» сохранён` });
          }}
          onLoad={(project) => {
            if (project.components) {
              setPlacedComponents(project.components as PlacedComponent[]);
            }
            setProjectName(project.name);
            setSelectedPlaced(null);
            setIsSimulating(false);
            setDialogMode(null);
            toast({ title: "Загружено", description: `Проект «${project.name}» загружен` });
          }}
        />
      )}
    </div>
  );
};

export default Index;