import React, { useState } from 'react';

export const CookieConsent = () => {
  const [accepted, setAccepted] = useState(false);

  if (accepted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 text-white z-50 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-sm text-slate-300">
        Wir nutzen Cookies zur Optimierung der Website und für unseren AI-Voice-Service. 
        Datenschutzkonform nach DSGVO.
      </p>
      <div className="flex gap-2">
        <button 
          onClick={() => setAccepted(true)} 
          className="bg-emerald-500 hover:bg-emerald-600 text-black px-4 py-2 rounded-lg font-semibold text-sm">
          Alle akzeptieren
        </button>
      </div>
    </div>
  );
};