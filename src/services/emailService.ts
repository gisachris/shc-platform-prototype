import emailjs from '@emailjs/browser';

interface SendWelcomeEmailParams {
  to_name: string;
  to_email: string;
  role: string;
}

interface SendPasswordResetEmailParams {
  to_name: string;
  to_email: string;
  reset_link?: string;
  reset_token?: string;
}

export const emailService = {
  isConfigured(): boolean {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    return Boolean(serviceId && publicKey && !serviceId.includes('your_emailjs'));
  },

  async sendAccountConfirmation({ to_name, to_email, role }: SendWelcomeEmailParams): Promise<{ success: boolean; message: string }> {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_WELCOME;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey || serviceId.includes('your_emailjs')) {
      console.warn('EmailJS environment variables not yet configured. Skipping confirmation email.');
      return {
        success: true,
        message: 'Account created. Email confirmation is not configured on this deployment.'
      };
    }

    try {
      const response = await emailjs.send(
        serviceId,
        templateId,
        {
          to_name,
          to_email,
          role,
          app_name: 'Smart Hybrid Conference (SHC)',
          site_url: window.location.origin,
        },
        publicKey
      );

      return {
        success: true,
        message: `Account confirmation email sent successfully to ${to_email} (Status ${response.status})`
      };
    } catch (error: any) {
      console.error('EmailJS confirmation error:', error);
      throw new Error(error?.text || error?.message || 'Failed to send confirmation email via EmailJS');
    }
  },

  async sendPasswordReset({ to_name, to_email, reset_link, reset_token }: SendPasswordResetEmailParams): Promise<{ success: boolean; message: string }> {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_RESET;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const actualResetLink = reset_link || `${window.location.origin}/reset-password?token=${reset_token || 'pending-reset'}`;

    if (!serviceId || !templateId || !publicKey || serviceId.includes('your_emailjs')) {
      console.warn('EmailJS environment variables not yet configured. Skipping password reset email.');
      return {
        success: true,
        message: 'Password reset email is not configured. Contact an organizer for help.'
      };
    }

    try {
      const response = await emailjs.send(
        serviceId,
        templateId,
        {
          to_name,
          to_email,
          reset_link: actualResetLink,
          reset_token: reset_token || 'pending',
          app_name: 'Smart Hybrid Conference (SHC)',
          site_url: window.location.origin,
        },
        publicKey
      );

      return {
        success: true,
        message: `Password reset email sent successfully to ${to_email} (Status ${response.status})`
      };
    } catch (error: any) {
      console.error('EmailJS password reset error:', error);
      throw new Error(error?.text || error?.message || 'Failed to send password reset email via EmailJS');
    }
  }
};
