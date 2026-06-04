/* ─────────────────────────────────────────────
   FCNOISE Proyectos — Firebase / Firestore layer
   Todas las colecciones sincronizadas en tiempo real
   ───────────────────────────────────────────── */
import { initializeApp }        from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore,
         collection, doc,
         setDoc, deleteDoc,
         onSnapshot, query, orderBy,
         serverTimestamp }       from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

/* ── CONFIG ── */
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyAMgsbJ2rOqLDofRMl6porBY7yczcJgZTA",
  authDomain:        "fcnoise-proyectos.firebaseapp.com",
  projectId:         "fcnoise-proyectos",
  storageBucket:     "fcnoise-proyectos.firebasestorage.app",
  messagingSenderId: "996777317756",
  appId:             "1:996777317756:web:bdc555f3c288903b07c0f9"
};

/* ── COLECCIONES ── */
const COL_PROJ       = "fcn_projects";
const COL_TASKS      = "fcn_tasks";
const COL_EVENTS     = "fcn_events";
const COL_PRESENCE   = "fcn_presence";
const COL_MILESTONES = "fcn_milestones";
const COL_GOODNEWS   = "fcn_goodnews";
const COL_PULSES     = "fcn_pulses";
const COL_PROFILES   = "fcn_profiles";

let db = null;
let _projUnsub       = null;
let _taskUnsub       = null;
let _eventsUnsub     = null;
let _presenceUnsub   = null;
let _milestonesUnsub = null;
let _goodnewsUnsub   = null;
let _pulsesUnsub     = null;
let _profilesUnsub   = null;

/* ── INIT ── */
export function firebaseInit() {
  try {
    if (FIREBASE_CONFIG.apiKey === "PASTE_API_KEY") {
      console.warn("[FCN] Firebase no configurado");
      return false;
    }
    if (db) return true;
    const app = initializeApp(FIREBASE_CONFIG, "fcnoise-proyectos");
    db = getFirestore(app);
    console.log("[FCN] Firebase SDK listo ✓");
    return true;
  } catch (e) {
    console.warn("[FCN] Firebase init:", e.message || e);
    return db !== null;
  }
}

/* ── STOP ALL LISTENERS ── */
export function fbStopListening() {
  [_projUnsub, _taskUnsub, _eventsUnsub, _presenceUnsub,
   _milestonesUnsub, _goodnewsUnsub, _pulsesUnsub, _profilesUnsub].forEach(fn => fn && fn());
  _projUnsub = _taskUnsub = _eventsUnsub = _presenceUnsub =
  _milestonesUnsub = _goodnewsUnsub = _pulsesUnsub = _profilesUnsub = null;
  console.log("[FCN] Firebase listeners detenidos");
}

/* ─────────────────────────────────────────────
   LISTENERS — tiempo real
   ───────────────────────────────────────────── */
export function listenProjects(callback) {
  if (!db) return;
  if (_projUnsub) _projUnsub();
  const q = query(collection(db, COL_PROJ), orderBy("createdAt", "asc"));
  _projUnsub = onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ ...d.data(), _fbId: d.id })));
  });
}

export function listenTasks(callback) {
  if (!db) return;
  if (_taskUnsub) _taskUnsub();
  const q = query(collection(db, COL_TASKS), orderBy("createdAt", "asc"));
  _taskUnsub = onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ ...d.data(), _fbId: d.id })));
  });
}

export function listenEvents(callback) {
  if (!db) return;
  if (_eventsUnsub) _eventsUnsub();
  const q = query(collection(db, COL_EVENTS), orderBy("date", "asc"));
  _eventsUnsub = onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ ...d.data(), _fbId: d.id })));
  });
}

export function listenPresence(callback) {
  if (!db) return;
  if (_presenceUnsub) _presenceUnsub();
  _presenceUnsub = onSnapshot(collection(db, COL_PRESENCE), snap => {
    const data = {};
    snap.docs.forEach(d => { data[d.id] = d.data(); });
    callback(data);
  });
}

export function listenMilestones(callback) {
  if (!db) return;
  if (_milestonesUnsub) _milestonesUnsub();
  const q = query(collection(db, COL_MILESTONES), orderBy("monthKey", "asc"));
  _milestonesUnsub = onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ ...d.data(), _fbId: d.id })));
  });
}

export function listenGoodnews(callback) {
  if (!db) return;
  if (_goodnewsUnsub) _goodnewsUnsub();
  const q = query(collection(db, COL_GOODNEWS), orderBy("date", "asc"));
  _goodnewsUnsub = onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ ...d.data(), _fbId: d.id })));
  });
}

export function listenPulses(callback) {
  if (!db) return;
  if (_pulsesUnsub) _pulsesUnsub();
  const q = query(collection(db, COL_PULSES), orderBy("createdAt", "asc"));
  _pulsesUnsub = onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ ...d.data(), _fbId: d.id })));
  });
}

