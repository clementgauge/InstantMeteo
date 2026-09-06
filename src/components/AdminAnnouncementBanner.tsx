import React, { useState, useEffect } from 'react';
import { Megaphone, X, Radio, ShieldAlert } from 'lucide-react';
import { AdminAnnouncement, getAdminAnnouncement } from '../services/competitiveGameService';
import { adminGetAnnouncementFromD1 } from '../services/cloudflareD1Service';

export const AdminAnnouncementBanner: React.FC = () => {
  const [announcement, setAnnouncement] = useState<AdminAnnouncement | null>(() => getAdminAnnouncement());
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  const checkAnnouncement = async () => {
    try {
      const local = getAdminAnnouncement();
      const remote = await adminGetAnnouncementFromD1();
      const effective = remote || local;
      
      if (effective && effective.active) {
        // If this is a new announcement or different from dismissed one
        const dismissedKey = sessionStorage.getItem('instant_meteo_dismissed_announcement_id');
        const announcementId = `${effective.title}_${effective.createdAt}`;
        if (dismissedKey !== announcementId) {
          setAnnouncement(effective);
          setIsDismissed(false);
        } else {
          setAnnouncement(effective);
          setIsDismissed(true);
        }
      } else {
        setAnnouncement(null);
      }
    } catch {
      // Ignore network errors
    }
  };

  useEffect(() => {
    checkAnnouncement();

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setAnnouncement(e.detail);
        setIsDismissed(false);
      } else {
        checkAnnouncement();
      }
    };

    window.addEventListener('instant_meteo_admin_announcement_updated', handleUpdate);
    const interval = setInterval(checkAnnouncement, 25000);

    return () => {
      window.removeEventListener('instant_meteo_admin_announcement_updated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleDismiss = () => {
    if (announcement) {
      const announcementId = `${announcement.title}_${announcement.createdAt}`;
      sessionStorage.setItem('instant_meteo_dismissed_announcement_id', announcementId);
    }
    setIsDismissed(true);
  };

  if (!announcement || !announcement.active || isDismissed) {
    return null;
  }

  return (
    <div className="relative z-30 mb-4 animate-in slide-in-from-top duration-300">
      <div className="flex items-start sm:items-center justify-between gap-3 p-4 sm:px-6 rounded-2xl border border-amber-500/60 bg-gradient-to-r from-amber-950/90 via-slate-900/95 to-amber-950/90 shadow-xl backdrop-blur-md">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Megaphone className="h-5 w-5 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-sans">
                <Radio className="h-2.5 w-2.5 animate-pulse" />
                Message Officiel
              </span>
              <span className="text-xs font-bold text-amber-400">
                Par {announcement.author || 'Direction Météo'}
              </span>
              {announcement.createdAt && (
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  • {new Date(announcement.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <h4 className="text-sm font-black text-white truncate">
              {announcement.title}
            </h4>
            <p className="text-xs text-slate-200 mt-0.5 leading-relaxed break-words">
              {announcement.message}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700/60 cursor-pointer"
          title="Fermer cette annonce"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
