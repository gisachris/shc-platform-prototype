/**
 * @deprecated Prefer server-side EmailJS via /api/auth/register and /api/auth/forgot-password.
 * Kept only for isConfigured() checks in the UI if needed.
 */
export const emailService = {
  isConfigured(): boolean {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    return Boolean(serviceId && publicKey && !String(serviceId).includes('your_emailjs'));
  },
};
