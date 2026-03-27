"use client";
import { Canvas } from "@react-three/fiber";
import OrbitControls from "../orbit-controls";
import Model from "./models";
import {
  DEFAULT_STATE,
  loadAllModels,
  ModelsState,
} from "@/lib/firestoreService";
import { useEffect, useState } from "react";

export default function Scene() {
  const [modelsState, setModelsState] = useState<ModelsState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadAllModels().then((state) => {
      setModelsState(state);
      setLoaded(true);
    });
  }, []);

  if (!loaded) return <div>Loading...</div>;
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        shadows
        camera={{ position: [0, 6, 10], fov: 50 }}
        style={{ background: "#0d0d0f" }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        <Model
          path="/models/double-door-base-cabinet.glb"
          transform={modelsState.model1}
        />
        <Model
          path="/models/sink-kitchen-cabinet.glb"
          transform={modelsState.model2}
        />

        <OrbitControls />
      </Canvas>
    </div>
  );
}
