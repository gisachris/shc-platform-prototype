/**
 * Lightweight frontend helper for EmailJS configuration checks.
 *
 * This file is a UI-facing convenience for detecting whether EmailJS is configured in the
 * browser environment. It is kept as a compatibility helper and is connected to the client-side
 * email experience, while the actual sending logic lives on the server.
 */

export const emailService = {
  isConfigured(): boolean {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    return Boolean(serviceId && publicKey && !String(serviceId).includes('your_emailjs'));
  },
};
