import { ModelsState } from "@/lib/firestoreService";
import { SelectedModelId } from "@/hooks/use-scene-data";

interface RotationPanelProps {
  modelId: SelectedModelId;
  modelsState: ModelsState;
  onRotationChange: (modelId: "model1" | "model2", valueDeg: number) => void;
  onClose: () => void;
}

// Converts radians to degrees, keeping 360 as 360 instead of wrapping to 0.
function toDeg(r: number): number {
  const deg = Math.round((r * 180) / Math.PI) % 360;
  return deg === 0 && r > 0 ? 360 : deg < 0 ? deg + 360 : deg;
}

// Rendered outside <Canvas> as a normal DOM overlay — appears on top of the scene
// when a model is selected, hidden when selectedModel is null.
export default function RotationPanel({
  modelId,
  modelsState,
  onRotationChange,
  onClose,
}: RotationPanelProps) {
  if (!modelId) return null;

  const currentDeg = toDeg(modelsState[modelId].rotation.y);
  const label = modelId === "model1" ? "Model 1" : "Model 2";

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-[rgba(20,20,28,0.92)] border border-[rgba(255,255,255,0.12)] rounded-xl px-6 py-4 text-white min-w-[320px] backdrop-blur-sm">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-sm">Rotation — {label}</span>
        <button
          onClick={onClose}
          className="bg-transparent border-none text-[#aaa] cursor-pointer text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="w-4 font-bold text-[13px] text-[#4ade80]">Y</span>
        <input
          type="range"
          min={0}
          max={360}
          value={currentDeg}
          onChange={(e) => onRotationChange(modelId, Number(e.target.value))}
          className="flex-1 accent-[#4ade80]"
        />
        <span className="w-9 text-right text-[13px] text-[#ccc]">
          {currentDeg}°
        </span>
      </div>
    </div>
  );
}