/** Local drafts for Kit Papers tools (IndexedDB + file download/upload). */

const DB_NAME = "kit-papers";
const DB_VERSION = 1;
const STORE = "drafts";

export type PapersKind = "skriv" | "ark" | "dias";

export type PapersDraftMeta = {
  id: string;
  kind: PapersKind;
  title: string;
  updatedAt: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("kind", "kind", { unique: false });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB tx failed"));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB tx aborted"));
  });
}

export async function savePapersDraft<T>(
  kind: PapersKind,
  id: string,
  title: string,
  payload: T,
): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({
      id,
      kind,
      title,
      updatedAt: Date.now(),
      payload,
    });
    await txDone(tx);
  } finally {
    db.close();
  }
}

export async function loadPapersDraft<T>(
  id: string,
): Promise<{ meta: PapersDraftMeta; payload: T } | null> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    const row = await new Promise<
      | { id: string; kind: PapersKind; title: string; updatedAt: number; payload: T }
      | undefined
    >((resolve, reject) => {
      req.onsuccess = () => resolve(req.result as typeof row);
      req.onerror = () => reject(req.error ?? new Error("IndexedDB get failed"));
    });
    await txDone(tx);
    if (!row) return null;
    return {
      meta: {
        id: row.id,
        kind: row.kind,
        title: row.title,
        updatedAt: row.updatedAt,
      },
      payload: row.payload,
    };
  } finally {
    db.close();
  }
}

export async function listPapersDrafts(
  kind: PapersKind,
): Promise<PapersDraftMeta[]> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readonly");
    const index = tx.objectStore(STORE).index("kind");
    const req = index.getAll(kind);
    const rows = await new Promise<
      Array<{ id: string; kind: PapersKind; title: string; updatedAt: number }>
    >((resolve, reject) => {
      req.onsuccess = () => resolve((req.result as typeof rows) ?? []);
      req.onerror = () => reject(req.error ?? new Error("IndexedDB list failed"));
    });
    await txDone(tx);
    return rows
      .map((r) => ({
        id: r.id,
        kind: r.kind,
        title: r.title,
        updatedAt: r.updatedAt,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } finally {
    db.close();
  }
}

export async function deletePapersDraft(id: string): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    await txDone(tx);
  } finally {
    db.close();
  }
}

export function downloadJsonFile(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2500);
}

export function downloadTextFile(
  filename: string,
  text: string,
  mime = "text/plain;charset=utf-8",
) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2500);
}

export function newDraftId(kind: PapersKind): string {
  return `${kind}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function readJsonFile<T>(file: File): Promise<T> {
  const text = await file.text();
  return JSON.parse(text) as T;
}
