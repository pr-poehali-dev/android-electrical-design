import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/55d69191-34f7-4e6d-a139-8d954c8094b9";

interface CircuitProject {
  id: string;
  name: string;
  description: string;
  components?: Record<string, unknown>[];
  created_at: string;
  updated_at: string;
}

interface SaveLoadDialogProps {
  mode: "save" | "load";
  currentName: string;
  currentComponents: Record<string, unknown>[];
  onClose: () => void;
  onLoad: (project: CircuitProject) => void;
  onSaved: (project: CircuitProject) => void;
}

const SaveLoadDialog = ({
  mode,
  currentName,
  currentComponents,
  onClose,
  onLoad,
  onSaved,
}: SaveLoadDialogProps) => {
  const [name, setName] = useState(currentName || "");
  const [description, setDescription] = useState("");
  const [projects, setProjects] = useState<CircuitProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "load") {
      fetchProjects();
    }
  }, [mode]);

  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Ошибка загрузки");
      const data = await res.json();
      setProjects(data);
    } catch {
      setError("Не удалось загрузить список проектов");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          components: currentComponents,
        }),
      });
      if (!res.ok) throw new Error("Ошибка сохранения");
      const data = await res.json();
      onSaved(data);
    } catch {
      setError("Не удалось сохранить проект");
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async (id: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}?id=${id}`);
      if (!res.ok) throw new Error("Ошибка загрузки");
      const data = await res.json();
      onLoad(data);
    } catch {
      setError("Не удалось загрузить проект");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Не удалось удалить проект");
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-border rounded-sm shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Icon
              name={mode === "save" ? "Save" : "FolderOpen"}
              size={14}
              className="text-primary"
            />
            <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-foreground">
              {mode === "save" ? "Сохранить проект" : "Загрузить проект"}
            </span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={14} />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-3 px-3 py-2 bg-destructive/10 border border-destructive/30 rounded-sm text-[10px] text-destructive">
              {error}
            </div>
          )}

          {mode === "save" && (
            <div className="space-y-3">
              <div>
                <label className="block text-[9px] text-muted-foreground tracking-wider uppercase mb-1">
                  Название
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Моя схема..."
                  className="w-full bg-muted/50 border border-border rounded-sm text-[11px] px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[9px] text-muted-foreground tracking-wider uppercase mb-1">
                  Описание
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Краткое описание схемы..."
                  rows={2}
                  className="w-full bg-muted/50 border border-border rounded-sm text-[11px] px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[9px] text-muted-foreground">
                  {currentComponents.length} компонентов
                </span>
                <button
                  onClick={handleSave}
                  disabled={!name.trim() || saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-sm text-[10px] tracking-wider uppercase bg-primary/15 text-primary border border-primary/40 hover:bg-primary/25 transition-all disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Icon name={saving ? "Loader2" : "Save"} size={11} className={saving ? "animate-spin" : ""} />
                  {saving ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </div>
          )}

          {mode === "load" && (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Icon name="Loader2" size={16} className="animate-spin" />
                </div>
              )}

              {!loading && projects.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-2xl mb-2 opacity-30">📂</div>
                  <div className="text-[10px] text-muted-foreground/60">Нет сохранённых проектов</div>
                </div>
              )}

              {projects.map((project, i) => (
                <div
                  key={project.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-sm border border-border hover:border-primary/30 hover:bg-muted/20 transition-all group animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${i * 40}ms` }}
                  onClick={() => handleLoad(project.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-foreground font-medium truncate">
                      {project.name}
                    </div>
                    <div className="text-[9px] text-muted-foreground/60 mt-0.5">
                      {formatDate(project.updated_at)}
                      {project.description && ` · ${project.description}`}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id);
                    }}
                    className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-destructive transition-opacity"
                  >
                    <Icon name="Trash2" size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveLoadDialog;