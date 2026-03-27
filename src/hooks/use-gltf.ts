import { useEffect, useState } from "react";
import { Group } from "three";
import { DRACOLoader, GLTFLoader } from "three/examples/jsm/Addons.js";

export  function useGLTF(url: string){
   const [scene, setScene ] = useState<Group | null>(null);
   useEffect(()=> {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath( '/draco/' );
      
      const loader = new GLTFLoader();
      loader.setDRACOLoader( dracoLoader );
      
      loader.loadAsync(url)
      .then((gltf) => {
        setScene(gltf.scene);
      })
      .catch((error) => {
        console.error('Error loading GLB:', error);
      });

      return () => {
      dracoLoader.dispose();
    };
   }, [url])

   return scene;
}