export function listenProfiles(callback) {
  if (!db) return;
  if (_profilesUnsub) _profilesUnsub();
  _profilesUnsub = onSnapshot(collection(db, COL_PROFILES), snap => {
    const data = {};
    snap.docs.forEach(d => { data[d.id] = d.data(); });
    callback(data);
  });
}

/* ── WRITE — Perfiles (nombre + foto compartidos) ── */
export async function fbSaveProfile(userId, profile) {
  if (!db) return;
  try { await setDoc(doc(db, COL_PROFILES, userId), { userId, ...profile }, { merge: true }); }
  catch (e) { console.error("[FCN] saveProfile:", e); }
}

/* ─────────────────────────────────────────────
   WRITE — Proyectos
   ───────────────────────────────────────────── */
export async function fbSaveProject(proj) {
  if (!db) return;
  try {
    const { id, ...data } = proj;
    await setDoc(doc(db, COL_PROJ, id), { ...data, id, createdAt: data.createdAt || serverTimestamp() });
  } catch (e) { console.error("[FCN] saveProject:", e); }
}
export async function fbDeleteProject(id) {
  if (!db) return;
  try { await deleteDoc(doc(db, COL_PROJ, id)); }
  catch (e) { console.error("[FCN] deleteProject:", e); }
}

/* ─────────────────────────────────────────────
   WRITE — Tareas
   ───────────────────────────────────────────── */
export async function fbSaveTask(task) {
  if (!db) return;
  try {
    const { id, ...data } = task;
    await setDoc(doc(db, COL_TASKS, id), { ...data, id, createdAt: data.createdAt || serverTimestamp() });
  } catch (e) { console.error("[FCN] saveTask:", e); }
}
export async function fbDeleteTask(id) {
  if (!db) return;
  try { await deleteDoc(doc(db, COL_TASKS, id)); }
  catch (e) { console.error("[FCN] deleteTask:", e); }
}

/* ─────────────────────────────────────────────
   WRITE — Eventos
   ───────────────────────────────────────────── */
export async function fbSaveEvent(event) {
  if (!db) return;
  try {
    const { id, ...data } = event;
    await setDoc(doc(db, COL_EVENTS, id), { ...data, id, createdAt: data.createdAt || serverTimestamp() });
  } catch (e) { console.error("[FCN] saveEvent:", e); }
}
export async function fbDeleteEvent(id) {
  if (!db) return;
  try { await deleteDoc(doc(db, COL_EVENTS, id)); }
  catch (e) { console.error("[FCN] deleteEvent:", e); }
}

/* ─────────────────────────────────────────────
   WRITE — Milestones (calendario anual)
   ───────────────────────────────────────────── */
export async function fbSaveMilestone(ms) {
  if (!db) return;
  try {
    const { id, ...data } = ms;
    await setDoc(doc(db, COL_MILESTONES, id), { ...data, id });
  } catch (e) { console.error("[FCN] saveMilestone:", e); }
}
export async function fbDeleteMilestone(id) {
  if (!db) return;
  try { await deleteDoc(doc(db, COL_MILESTONES, id)); }
  catch (e) { console.error("[FCN] deleteMilestone:", e); }
}

/* ─────────────────────────────────────────────
   WRITE — Good News
   ───────────────────────────────────────────── */
export async function fbSaveGoodnews(gn) {
  if (!db) return;
  try {
    const { id, ...data } = gn;
    await setDoc(doc(db, COL_GOODNEWS, id), { ...data, id });
  } catch (e) { console.error("[FCN] saveGoodnews:", e); }
}
export async function fbDeleteGoodnews(id) {
  if (!db) return;
  try { await deleteDoc(doc(db, COL_GOODNEWS, id)); }
  catch (e) { console.error("[FCN] deleteGoodnews:", e); }
}

/* ─────────────────────────────────────────────
   WRITE — Pulses
   ───────────────────────────────────────────── */
export async function fbSavePulse(pulse) {
  if (!db) return;
  try {
    const { id, ...data } = pulse;
    await setDoc(doc(db, COL_PULSES, id), { ...data, id, createdAt: data.createdAt || serverTimestamp() });
  } catch (e) { console.error("[FCN] savePulse:", e); }
}
export async function fbDeletePulse(id) {
  if (!db) return;
  try { await deleteDoc(doc(db, COL_PULSES, id)); }
  catch (e) { console.error("[FCN] deletePulse:", e); }
}

/* ─────────────────────────────────────────────
   WRITE — Presence
   ───────────────────────────────────────────── */
export async function fbSetPresence(userId, online) {
  if (!db) return;
  try {
    await setDoc(doc(db, COL_PRESENCE, userId), { userId, online, lastSeen: serverTimestamp() });
  } catch (e) { console.error("[FCN] presence:", e); }
}

export const isConnected = () => db !== null;
