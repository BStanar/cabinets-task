"use client";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import Model from "./models";
import { useCameraRig } from "@/hooks/use-camera-rotation";
import { useSceneData } from "@/hooks/use-scene-data";
import RotationPanel from "./rotation-panel";

// useCameraRig calls useFrame internally, which must run inside <Canvas>.
// This thin wrapper component lets us call the hook from within the R3F tree.
function CameraRig({
  isTopDown,
  draggingRef,
}: {
  isTopDown: boolean;
  draggingRef: React.RefObject<boolean>;
}) {
  useCameraRig(isTopDown, draggingRef);
  return null;
}

export default function Scene() {
  const {
    modelsState,
    loaded,
    selectedModel,
    setSelectedModel,
    boundingBoxRegistry,
    draggingRef,
    handleRotationChange,
  } = useSceneData();

  // Controls which camera is active — perspective (3D) or orthographic (2D top-down).
  const [isTopDown, setIsTopDown] = useState(false);

  if (!loaded) return <div>Loading...</div>;

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Toggle rendered outside Canvas so it sits on top as a normal DOM element. */}
      <button
        onClick={() => setIsTopDown((v) => !v)}
        className="absolute top-4 right-4 z-10 p-2 bg-[rgba(20,20,28,0.88)] text-white border-2 border-[rgba(255,255,255,0.15)] rounded-[10px] cursor-pointer font-semibold text-[13px] backdrop-blur-[6px] w-35"
      >
        {isTopDown ? "3D view" : "2D view (top down)"}
      </button>

      <Canvas
        shadows
        camera={{ position: [0, 6, 10], fov: 50 }}
        style={{ background: "#0d0d0f" }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[10, 10, 5]} intensity={5} />

        {/* Floor plane — provides a visual surface and acts as the drag target. */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#ffdfff" />
        </mesh>

        <gridHelper
          args={[20, 20, "#ccaacc", "#ccaacc"]}
          position={[0, 0, 0]}
        />

        <Model
          path="/models/double-door-base-cabinet.glb"
          modelId="model1"
          transform={modelsState.model1}
          boundingBoxRegistry={boundingBoxRegistry}
          draggingRef={draggingRef}
          isSelected={selectedModel === "model1"}
          onSelect={() => setSelectedModel("model1")}
        />
        <Model
          path="/models/sink-kitchen-cabinet.glb"
          modelId="model2"
          transform={modelsState.model2}
          boundingBoxRegistry={boundingBoxRegistry}
          draggingRef={draggingRef}
          isSelected={selectedModel === "model2"}
          onSelect={() => setSelectedModel("model2")}
        />
        <CameraRig isTopDown={isTopDown} draggingRef={draggingRef} />
      </Canvas>
      <RotationPanel
        modelId={selectedModel}
        modelsState={modelsState}
        onRotationChange={handleRotationChange}
        onClose={() => setSelectedModel(null)}
      />
    </div>
  );
}
