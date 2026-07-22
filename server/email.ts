import { config } from './config';

function emailjsEnv() {
  return {
    serviceId: process.env.EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID || '',
    publicKey: process.env.EMAILJS_PUBLIC_KEY || process.env.VITE_EMAILJS_PUBLIC_KEY || '',
    privateKey: process.env.EMAILJS_PRIVATE_KEY || '',
    welcomeTemplate:
      process.env.EMAILJS_TEMPLATE_ID_WELCOME || process.env.VITE_EMAILJS_TEMPLATE_ID_WELCOME || '',
    resetTemplate:
      process.env.EMAILJS_TEMPLATE_ID_RESET || process.env.VITE_EMAILJS_TEMPLATE_ID_RESET || '',
  };
}

export function emailjsConfigured(kind: 'welcome' | 'reset' | 'any' = 'any'): boolean {
  const e = emailjsEnv();
  if (!e.serviceId || !e.publicKey || e.serviceId.includes('your_emailjs')) return false;
  if (kind === 'welcome') return Boolean(e.welcomeTemplate);
  if (kind === 'reset') return Boolean(e.resetTemplate);
  return Boolean(e.welcomeTemplate || e.resetTemplate);
}

async function sendEmailjs(templateId: string, params: Record<string, string>) {
  const e = emailjsEnv();
  if (!e.serviceId || !e.publicKey || !templateId) {
    return { ok: false as const, error: 'EmailJS is not configured on the server.' };
  }

  const body: Record<string, unknown> = {
    service_id: e.serviceId,
    template_id: templateId,
    user_id: e.publicKey,
    template_params: params,
  };
  if (e.privateKey) body.accessToken = e.privateKey;

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return { ok: false as const, error: text || `EmailJS HTTP ${res.status}` };
  }
  return { ok: true as const };
}

export async function sendWelcomeEmail(params: {
  to_name: string;
  to_email: string;
  role: string;
}) {
  const e = emailjsEnv();
  return sendEmailjs(e.welcomeTemplate, {
    ...params,
    app_name: 'Smart Hybrid Conference (SHC)',
    site_url: config.appUrl,
  });
}

export async function sendResetEmail(params: {
  to_name: string;
  to_email: string;
  reset_link: string;
  reset_token: string;
}) {
  const e = emailjsEnv();
  return sendEmailjs(e.resetTemplate, {
    ...params,
    app_name: 'Smart Hybrid Conference (SHC)',
    site_url: config.appUrl,
  });
}
