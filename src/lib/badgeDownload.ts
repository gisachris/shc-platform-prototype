/**
 * Browser download helper for rendered conference badges.
 *
 * This captures the shared badge element as a PNG so delegates and organizers use the same
 * downloadable output.
 */

import { toPng } from 'html-to-image';

export async function downloadBadgeAsPng(badgeId: string, ticketId: string): Promise<void> {
  const badge = document.getElementById(badgeId);
  if (!badge) {
    throw new Error('Badge preview is not available yet.');
  }

  if (badge.dataset.qrReady !== 'true') {
    throw new Error('Badge QR code is still being generated. Please try again.');
  }

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const dataUrl = await toPng(badge, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#ffffff',
  });
  const link = document.createElement('a');
  link.download = `shc-badge-${ticketId || 'preview'}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
