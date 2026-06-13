// lib/puterClient.js

let puter = null;
let _inited = false;

/* -------------------------------
   Load SDK
--------------------------------*/
async function loadPuterSDK() {
  if (typeof window === "undefined") throw new Error("Must run client-side");

  if (!window.puter) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");

      script.src = "https://js.puter.com/v2/";
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Failed to load Puter SDK"));
      document.head.appendChild(script);
    });
  }

  if (!window.puter) throw new Error("Puter SDK not available after load");

  return window.puter;
}

/* -------------------------------
   Init + Authorization
--------------------------------*/
export async function initPuter() {
  if (_inited) return;
  if (typeof window === "undefined") return;

  puter = await loadPuterSDK();

  try {
    await puter.init({ appId: "linkonnews" });

    // Must authorize for fs & ai to work
    await puter.authorize({
      permissions: [
        "fs.read",
        "fs.write",
        "fs.delete",
        "ai.chat",
        "ai.txt2img",
        "ai.img2txt",
        "ai.txt2speech",
      ],
    });

    console.log("✅ Puter ready with fs + ai access");
  } catch (err) {
    console.error("❌ Puter init failed:", err.message);
  }

  _inited = true;
}

/* -------------------------------
   AI Features
--------------------------------*/
export async function aiChat({ messages, systemPrompt } = {}) {
  await initPuter();
  if (!puter?.ai?.chat) throw new Error("AI chat not supported");

  const payload = Array.isArray(messages)
    ? { messages }
    : { messages: [{ role: "user", content: messages }] };

  if (systemPrompt)
    payload.messages.unshift({ role: "system", content: systemPrompt });

  const res = await puter.ai.chat(payload);

  const text =
    typeof res === "string" ? res : (res?.output ?? res?.text ?? null);

  return { output: text, raw: res };
}

export async function generateImage({ prompt, size = "1024x1024" } = {}) {
  await initPuter();
  if (!puter?.ai?.txt2img) throw new Error("AI image generation not supported");

  const res = await puter.ai.txt2img({ prompt, size });

  const url =
    res?.imageUrl || res?.url || (typeof res === "string" ? res : null);

  return { url, raw: res };
}

export async function imageToText({ imageUrl }) {
  await initPuter();
  if (!puter?.ai?.img2txt) throw new Error("AI OCR not supported");

  const res = await puter.ai.img2txt({ image: imageUrl });

  return res?.text || res;
}

export async function textToSpeech({ text, voice = "default" }) {
  await initPuter();
  if (!puter?.ai?.txt2speech)
    throw new Error("AI text-to-speech not supported");

  const res = await puter.ai.txt2speech({ text, voice });

  return res?.audioUrl || res?.url || res;
}

/* -------------------------------
   Cloud Storage (Puter v2)
--------------------------------*/
export async function uploadFile({ path = "/uploads", file }) {
  await initPuter();
  const dir = path.split("/").slice(0, -1).join("/") || "/";
  const dest = path;

  // Try filesystem API (Puter fs)
  if (puter?.fs?.upload) {
    try {
      try {
        await puter.fs.mkdir(dir, { recursive: true });
      } catch (_) {}
      console.log("⬆️ Uploading via fs:", dest);
      const uploaded = await puter.fs.upload(file, dest);
      const share = await puter.fs.share(dest);
      const url = share?.url || uploaded?.path;

      console.log("✅ Uploaded via fs:", url);

      return { url, raw: uploaded };
    } catch (err) {
      console.warn("fs.upload failed, trying storage fallback:", err.message);
    }
  }

  // Fallback to storage API
  if (puter?.storage?.upload) {
    console.log("⬆️ Uploading via storage:", dest);
    const r = await puter.storage.upload(path, file);

    try {
      const url = await puter.storage.getReadURL(path);

      console.log("✅ Uploaded via storage:", url);

      return { url, raw: r };
    } catch {
      return { raw: r };
    }
  }

  throw new Error("Puter upload API not available");
}

export async function getReadURL(path) {
  await initPuter();
  if (puter?.storage?.getReadURL) {
    return await puter.storage.getReadURL(path);
  }
  if (puter?.fs?.share) {
    const share = await puter.fs.share(path);

    return share?.url || path;
  }

  return path;
}

export async function listFiles(dir = "/uploads") {
  await initPuter();
  if (!puter?.fs?.readdir) throw new Error("List not supported");

  return await puter.fs.readdir(dir);
}

export async function deleteFile(path) {
  await initPuter();
  if (!puter?.fs?.delete) throw new Error("Delete not supported");

  return await puter.fs.delete(path);
}

export async function readFile(path) {
  await initPuter();
  if (!puter?.fs?.read) throw new Error("Read not supported");

  return await puter.fs.read(path);
}

export async function writeFile(path, data) {
  await initPuter();
  if (!puter?.fs?.write) throw new Error("Write not supported");

  return await puter.fs.write(path, data);
}

/* -------------------------------
   Workers (auto fallback)
--------------------------------*/
export async function runWorker(scriptOrName, payload = {}) {
  await initPuter();

  if (puter?.workers?.exec) {
    try {
      return await puter.workers.exec({ script: scriptOrName, payload });
    } catch (err) {
      console.warn("SDK worker exec failed:", err.message);
    }
  }

  // fallback: if they have router.create/exec patterns
  if (puter?.workers?.router?.exec) {
    try {
      return await puter.workers.router.exec(scriptOrName, payload);
    } catch (err) {
      console.warn("Router exec failed, trying local fallback:", err.message);
    }
  }

  console.warn("Using local fallback worker:", scriptOrName);
  try {
    const importedModule = await import(`@/puter/${scriptOrName}.js`);
    const fn =
      importedModule.default ||
      importedModule[scriptOrName] ||
      Object.values(importedModule)[0];

    if (typeof fn !== "function")
      throw new Error(`No valid function export in ${scriptOrName}.js`);

    return await fn(payload);
  } catch (err) {
    console.error("Worker fallback failed:", err.message);

    return { error: err.message };
  }
}
