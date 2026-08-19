/**
 * Reusable conference badge renderer.
 *
 * This component presents the same delegate pass on screen and in print. It generates a real QR
 * image from the attendee payload so registration, reprinting, and check-in use one badge format.
 */

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode } from 'lucide-react';
import { Conference } from '../shared/types';

interface DigitalBadgeProps {
  conference?: Conference | null;
  fullName: string;
  jobTitle: string;
  company: string;
  ticketId: string;
  qrCodeData: string;
  passLabel: string;
  passColor: string;
  interests?: string[];
  compact?: boolean;
}

export const DigitalBadge: React.FC<DigitalBadgeProps> = ({
  conference,
  fullName,
  jobTitle,
  company,
  ticketId,
  qrCodeData,
  passLabel,
  passColor,
  interests = [],
  compact = false,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    let isMounted = true;
    const payload = qrCodeData || ticketId || 'SHC-PASS-PREVIEW';

    QRCode.toDataURL(payload, {
      width: compact ? 160 : 220,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0f172a', light: '#ffffff' },
    }).then((url) => {
      if (isMounted) setQrCodeUrl(url);
    }).catch(() => {
      if (isMounted) setQrCodeUrl('');
    });

    return () => {
      isMounted = false;
    };
  }, [compact, qrCodeData, ticketId]);

  return (
    <div className={`badge-print-area bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-md space-y-6 relative overflow-hidden ${compact ? 'max-w-sm' : ''}`}>
      <div className="w-16 h-3 bg-gray-200 rounded-full mx-auto border border-gray-300 shadow-inner print:hidden"></div>

      <div className="flex items-center justify-between border-b border-gray-200 pb-4 gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">
            {conference?.title || 'SHC Rwanda Conference'}
          </div>
          <div className="text-xs font-black text-slate-900 uppercase">{passLabel}</div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-black uppercase text-white shadow-xs shrink-0 ${passColor}`}>
          {passLabel}
        </div>
      </div>

      <div className="space-y-1 text-center py-2">
        <h4 className="text-2xl font-black text-slate-900 tracking-tight break-words">{fullName || 'Your Name'}</h4>
        <p className="text-sm font-bold text-blue-600 break-words">{jobTitle || 'Software Engineer'}</p>
        <p className="text-xs font-medium text-slate-500 break-words">{company || 'Organization'}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-1.5 py-1">
        {interests.length > 0 ? interests.slice(0, 3).map((tag) => (
          <span key={tag} className="text-[10px] font-semibold text-slate-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
            {tag}
          </span>
        )) : (
          <span className="text-[10px] text-slate-400 italic">Select topics above</span>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-2xl w-44 h-44 mx-auto flex flex-col items-center justify-center border-2 border-gray-200 shadow-xs space-y-1">
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt={`QR code for ticket ${ticketId || 'preview'}`} className="w-28 h-28" />
        ) : (
          <QrCode className="w-28 h-28 text-slate-900" aria-hidden="true" />
        )}
        <div className="text-[9px] font-mono font-bold text-slate-800 tracking-tighter">
          {ticketId || 'SHC-PASS-PREVIEW'}
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-gray-200">
        {conference?.venueName || 'Kigali Convention Centre'} • Digital Delegate Pass
      </div>
    </div>
  );
};
