/* ─────────────────────────────────────────────
   FCNOISE Proyectos — Firebase / Firestore layer
   Proyecto independiente: fcnoise-proyectos
   ───────────────────────────────────────────── */
import { initializeApp }        from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore,
         collection, doc,
         addDoc, setDoc, deleteDoc,
         onSnapshot, query, orderBy,
         serverTimestamp }       from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

/* ── CONFIG — reemplazar con el config de tu proyecto Firebase ── */
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyAMgsbJ2rOqLDofRMl6porBY7yczcJgZTA",
  authDomain:        "fcnoise-proyectos.firebaseapp.com",
  projectId:         "fcnoise-proyectos",
  storageBucket:     "fcnoise-proyectos.firebasestorage.app",
  messagingSenderId: "996777317756",
  appId:             "1:996777317756:web:bdc555f3c288903b07c0f9"
};

/* ── COLECCIONES ── */
const COL_PROJ  = "fcn_projects";
const COL_TASKS = "fcn_tasks";

let db = null;
let _projUnsub  = null;
let _taskUnsub  = null;

/* ── INIT ── */
export function firebaseInit() {
  try {
    if (FIREBASE_CONFIG.apiKey === "PASTE_API_KEY") {
      console.warn("[FCN] Firebase no configurado — usando localStorage");
      return false;
    }
    if (db) return true; // already initialized — idempotent
    const app = initializeApp(FIREBASE_CONFIG, "fcnoise-proyectos");
    db = getFirestore(app);
    console.log("[FCN] Firebase SDK listo ✓");
    return true;
  } catch (e) {
    // App may already exist from a previous init — db is still valid
    console.warn("[FCN] Firebase init:", e.message||e);
    return db !== null;
  }
}

/* ── STOP LISTENERS ── */
export function fbStopListening() {
  if (_projUnsub) { _projUnsub(); _projUnsub = null; }
  if (_taskUnsub) { _taskUnsub(); _taskUnsub = null; }
  console.log("[FCN] Firebase listeners detenidos");
}

/* ── LISTENERS en tiempo real ── */
export function listenProjects(callback) {
  if (!db) return;
  if (_projUnsub) _projUnsub();
  const q = query(collection(db, COL_PROJ), orderBy("createdAt", "asc"));
  _projUnsub = onSnapshot(q, snap => {
    const docs = snap.docs.map(d => ({ ...d.data(), _fbId: d.id }));
    callback(docs);
  });
}

export function listenTasks(callback) {
  if (!db) return;
  if (_taskUnsub) _taskUnsub();
  const q = query(collection(db, COL_TASKS), orderBy("createdAt", "asc"));
  _taskUnsub = onSnapshot(q, snap => {
    const docs = snap.docs.map(d => ({ ...d.data(), _fbId: d.id }));
    callback(docs);
  });
}

/* ── WRITE: Proyectos ── */
export async function fbSaveProject(proj) {
  if (!db) return;
  try {
    const { id, ...data } = proj;
    await setDoc(doc(db, COL_PROJ, id), {
      ...data,
      id,
      createdAt: data.createdAt || serverTimestamp()
    });
  } catch (e) { console.error("[FCN] saveProject:", e); }
}

export async function fbDeleteProject(id) {
  if (!db) return;
  try { await deleteDoc(doc(db, COL_PROJ, id)); }
  catch (e) { console.error("[FCN] deleteProject:", e); }
}

/* ── WRITE: Tareas ── */
export async function fbSaveTask(task) {
  if (!db) return;
  try {
    const { id, ...data } = task;
    await setDoc(doc(db, COL_TASKS, id), {
      ...data,
      id,
      createdAt: data.createdAt || serverTimestamp()
    });
  } catch (e) { console.error("[FCN] saveTask:", e); }
}

export async function fbDeleteTask(id) {
  if (!db) return;
  try { await deleteDoc(doc(db, COL_TASKS, id)); }
  catch (e) { console.error("[FCN] deleteTask:", e); }
}

export const isConnected = () => db !== null;
