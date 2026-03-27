import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export function useOrbitControls() {
   const { camera, gl} = useThree();

   useEffect(()=> {
      const controls = new OrbitControls(camera, gl.domElement);

      controls.enableDamping = true;

      return () => controls.dispose();
   }, [camera, gl]);
}