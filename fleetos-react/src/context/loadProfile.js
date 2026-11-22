import { doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../firebase";

async function acceptInvite(user, email) {
  const inviteRef = doc(db, "invites", email);
  const invite = await getDoc(inviteRef);

  if (!invite.exists()) return null;

  const { companyId, role } = invite.data();
  const batch = writeBatch(db);

  batch.set(doc(db, "companies", companyId, "members", user.uid), {
    role,
    email,
    createdAt: serverTimestamp(),
  });
  batch.set(doc(db, "users", user.uid), { companyId, role });
  batch.delete(inviteRef);
  await batch.commit();

  return { companyId, role };
}

export async function loadProfile(user) {
  const memberRef = doc(db, "companies", user.uid, "members", user.uid);
  const own = await getDoc(memberRef);

  if (own.exists()) {
    return { companyId: user.uid, role: own.data().role };
  }

  const link = await getDoc(doc(db, "users", user.uid));

  if (link.exists()) {
    const { companyId } = link.data();
    const member = await getDoc(doc(db, "companies", companyId, "members", user.uid));
    if (member.exists()) return { companyId, role: member.data().role };
    throw new Error("removed");
  }

  if (!user.emailVerified) throw new Error("verify-email");

  const email = (user.email || "").toLowerCase();
  const accepted = email ? await acceptInvite(user, email) : null;
  if (accepted) return accepted;

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
