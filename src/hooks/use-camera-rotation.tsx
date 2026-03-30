import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DraggingRef } from "./use-scene-data";

export function useCameraRig(isTopDown: boolean, draggingRef: DraggingRef) {
  const { gl, set, get } = useThree();
  const orthoRef = useRef<THREE.OrthographicCamera | null>(null);
  const perspRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Stash the default perspective camera created by <Canvas> so we can
  // restore it when switching back from 2D to 3D.
  useEffect(() => {
    perspRef.current = get().camera as unknown as THREE.PerspectiveCamera;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const w = gl.domElement.clientWidth || 1;
    const h = gl.domElement.clientHeight || 1;
    const aspect = w / h;
    const frustumSize = 10;

    controlsRef.current?.dispose();
    controlsRef.current = null;

    let activeCamera: THREE.OrthographicCamera | THREE.PerspectiveCamera;

    if (isTopDown) {
      if (!orthoRef.current) {
        const ortho = new THREE.OrthographicCamera(
          (-frustumSize * aspect) / 2,
          (frustumSize * aspect) / 2,
          frustumSize / 2,
          -frustumSize / 2,
          0.1,
          200
        );
        // Position the camera directly above the scene.
        ortho.position.set(0, 50, 0);
        ortho.up.set(0, 0, -1);
        ortho.lookAt(0, 0, 0);
        ortho.updateProjectionMatrix();
        orthoRef.current = ortho;
      }
      activeCamera = orthoRef.current;
    } else {
      activeCamera = perspRef.current!;
    }

    // Swap the active camera in the R3F store — all subsequent renders use this.
    set({ camera: activeCamera });

    const controls = new OrbitControls(activeCamera, gl.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);

    if (isTopDown) {
      // 2D mode: left mouse pans, scroll zooms, rotation is fully disabled.
      controls.enableRotate = false;
      controls.enableZoom = true;
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      };
    } else {
      // 3D mode: full orbit, camera can't go below the floor plane.
      controls.enableRotate = true;
      controls.enableZoom = true;
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI / 2;
    }

    controls.update();
    controlsRef.current = controls;

    return () => {
      controls.dispose();
      controlsRef.current = null;
    };
  }, [isTopDown, gl, set]);

  // Disable controls while a model is being dragged so the camera doesn't
  // orbit at the same time. enableDamping also requires update() every frame.
  useFrame(() => {
    const c = controlsRef.current;
    if (!c) return;
    c.enabled = !draggingRef.current;
    c.update();
  });
}