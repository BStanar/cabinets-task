import { useRef } from "react";
import * as THREE from "three";
import { BoundingBoxRegistry } from "./use-scene-data";

export function useCollisionResolver(
  modelId: string,
  groupRef: React.RefObject<THREE.Group | null>,
  boundingBoxRegistry: BoundingBoxRegistry
) {
  // Reusable Three.js objects allocated once on mount — creating new Vector3/Box3
  // instances every drag frame would cause unnecessary garbage collection pressure.
  const ownBox = useRef(new THREE.Box3());
  const ownSize = useRef(new THREE.Vector3());
  const otherSize = useRef(new THREE.Vector3());
  const ownCenter = useRef(new THREE.Vector3());
  const otherCenter = useRef(new THREE.Vector3());

  const resolveCollisions = () => {
    if (!groupRef.current) return;

    // Recompute this model's world-space bounding box and publish it to the registry so other models see the updated position on their 
    // next check.
    ownBox.current.setFromObject(groupRef.current);
    boundingBoxRegistry.current[modelId] = ownBox.current.clone();

    for (const [otherId, otherBB] of Object.entries(boundingBoxRegistry.current)) {
      if (otherId === modelId) continue;
      if (!ownBox.current.intersectsBox(otherBB)) continue;

      // Compute how far the boxes overlap on each horizontal axis.
      ownBox.current.getSize(ownSize.current);
      otherBB.getSize(otherSize.current);
      ownBox.current.getCenter(ownCenter.current);
      otherBB.getCenter(otherCenter.current);

      const overlapX =
        ownSize.current.x / 2 +
        otherSize.current.x / 2 -
        Math.abs(ownCenter.current.x - otherCenter.current.x);

      const overlapZ =
        ownSize.current.z / 2 +
        otherSize.current.z / 2 -
        Math.abs(ownCenter.current.z - otherCenter.current.z);

      // Minimum Translation Vector: push along the axis with the smaller overlap so the separation feels natural
      if (overlapX < overlapZ) {
        const signX = ownCenter.current.x >= otherCenter.current.x ? 1 : -1;
        groupRef.current.position.x += signX * overlapX;
      } else {
        const signZ = ownCenter.current.z >= otherCenter.current.z ? 1 : -1;
        groupRef.current.position.z += signZ * overlapZ;
      }

      // Re-publish the corrected bounding box so subsequent checks in the same frame
      ownBox.current.setFromObject(groupRef.current);
      boundingBoxRegistry.current[modelId] = ownBox.current.clone();
    }
  };

  return resolveCollisions;
}