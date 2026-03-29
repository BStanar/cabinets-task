"use client";
import { useGLTF } from "@react-three/drei";
import { ModelTransform } from "@/lib/firestoreService";
import { ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

interface ModelProps {
  path: string;
  transform: ModelTransform;
}

export default function Model({ path, transform }: ModelProps) {
  const { scene } = useGLTF(path);
  const groupRef = useRef<THREE.Group>(null);

  const cloned = useMemo(() => scene.clone(true), [scene]);
  const yOffset = useMemo(() => {
    const box= new THREE.Box3().setFromObject(cloned);
    return -box.min.y
  }, [cloned])

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!groupRef.current) return;

    const worldPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPos);
    console.log(`[${path}] position:`, {
      x: worldPos.x,
      y: worldPos.y,
      z: worldPos.z,
    });
  };

  return (
    
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
      <primitive object={cloned}  position={[0, yOffset, 0]} />
    </group>
  );
}
