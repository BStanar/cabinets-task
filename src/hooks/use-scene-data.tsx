import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  DEFAULT_STATE,
  loadAllModels,
  ModelsState,
  saveModelState,
} from "@/lib/firestoreService";

// Shared ref type passed to each Model so they can read/write each other's
// bounding boxes for collision detection without going through React state.
export type BoundingBoxRegistry = React.RefObject<Record<string, THREE.Box3>>;

// Disable OrbitControls during drag.
export type DraggingRef = React.RefObject<boolean>;

export type SelectedModelId = "model1" | "model2" | null;

export function useSceneData() {
  const [modelsState, setModelsState] = useState<ModelsState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [selectedModel, setSelectedModel] = useState<SelectedModelId>(null);

  // Model writes its current world-space bounding box here
  const boundingBoxRegistry = useRef<Record<string, THREE.Box3>>({});

  // True while any model is being dragged — read by CameraRig each frame.
  const draggingRef = useRef(false);

  useEffect(() => {
    loadAllModels().then((state) => {
      setModelsState(state);
      setLoaded(true);
    });
  }, []);

  // Converts slider degrees to radians, updates state, and persists to Firestore.
  const handleRotationChange = (
    modelId: "model1" | "model2",
    valueDeg: number,
  ) => {
    const rad = (valueDeg * Math.PI) / 180;
    const updated: ModelsState = {
      ...modelsState,
      [modelId]: {
        ...modelsState[modelId],
        rotation: { ...modelsState[modelId].rotation, y: rad },
      },
    };
    setModelsState(updated);
    saveModelState(modelId, updated[modelId]);
  };
  return {
    modelsState,
    loaded,
    selectedModel,
    setSelectedModel,
    boundingBoxRegistry,
    draggingRef,
    handleRotationChange,
  };
}
