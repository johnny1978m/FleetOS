import { doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../firebase";

export async function loadProfile(user) {
  const memberRef = doc(db, "companies", user.uid, "members", user.uid);
  const snapshot = await getDoc(memberRef);

  if (snapshot.exists()) {
    return { companyId: user.uid, role: snapshot.data().role };
  }

  const batch = writeBatch(db);

  batch.set(doc(db, "companies", user.uid), {
    name: "My company",
    ownerUid: user.uid,
    createdAt: serverTimestamp(),
  });
  batch.set(memberRef, {
    role: "admin",
    email: user.email || "",
    createdAt: serverTimestamp(),
  });
  await batch.commit();

  return { companyId: user.uid, role: "admin" };
}
