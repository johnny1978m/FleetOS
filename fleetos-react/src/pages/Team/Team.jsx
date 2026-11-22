import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/useAuth";
import "./Team.css";

const ROLES = ["admin", "manager", "driver"];

function Team() {
  const { user, companyId, role } = useAuth();
  const isAdmin = role === "admin";
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState("manager");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!companyId) return undefined;
    return onSnapshot(
      collection(db, "companies", companyId, "members"),
      (snap) => setMembers(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
      (err) => console.error("members", err),
    );
  }, [companyId]);

  useEffect(() => {
    if (!companyId || !isAdmin) return undefined;
    return onSnapshot(
      query(collection(db, "invites"), where("companyId", "==", companyId)),
      (snap) => setInvites(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
      (err) => console.error("invites", err),
    );
  }, [companyId, isAdmin]);

  const invite = async (event) => {
    event.preventDefault();
    setError("");
    const address = email.trim().toLowerCase();

    if (!address.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    if (members.some((item) => (item.email || "").toLowerCase() === address)) {
      setError("This person is already in your team.");
      return;
    }

    setBusy(true);

    try {
      await setDoc(doc(db, "invites", address), {
        companyId,
        role: newRole,
        email: address,
        invitedBy: user.uid,
        createdAt: serverTimestamp(),
      });
      setEmail("");
    } catch (err) {
      console.error(err);
      setError("Could not save the invitation. This email may already be invited elsewhere.");
    } finally {
      setBusy(false);
    }
  };

  const changeRole = async (id, nextRole) => {
    setError("");
    try {
      await updateDoc(doc(db, "companies", companyId, "members", id), { role: nextRole });
    } catch (err) {
      console.error(err);
      setError("Could not change the role.");
    }
  };

  const removeMember = async (item) => {
    if (!window.confirm(`Remove ${item.email || "this person"} from the team?`)) return;
    setError("");
    try {
      await deleteDoc(doc(db, "companies", companyId, "members", item.id));
    } catch (err) {
      console.error(err);
      setError("Could not remove this person.");
    }
  };

  const revokeInvite = (id) => deleteDoc(doc(db, "invites", id)).catch((err) => console.error(err));

  return (
    <div className="team-page">
      <p className="team-sub">People who can open this company's fleet data.</p>

      <section className="team-card">
        <h2>Members</h2>
        {members.map((item) => (
          <div className="team-row" key={item.id}>
            <span className="team-email">
              {item.email || item.id}
              {item.id === user.uid && <em> (you)</em>}
            </span>
            {isAdmin && item.id !== user.uid ? (
              <>
                <select value={item.role} onChange={(e) => changeRole(item.id, e.target.value)}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <button type="button" className="team-danger" onClick={() => removeMember(item)}>Remove</button>
              </>
            ) : (
              <span className="team-role">{item.role}</span>
            )}
          </div>
        ))}
      </section>

      {isAdmin ? (
        <>
          <section className="team-card">
            <h2>Invite a colleague</h2>
            <form className="team-form" onSubmit={invite}>
              <input type="email" placeholder="colleague@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <button type="submit" disabled={busy}>Invite</button>
            </form>
            {error && <div className="team-error">{error}</div>}
            <p className="team-hint">
              Then ask them to open the sign-in page, choose "Create account" with this exact email, and verify the email. They will join your company automatically.
            </p>
            <p className="team-hint">Admin: full access and team. Manager: can edit fleet data. Driver: view only.</p>
          </section>

          <section className="team-card">
            <h2>Pending invitations</h2>
            {invites.length === 0 && <p className="team-hint">No pending invitations.</p>}
            {invites.map((item) => (
              <div className="team-row" key={item.id}>
                <span className="team-email">{item.email}</span>
                <span className="team-role">{item.role}</span>
                <button type="button" className="team-danger" onClick={() => revokeInvite(item.id)}>Cancel</button>
              </div>
            ))}
          </section>
        </>
      ) : (
        <p className="team-hint">Only administrators can invite people or change roles.</p>
      )}
    </div>
  );
}

export default Team;
