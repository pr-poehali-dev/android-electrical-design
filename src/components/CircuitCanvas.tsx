import { useState, useRef, useCallback } from "react";

interface PlacedComponent {
  id: string;
  type: string;
  label: string;
  symbol: string;
  x: number;
  y: number;
  rotation: number;
}

interface CircuitCanvasProps {
  placedComponents: PlacedComponent[];
  onDropComponent: (x: number, y: number) => void;
  onSelectComponent: (id: string | null) => void;
  selectedId: string | null;
  onMoveComponent: (id: string, x: number, y: number) => void;
  onRotateComponent: (id: string) => void;
}

const CircuitCanvas = ({
  placedComponents,
  onDropComponent,
  onSelectComponent,
  selectedId,
  onMoveComponent,
  onRotateComponent,
}: CircuitCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const snapToGrid = (val: number) => Math.round(val / 20) * 20;

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      const rect = canvasRef.current!.getBoundingClientRect();
      onDropComponent(
        snapToGrid(e.clientX - rect.left),
        snapToGrid(e.clientY - rect.top)
      );
    }
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onSelectComponent(id);
      const comp = placedComponents.find((c) => c.id === id);
      if (comp) {
        setIsDragging(id);
        setDragOffset({ x: e.clientX - comp.x, y: e.clientY - comp.y });
      }
    },
    [placedComponents, onSelectComponent]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        onMoveComponent(
          isDragging,
          snapToGrid(e.clientX - dragOffset.x),
          snapToGrid(e.clientY - dragOffset.y)
        );
      }
    },
    [isDragging, dragOffset, onMoveComponent]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  const handleDoubleClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onRotateComponent(id);
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full grid-dots overflow-hidden cursor-crosshair select-none"
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute inset-0 scanline pointer-events-none" />

      <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] text-muted-foreground/40 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse-glow" />
        CANVAS — 20px GRID
      </div>

      {placedComponents.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-3 opacity-30">
            <div className="text-5xl">⚡</div>
            <div className="text-xs text-muted-foreground tracking-[0.2em] uppercase">
              Выберите компонент и кликните на холст
            </div>
            <div className="text-[10px] text-muted-foreground/60">
              Двойной клик — поворот · Перетаскивание — перемещение
            </div>
          </div>
        </div>
      )}

      {placedComponents.map((comp, i) => (
        <div
          key={comp.id}
          className={`absolute flex flex-col items-center cursor-grab active:cursor-grabbing transition-shadow duration-150
            ${selectedId === comp.id ? "z-20" : "z-10"}
          `}
          style={{
            left: comp.x - 30,
            top: comp.y - 30,
            animationDelay: `${i * 50}ms`,
          }}
          onMouseDown={(e) => handleMouseDown(e, comp.id)}
          onDoubleClick={(e) => handleDoubleClick(e, comp.id)}
        >
          <div
            className={`w-[60px] h-[60px] rounded border flex items-center justify-center text-xl transition-all duration-150
              ${
                selectedId === comp.id
                  ? "border-primary bg-primary/10 glow-green"
                  : "border-border bg-card/80 hover:border-primary/40"
              }
            `}
            style={{ transform: `rotate(${comp.rotation}deg)` }}
          >
            {comp.symbol}
          </div>
          <span
            className={`mt-1 text-[9px] tracking-wider uppercase whitespace-nowrap
              ${selectedId === comp.id ? "text-primary text-glow" : "text-muted-foreground/60"}
            `}
          >
            {comp.label}
          </span>
        </div>
      ))}

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {placedComponents.map((comp, i) => {
          const next = placedComponents[i + 1];
          if (!next) return null;
          return (
            <line
              key={`wire-${i}`}
              x1={comp.x}
              y1={comp.y}
              x2={next.x}
              y2={next.y}
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
              strokeOpacity="0.3"
              strokeDasharray="4 4"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default CircuitCanvas;
