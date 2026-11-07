import { firebaseConfig } from "./firebase-config.js";

const FIREBASE_VERSION = "11.10.0";
const LOCAL_KEY = "haru-diary:v1";
const MOODS = [
  { id: "great", emoji: "😄", label: "아주 좋음" },
  { id: "good", emoji: "🙂", label: "좋음" },
  { id: "calm", emoji: "😌", label: "평온" },
  { id: "tired", emoji: "😪", label: "피곤" },
  { id: "sad", emoji: "😢", label: "슬픔" },
  { id: "angry", emoji: "😠", label: "화남" }
];
const MOOD_IDS = MOODS.map((m) => m.id);

const $ = (id) => document.getElementById(id);
const ui = {
  form: $("form"), date: $("date"), title: $("title"), body: $("body"), moods: $("moods"),
  count: $("count"), btnNew: $("new"), btnDelete: $("delete"), entries: $("entries"),
  none: $("none"), total: $("total"), search: $("search"), mode: $("mode"),
  login: $("login"), logout: $("logout"), banner: $("banner"), toast: $("toast")
};

let store = null;
let entries = [];
let editingId = null;
let selectedMood = "good";

/* ---------- 유틸 ---------- */
function today() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
function newId() {
  return (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)).replace(/-/g, "");
}
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
let toastTimer;
function toast(msg) {
  ui.toast.textContent = msg;
  ui.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.remove("show"), 2200);
}
function clean(entry) {
  return {
    id: String(entry.id),
    date: /^\d{4}-\d{2}-\d{2}$/.test(entry.date) ? entry.date : today(),
    mood: MOOD_IDS.includes(entry.mood) ? entry.mood : "good",
    title: String(entry.title || "").slice(0, 100),
    body: String(entry.body || "").slice(0, 10000),
    createdAt: Number(entry.createdAt) || Date.now(),
    updatedAt: Number(entry.updatedAt) || Date.now()
  };
}

/* ---------- 저장소: 이 기기(localStorage) ---------- */
const localStore = {
  kind: "local",
  read() {
    try {
      const raw = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
      return Array.isArray(raw) ? raw.map(clean) : [];
    } catch { return []; }
  },
  write(list) {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(list)); return true; }
    catch { toast("이 브라우저에서는 저장할 수 없어요 (개인정보 보호 모드?)"); return false; }
  },
  async list() { return this.read(); },
  async save(entry) {
    const list = this.read().filter((e) => e.id !== entry.id);
    list.push(entry);
    this.write(list);
  },
  async remove(id) { this.write(this.read().filter((e) => e.id !== id)); },
  clear() { try { localStorage.removeItem(LOCAL_KEY); } catch { /* 무시 */ } }
};

/* ---------- 저장소: Firebase(Firestore) ---------- */
async function createCloudStore(fs, db, uid) {
  const col = fs.collection(db, "users", uid, "entries");
  return {
    kind: "cloud",
    async list() {
      const snap = await fs.getDocs(fs.query(col, fs.orderBy("date", "desc")));
      return snap.docs.map((d) => clean({ id: d.id, ...d.data() }));
    },
    async save(entry) {
      const { id, ...data } = entry;
      await fs.setDoc(fs.doc(col, id), data);
    },
    async remove(id) { await fs.deleteDoc(fs.doc(col, id)); }
  };
}

/* ---------- 화면 ---------- */
function renderMoods() {
  ui.moods.replaceChildren(...MOODS.map((m) => {
    const b = el("button", "mood", m.emoji);
    b.type = "button";
    b.title = m.label;
    b.setAttribute("aria-label", m.label);
    b.setAttribute("aria-pressed", String(m.id === selectedMood));
    b.addEventListener("click", () => { selectedMood = m.id; renderMoods(); });
    return b;
  }));
}

function updateCount() { ui.count.textContent = `${ui.body.value.length} / 10000`; }

function resetForm() {
  editingId = null;
  ui.date.value = today();
  ui.title.value = "";
  ui.body.value = "";
  selectedMood = "good";
  ui.btnDelete.hidden = true;
  renderMoods();
  updateCount();
  renderList();
}

function loadIntoForm(entry) {
  editingId = entry.id;
  ui.date.value = entry.date;
  ui.title.value = entry.title;
  ui.body.value = entry.body;
  selectedMood = entry.mood;
  ui.btnDelete.hidden = false;
  renderMoods();
  updateCount();
  renderList();
  ui.body.focus();
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const day = "일월화수목금토"[new Date(y, m - 1, d).getDay()];
  return `${m}월 ${d}일 (${day})`;
}

