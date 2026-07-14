/* ─────────────────────────────────────────────
   FCNOISE Proyectos — Realtime Database layer
   (Migrado de Firestore a Realtime Database porque las reglas de
    Firestore quedaron bloqueadas. RTDB está abierta y funcionando.)
   Mantiene EXACTAMENTE las mismas funciones exportadas que antes,
   así index.html no cambia.
   ───────────────────────────────────────────── */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, set, remove, update,
         onValue, off, serverTimestamp }
         from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { getAuth, signInAnonymously, onAuthStateChanged }
         from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

/* ── CONFIG ── */
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyAMgsbJ2rOqLDofRMl6porBY7yczcJgZTA",
  authDomain:        "fcnoise-proyectos.firebaseapp.com",
  databaseURL:       "https://fcnoise-proyectos-default-rtdb.firebaseio.com",
  projectId:         "fcnoise-proyectos",
  storageBucket:     "fcnoise-proyectos.firebasestorage.app",
  messagingSenderId: "996777317756",
  appId:             "1:996777317756:web:bdc555f3c288903b07c0f9"
};

/* ── PATHS ── */
const P_PROJ     = "fcn_projects";
const P_TASKS    = "fcn_tasks";
const P_EVENTS   = "fcn_events";
const P_PRESENCE = "fcn_presence";
const P_MILES    = "fcn_milestones";
const P_GOODNEWS = "fcn_goodnews";
const P_PULSES   = "fcn_pulses";
const P_PROFILES = "fcn_profiles";
const P_USERS    = "fcn_users";
const P_AREAS    = "fcn_areas";

let db = null;
let auth = null;
let _authReady = null; // Promise que resuelve cuando la sesión anónima está lista (o falló)
const _refs = {}; // path → ref con listener activo

/* ── INIT ── */
export function firebaseInit() {
  try {
    if (db) return true;
    const app = initializeApp(FIREBASE_CONFIG, "fcnoise-proyectos");
    db = getDatabase(app);

    // ── Autenticación ANÓNIMA ──
    // Permite cerrar las reglas de la base ("auth != null") sin romper la app.
    // Si "Anónimo" NO está activado en la consola de Firebase, falla en silencio
    // y la app sigue funcionando con las reglas actuales (nada se rompe ni se pierde).
    try {
      auth = getAuth(app);
      _authReady = new Promise(resolve => {
        let done = false;
        const finish = () => { if (!done) { done = true; resolve(); } };
        onAuthStateChanged(auth, user => { if (user) { console.log("[FCN] Sesión anónima ✓"); finish(); } });
        signInAnonymously(auth).catch(e => {
          console.warn("[FCN] Auth anónima no disponible (actívala en Firebase Console → Authentication → Anonymous):", e.code || e.message || e);
          finish(); // no bloquea: la app sigue con las reglas actuales
        });
        setTimeout(finish, 4000); // salvaguarda: nunca esperar más de 4s
      });
    } catch (e) {
      _authReady = Promise.resolve();
    }

    console.log("[FCN] Realtime Database lista ✓");
    return true;
  } catch (e) {
    console.warn("[FCN] DB init:", e.message || e);
    return db !== null;
  }
}

/* Espera a que la sesión anónima esté lista antes de leer/escribir.
   Resuelve siempre (aunque falle) para no bloquear la app. */
export function ensureAuth() { return _authReady || Promise.resolve(); }

/* ── STOP ALL LISTENERS ── */
export function fbStopListening() {
  Object.keys(_refs).forEach(p => { try { off(_refs[p]); } catch (e) {} delete _refs[p]; });
  console.log("[FCN] listeners detenidos");
}

/* ── Helper: escucha una "colección" y devuelve array ordenado por createdAt ── */
function listenCollection(path, callback, orderKey = "createdAt") {
  if (!db) return;
  if (_refs[path]) { try { off(_refs[path]); } catch (e) {} }
  const r = ref(db, path);
  _refs[path] = r;
  onValue(r, snap => {
    const val = snap.val() || {};
    const arr = Object.values(val).filter(x => x && typeof x === "object");
    arr.sort((a, b) => (a[orderKey] || 0) > (b[orderKey] || 0) ? 1 : -1);
    callback(arr);
  });
}
/* ── Helper: escucha un mapa {id: obj} ── */
function listenMap(path, callback) {
  if (!db) return;
  if (_refs[path]) { try { off(_refs[path]); } catch (e) {} }
  const r = ref(db, path);
  _refs[path] = r;
  onValue(r, snap => callback(snap.val() || {}));
}

