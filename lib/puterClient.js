// lib/puterClient.jsx
// Put this file in lib/ and import functions like:
// import { initPuter, aiChat, generateImage, uploadFile } from '@/lib/puterClient';

import puter from "puter-sdk";

let _inited = false;

/**
 * Call this once at app startup (client-side) before using other helpers.
 * You can call it in a top-level client component or when the app mounts.
 */
export async function initPuter(opts = {}) {
  if (_inited) return;
  // If puter requires init, do it here. Many puter SDKs auto-init on import.
  // Example: await puter.init({ project: opts.project || 'default' });
  try {
    if (puter.init) {
      await puter.init(opts);
    }
  } catch (e) {
    // ignore if not needed
  }
  _inited = true;
}

/* -------------------------------
   AI helpers
--------------------------------*/
export async function aiChat({ messages, params } = {}) {
  await initPuter();
  // messages can be string or array of role-content objects
  const payload =
    typeof messages === "string"
      ? { messages: [{ role: "user", content: messages }] }
      : { messages };

  // puter.ai.chat likely returns { output, ... }
  const res = await puter.ai.chat(payload);
  // normalize
  return res || { output: res?.text ?? null };
}

export async function generateImage({ prompt, size = "1024x1024" } = {}) {
  await initPuter();
  const res = await puter.ai.txt2img({ prompt, size });
  // many providers return url or buffer; normalize to { url }
  if (res?.imageUrl) return { url: res.imageUrl };
  if (res?.url) return { url: res.url };
  return res;
}

export async function imageToText({ imageUrl } = {}) {
  await initPuter();
  const res = await puter.ai.img2txt({ image: imageUrl });
  return res;
}

export async function textToSpeech({ text, voice = "default" } = {}) {
  await initPuter();
  const res = await puter.ai.txt2speech({ text, voice });
  return res; // may contain URL to audio file
}

/* -------------------------------
   Storage helpers
--------------------------------*/
export async function uploadFile({ path, file }) {
  await initPuter();
  // puter.storage.upload(path, file)
  const r = await puter.storage.upload(path, file);
  // return read URL if available
  try {
    const url = await puter.storage.getReadURL(path);
    return { url, raw: r };
  } catch {
    return { raw: r };
  }
}

export async function getReadURL(path) {
  await initPuter();
  return await puter.storage.getReadURL(path);
}

/* -------------------------------
   Workers
--------------------------------*/
export async function runWorker(scriptOrName, payload = {}) {
  await initPuter();
  // If Puter exposes workers.exec or router exec:
  if (puter.workers?.exec) {
    return await puter.workers.exec({ script: scriptOrName, payload });
  }
  // fallback: if they have router.create/exec patterns
  if (puter.workers?.router?.exec) {
    return await puter.workers.router.exec(scriptOrName, payload);
  }
  throw new Error("Puter workers exec not available in SDK");
}
