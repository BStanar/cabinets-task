import { loadAllModels } from "@/lib/firestoreService";

export default async function Home() {
  const  models  =  await loadAllModels();

  return (
    <>
    {JSON.stringify(models)}
    </>
  );
}