/* ── LISTENERS (mismas firmas que la versión Firestore) ── */
export function listenProjects(cb)   { listenCollection(P_PROJ, cb, "createdAt"); }
export function listenTasks(cb)      { listenCollection(P_TASKS, cb, "createdAt"); }
export function listenEvents(cb)     { listenCollection(P_EVENTS, cb, "date"); }
export function listenMilestones(cb) { listenCollection(P_MILES, cb, "monthKey"); }
export function listenGoodnews(cb)   { listenCollection(P_GOODNEWS, cb, "date"); }
export function listenPulses(cb)     { listenCollection(P_PULSES, cb, "createdAt"); }
export function listenPresence(cb)   { listenMap(P_PRESENCE, cb); }
export function listenProfiles(cb)   { listenMap(P_PROFILES, cb); }
export function listenUsers(cb)      { listenMap(P_USERS, cb); }
export function listenAreas(cb)      { listenMap(P_AREAS, cb); }

/* ── Helper de escritura: limpia undefined (RTDB no los acepta) ── */
function clean(obj) {
  const o = {};
  Object.keys(obj).forEach(k => { if (obj[k] !== undefined) o[k] = obj[k]; });
  return o;
}
async function saveDoc(path, id, data) {
  if (!db || !id) return;
  try { await set(ref(db, `${path}/${id}`), clean({ ...data, id })); }
  catch (e) { console.error(`[FCN] save ${path}:`, e); }
}
async function delDoc(path, id) {
  if (!db || !id) return;
  try { await remove(ref(db, `${path}/${id}`)); }
  catch (e) { console.error(`[FCN] del ${path}:`, e); }
}

/* ── WRITES (mismas firmas) ── */
export async function fbSaveProject(p)  { await saveDoc(P_PROJ, p.id, { ...p, createdAt: p.createdAt || Date.now() }); }
export async function fbDeleteProject(id){ await delDoc(P_PROJ, id); }
export async function fbSaveTask(t)     { await saveDoc(P_TASKS, t.id, { ...t, createdAt: t.createdAt || Date.now() }); }
export async function fbDeleteTask(id)  { await delDoc(P_TASKS, id); }
export async function fbSaveEvent(e)    { await saveDoc(P_EVENTS, e.id, { ...e, createdAt: e.createdAt || Date.now() }); }
export async function fbDeleteEvent(id) { await delDoc(P_EVENTS, id); }
export async function fbSaveMilestone(m){ await saveDoc(P_MILES, m.id, m); }
export async function fbDeleteMilestone(id){ await delDoc(P_MILES, id); }
export async function fbSaveGoodnews(g) { await saveDoc(P_GOODNEWS, g.id, g); }
export async function fbDeleteGoodnews(id){ await delDoc(P_GOODNEWS, id); }
export async function fbSavePulse(p)    { await saveDoc(P_PULSES, p.id, { ...p, createdAt: p.createdAt || Date.now() }); }
export async function fbDeletePulse(id) { await delDoc(P_PULSES, id); }
export async function fbSaveUser(u)     { await saveDoc(P_USERS, u.id, u); }
export async function fbSaveArea(a)     { await saveDoc(P_AREAS, a.id, a); }
export async function fbDeleteArea(id)  { await delDoc(P_AREAS, id); }

export async function fbSaveProfile(userId, profile) {
  if (!db || !userId) return;
  try { await update(ref(db, `${P_PROFILES}/${userId}`), clean({ userId, ...profile })); }
  catch (e) { console.error("[FCN] saveProfile:", e); }
}

export async function fbSetPresence(userId, online) {
  if (!db || !userId) return;
  try { await set(ref(db, `${P_PRESENCE}/${userId}`), { userId, online, lastSeen: serverTimestamp() }); }
  catch (e) { console.error("[FCN] presence:", e); }
}

export const isConnected = () => db !== null;
