import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export function useCollection(companyId, name) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!companyId) return undefined;

    return onSnapshot(
      collection(db, "companies", companyId, name),
      (snapshot) => setItems(snapshot.docs.map((item) => item.data())),
      (error) => console.error(name, error),
    );
  }, [companyId, name]);

  const save = (item) =>
    setDoc(doc(db, "companies", companyId, name, String(item.id)), item);
  const remove = (id) =>
    deleteDoc(doc(db, "companies", companyId, name, String(id)));

  return [items, save, remove];
}