function renderList() {
  const term = ui.search.value.trim().toLowerCase();
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt - a.updatedAt);
  const shown = term ? sorted.filter((e) => (e.title + " " + e.body).toLowerCase().includes(term)) : sorted;
  ui.total.textContent = entries.length ? `${entries.length}편` : "";
  ui.none.hidden = entries.length !== 0;

  const nodes = [];
  let month = "";
  for (const e of shown) {
    const m = e.date.slice(0, 7);
    if (m !== month) {
      month = m;
      nodes.push(el("h3", "month", `${m.slice(0, 4)}년 ${Number(m.slice(5))}월`));
    }
    const mood = MOODS.find((x) => x.id === e.mood) || MOODS[1];
    const item = el("button", "entry" + (e.id === editingId ? " active" : ""));
    item.type = "button";
    item.appendChild(el("span", "entry-mood", mood.emoji));
    const text = el("span", "entry-text");
    text.appendChild(el("span", "entry-date", formatDate(e.date)));
    text.appendChild(el("span", "entry-title", e.title || e.body.split("\n")[0].slice(0, 40) || "(제목 없음)"));
    item.appendChild(text);
    item.addEventListener("click", () => loadIntoForm(e));
    nodes.push(item);
  }
  if (term && shown.length === 0) nodes.push(el("p", "none", "검색 결과가 없어요."));
  ui.entries.replaceChildren(...nodes);
}

async function refresh() {
  try {
    entries = await store.list();
  } catch (err) {
    console.error(err);
    toast("일기를 불러오지 못했어요.");
    entries = [];
  }
  renderList();
}

/* ---------- 이벤트 ---------- */
ui.form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  if (!ui.body.value.trim()) { toast("내용을 적어 주세요."); return; }
  const prev = entries.find((e) => e.id === editingId);
  const entry = clean({
    id: editingId || newId(),
    date: ui.date.value,
    mood: selectedMood,
    title: ui.title.value.trim(),
    body: ui.body.value,
    createdAt: prev ? prev.createdAt : Date.now(),
    updatedAt: Date.now()
  });
  try {
    await store.save(entry);
    editingId = entry.id;
    ui.btnDelete.hidden = false;
    await refresh();
    toast("저장했어요 ✍️");
  } catch (err) {
    console.error(err);
    toast("저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
});

ui.btnNew.addEventListener("click", resetForm);
ui.btnDelete.addEventListener("click", async () => {
  if (!editingId || !confirm("이 일기를 삭제할까요? 되돌릴 수 없어요.")) return;
  try {
    await store.remove(editingId);
    await refresh();
    resetForm();
    toast("삭제했어요.");
  } catch (err) {
    console.error(err);
    toast("삭제하지 못했어요.");
  }
});
ui.body.addEventListener("input", updateCount);
ui.search.addEventListener("input", renderList);

/* ---------- 이 기기 일기를 계정으로 옮기기 ---------- */
function offerMigration() {
  const local = localStore.read();
  if (!local.length || store.kind !== "cloud") { ui.banner.hidden = true; return; }
  ui.banner.replaceChildren(
    el("span", null, `이 기기에만 저장된 일기 ${local.length}편이 있어요. 내 계정으로 옮길까요?`)
  );
  const yes = el("button", "btn btn-primary", "계정으로 옮기기");
  yes.type = "button";
  yes.addEventListener("click", async () => {
    yes.disabled = true;
    try {
      for (const e of local) await store.save(clean(e));
      localStore.clear();
      ui.banner.hidden = true;
      await refresh();
      toast(`${local.length}편을 옮겼어요.`);
    } catch (err) {
      console.error(err);
      yes.disabled = false;
      toast("옮기지 못했어요.");
    }
  });
  ui.banner.appendChild(yes);
  ui.banner.hidden = false;
}

/* ---------- Firebase 연결 ---------- */
async function setupFirebase() {
  if (!firebaseConfig || !firebaseConfig.apiKey) {
    ui.mode.textContent = "이 기기에 저장 중 (로그인 기능 준비 중)";
    return;
  }
  const base = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
  const [{ initializeApp }, auth, fs] = await Promise.all([
    import(`${base}/firebase-app.js`),
    import(`${base}/firebase-auth.js`),
    import(`${base}/firebase-firestore.js`)
  ]);
  const app = initializeApp(firebaseConfig);
  const a = auth.getAuth(app);
  const db = fs.getFirestore(app);
  const provider = new auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  ui.login.hidden = false;
  ui.login.addEventListener("click", async () => {
    try { await auth.signInWithPopup(a, provider); }
    catch (err) {
      if (err && err.code === "auth/popup-blocked") await auth.signInWithRedirect(a, provider);
      else if (!(err && err.code === "auth/popup-closed-by-user")) { console.error(err); toast("로그인하지 못했어요."); }
    }
  });
  ui.logout.addEventListener("click", () => auth.signOut(a));

  auth.onAuthStateChanged(a, async (user) => {
    if (user) {
      store = await createCloudStore(fs, db, user.uid);
      ui.mode.textContent = `☁️ ${user.displayName || "내 계정"}에 저장 중`;
      ui.login.hidden = true;
      ui.logout.hidden = false;
    } else {
      store = localStore;
      ui.mode.textContent = "이 기기에 저장 중";
      ui.login.hidden = false;
      ui.logout.hidden = true;
    }
    resetForm();
    await refresh();
    offerMigration();
  });
}

/* ---------- 시작 ---------- */
store = localStore;
resetForm();
refresh();
setupFirebase().catch((err) => {
  console.error(err);
  ui.mode.textContent = "이 기기에 저장 중 (로그인 서버에 연결하지 못함)";
});
