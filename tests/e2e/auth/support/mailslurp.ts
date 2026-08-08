const API_ROOT = "https://api.mailslurp.com";

type MailSlurpInbox = { id: string; emailAddress: string };
type MailSlurpEmail = { subject?: string; body?: string; bodyExcerpt?: string };

async function mailSlurpRequest<T>(apiKey: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_ROOT}${path}`, {
    ...init,
    headers: { "x-api-key": apiKey, ...init?.headers },
  });
  if (!response.ok) throw new Error(`MailSlurp request failed (${response.status})`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function createInbox(apiKey: string, name: string): Promise<MailSlurpInbox> {
  return mailSlurpRequest<MailSlurpInbox>(
    apiKey,
    `/inboxes/withDefaults?name=${encodeURIComponent(name)}&description=${encodeURIComponent("LinkConn auth E2E disposable inbox")}`,
    { method: "POST" }
  );
}

export async function waitForVerificationCode(apiKey: string, inboxId: string): Promise<string> {
  const email = await mailSlurpRequest<MailSlurpEmail>(
    apiKey,
    `/waitForLatestEmail?inboxId=${encodeURIComponent(inboxId)}&timeout=120000&unreadOnly=true`
  );
  const content = `${email.subject || ""}\n${email.bodyExcerpt || ""}\n${email.body || ""}`;
  const match = content.match(/(?:^|\D)(\d{6})(?:\D|$)/);
  if (!match?.[1]) throw new Error("MailSlurp verification email did not contain a 6-digit code.");
  return match[1];
}

export async function deleteInbox(apiKey: string, inboxId: string): Promise<void> {
  await mailSlurpRequest<void>(apiKey, `/inboxes/${encodeURIComponent(inboxId)}`, { method: "DELETE" });
}
