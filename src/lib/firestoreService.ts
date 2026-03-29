import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";


interface ModelTransform {
   position: {x: number; y:number; z:number}
   rotation: {x: number; y:number; z:number}
}
interface ModelsState {
   model1: ModelTransform;
   model2: ModelTransform;
}

const COLLECTION = 'Models';

const DEFAULT_STATE: ModelsState = {
  model1: {
    position: { x: 4, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  model2: {
    position: { x: -4, y: 0, z: 4 },
    rotation: { x: 0, y: 0, z: 0 },
  },
};

async function loadModelState(modelId: 'model1' | 'model2') {
try {
    const ref = doc(db, COLLECTION, modelId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return snap.data() as ModelTransform;
    }

    await saveModelState(modelId, DEFAULT_STATE[modelId]);

    return DEFAULT_STATE[modelId];

  } catch (err) {
    console.error('Error loading models', err);
    return DEFAULT_STATE[modelId];
  }
}

async function saveModelState(modelId: 'model1' | 'model2', transform: ModelTransform): Promise<void> {
  try {
    const ref = doc(db, COLLECTION, modelId);

    await setDoc(ref, transform);

  } catch (err) {
    console.error('Greska pri snimanju modela u Firestore:', err);
  }
}

async function loadAllModels(): Promise<ModelsState> {
  const [model1, model2] = await Promise.all([
    loadModelState('model1'),
    loadModelState('model2'),
  ]);

  return {
    model1,
    model2,
  };
}

export { loadAllModels, saveModelState, DEFAULT_STATE };
export type { ModelTransform, ModelsState };