"use client";
import { DragControls, useGLTF } from "@react-three/drei";
import { ModelTransform, saveModelState } from "@/lib/firestoreService";
import { ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

interface ModelProps {
  path: string;
  modelId: "model1" | "model2";
  transform: ModelTransform;
}

export default function Model({ path, modelId, transform }: ModelProps) {
  const { scene } = useGLTF(path);
  const groupRef = useRef<THREE.Group>(null);

  const cloned = useMemo(() => scene.clone(true), [scene]);

  const yOffset = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    return -box.min.y;
  }, [cloned]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!groupRef.current) return;

    const worldPosition = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPosition);
    console.log(`[${path}] position:`, {
      x: worldPosition.x,
      y: worldPosition.y,
      z: worldPosition.z,
    });
  };

  const handleDragEnd = () => {
    if (!groupRef.current) return;

    const worldPosition = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPosition);

    console.log(`[${path}] dragged to:`, worldPosition);
    saveModelState(modelId, {
      position: { x: worldPosition.x, y: worldPosition.y, z: worldPosition.z },
      rotation: {
        x: transform.rotation.x,
        y: transform.rotation.y,
        z: transform.rotation.z,
      },
    });
  };

  return (
    <DragControls
      autoTransform
      onDrag={() => {
        if (!groupRef.current) return;

        const worldPosition = new THREE.Vector3();
        groupRef.current.getWorldPosition(worldPosition);

        if (worldPosition.y < 0) {
          groupRef.current.position.y -= worldPosition.y;
          console.log(`[${path}] dragged under the plane`);
        }
        /**if (worldPosition.x < -10) {
          groupRef.current.position.x -= worldPosition.x + 10; // clamp to -10
        } else if (worldPosition.x > 10) {
          groupRef.current.position.x -= worldPosition.x - 10; // clamp to +10
        } */
      }}
      onDragEnd={handleDragEnd}
    >
      <group
        ref={groupRef}
        onClick={handleClick}
        position={[
          transform.position.x,
          transform.position.y,
          transform.position.z,
        ]}
        rotation={[
          transform.rotation.x,
          transform.rotation.y,
          transform.rotation.z,
        ]}
      >
        <primitive object={cloned} position={[0, yOffset, 0]} />
      </group>
    </DragControls>
  );
}
