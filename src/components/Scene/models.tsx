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
  isSelected: boolean;
  onSelect: () => void;
}

const FLOOR_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

export default function Model({
  path,
  modelId,
  transform,
  boundingBoxRegistry,
  draggingRef,
  isSelected,
  onSelect,
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

  const resolveCollisions = useCollisionResolver(
    modelId,
    groupRef,
    boundingBoxRegistry,
  );

  // Compute the local-space bounding box with yOffset applied — used for
  // both the selection wireframe and the initial collision registration.
  const localBox = useMemo(() => {
    cloned.position.set(0, yOffset, 0);
    cloned.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(cloned);
    cloned.position.set(0, 0, 0);
    return box;
  }, [cloned, yOffset]);

  const localSize = useMemo(
    () => new THREE.Vector3().copy(localBox.getSize(new THREE.Vector3())),
    [localBox],
  );
  const localCenter = useMemo(
    () => new THREE.Vector3().copy(localBox.getCenter(new THREE.Vector3())),
    [localBox],
  );

  // Register this model's bounding box on mount
  useEffect(() => {
    if (!groupRef.current) return;
    boundingBoxRegistry.current[modelId] = new THREE.Box3().setFromObject(
      groupRef.current,
    );
  }, [boundingBoxRegistry, modelId]);

  // When rotation changes via the slider: apply it to the Three.js object,
  // re-register the BB (rotation changes its shape), then push out of any overlap.
  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.set(
      transform.rotation.x,
      transform.rotation.y,
      transform.rotation.z,
    );
    boundingBoxRegistry.current[modelId] = new THREE.Box3().setFromObject(
      groupRef.current,
    );
    resolveCollisions();
  }, [
    transform.rotation.x,
    transform.rotation.y,
    transform.rotation.z,
    boundingBoxRegistry,
    modelId,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!groupRef.current) return;

    onSelect();
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
      groupRef.current.position.z - floorPoint.current.z,
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
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <primitive object={cloned} position={[0, yOffset, 0]} />
      {isSelected && <SelectionBox size={localSize} center={localCenter} />}
    </group>
  );
}

// Wireframe box rendered around the selected model.
// size and center are computed in group-local space so the box aligns with the mesh.
function SelectionBox({
  size,
  center,
}: {
  size: THREE.Vector3;
  center: THREE.Vector3;
}) {
  return (
    <mesh position={[center.x, center.y, center.z]}>
      <boxGeometry args={[size.x, size.y, size.z]} />
      <meshBasicMaterial color="#60a5fa" wireframe />
    </mesh>
  );
}
