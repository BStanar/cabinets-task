"use client";
import Scene from "@/components/Scene/scene-canvas";
import { loadAllModels } from "@/lib/firestoreService";

export default  function Home() {

  return (
    <main>
      <Scene />
    </main>
  );
}
