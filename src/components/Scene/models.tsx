"use client";
import { ThreeEvent, useLoader, useThree } from "@react-three/fiber";
import { ModelTransform, saveModelState } from "@/lib/firestoreService";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { BoundingBoxRegistry, DraggingRef } from "@/hooks/use-scene-data";
import { useCollisionResolver } from "@/hooks/use-colision-resolver";

interface ModelProps {
  path: string;
  modelId: "model1" | "model2";
  transform: ModelTransform;
  boundingBoxRegistry: BoundingBoxRegistry;
  draggingRef: DraggingRef;
}

const FLOOR_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

export default function Model({
  path,
  modelId,
  transform,
  boundingBoxRegistry,
  draggingRef,
}: ModelProps) {
  const gltf = useLoader(GLTFLoader, path);
  const groupRef = useRef<THREE.Group>(null);
  const isThisModelDragging = useRef(false);
  const dragOffset = useRef(new THREE.Vector3());
  const floorPoint = useRef(new THREE.Vector3());

  // R3F's shared raycaster — already aimed at the current pointer every frame.
  const { raycaster, gl } = useThree();

  // Clone the scene so each Model instance has its own independent mesh.
  const cloned = useMemo(() => clone(gltf.scene), [gltf.scene]);

  // Shift the mesh up so its lowest point sits exactly on the floor (y=0).
  const yOffset = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    return -box.min.y;
  }, [cloned]);

  const resolveCollisions = useCollisionResolver(modelId, groupRef, boundingBoxRegistry);

  // Register this model's bounding box on mount
  useEffect(() => {
    if (!groupRef.current) return;
    boundingBoxRegistry.current[modelId] = new THREE.Box3().setFromObject(groupRef.current);
  }, [boundingBoxRegistry, modelId]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!groupRef.current) return;

    isThisModelDragging.current = true;
    // Signal to CameraRig that a drag is in progress so OrbitControls is disabled.
    draggingRef.current = true;
    gl.domElement.style.cursor = "grabbing";

    // setPointerCapture ensures pointermove keeps firing even if the pointer
    // moves off the mesh during a fast drag.
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    // Store the offset between the model origin and the floor hit point so
    // the model doesn't jump to be centered under the cursor on pickup.
    raycaster.ray.intersectPlane(FLOOR_PLANE, floorPoint.current);
    dragOffset.current.set(
      groupRef.current.position.x - floorPoint.current.x,
      0,
      groupRef.current.position.z - floorPoint.current.z
    );
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isThisModelDragging.current || !groupRef.current) return;
    e.stopPropagation();

    // Move the model to the new floor intersection point, preserving the pickup offset.
    raycaster.ray.intersectPlane(FLOOR_PLANE, floorPoint.current);
    groupRef.current.position.x = floorPoint.current.x + dragOffset.current.x;
    groupRef.current.position.z = floorPoint.current.z + dragOffset.current.z;

    resolveCollisions();
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!isThisModelDragging.current || !groupRef.current) return;
    e.stopPropagation();

    isThisModelDragging.current = false;
    draggingRef.current = false;
    gl.domElement.style.cursor = "auto";

    // Persist the final position to Firestore so it survives a page reload.
    const worldPosition = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPosition);

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
    <group
      ref={groupRef}
      position={[transform.position.x, transform.position.y, transform.position.z]}
      rotation={[transform.rotation.x, transform.rotation.y, transform.rotation.z]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <primitive object={cloned} position={[0, yOffset, 0]} />
    </group>
  );
}