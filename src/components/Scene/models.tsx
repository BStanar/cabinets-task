"use client"
import { useGLTF } from "@react-three/drei";
import { ModelTransform } from "@/lib/firestoreService";

interface ModelProps {
  path: string;
  transform: ModelTransform;
}

export default function Model({ path, transform }: ModelProps) {
  const { scene } = useGLTF(path);

  const cloned = scene.clone(true);

  return (
    <primitive
      object={cloned}
      position={[transform.position.x, transform.position.y, transform.position.z]}
      rotation={[transform.rotation.x, transform.rotation.y, transform.rotation.z]}
    />
  );
}