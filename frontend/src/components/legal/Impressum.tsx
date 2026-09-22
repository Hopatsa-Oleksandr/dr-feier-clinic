import React from 'react';

export function Impressum({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-8 max-w-3xl mx-auto shadow-xl shadow-slate-200/50 flex flex-col gap-6 text-sm text-slate-600 font-medium leading-relaxed">
      <button onClick={onBack} className="text-amber-600 hover:underline w-max font-bold text-xs uppercase tracking-wider">← На главную</button>
      
      <h1 className="font-serif text-3xl text-slate-900 font-semibold mb-2">Impressum</h1>
      
      <h2 className="text-lg text-slate-900 font-semibold mt-2">Angaben gemäß § 5 DDG</h2>
      <p className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-900">
        Yuliia Feier<br/>
        Dr. Feier CLINIC<br/>
        [Улица, номер дома]<br/>
        [Индекс] Stuttgart<br/>
      </p>

      <h2 className="text-lg text-slate-900 font-semibold mt-4">Kontakt</h2>
      <p>
        Telefon: [Ваш номер телефона]<br/>
        E-Mail: [Ваш email]
      </p>

      <h2 className="text-lg text-slate-900 font-semibold mt-4">Berufsbezeichnung und berufsrechtliche Regelungen</h2>
      <p>
        Berufsbezeichnung: Arzt/Ärztin (verliehen in [Страна получения диплома, например, der Ukraine, anerkannt in Deutschland])<br/>
        Zuständige Kammer: Landesärztekammer Baden-Württemberg, Jahnstraße 40, 70597 Stuttgart<br/>
        Geltendes Berufsrecht: Berufsordnung für die Ärzte in Baden-Württemberg (zugänglich über www.aerztekammer-bw.de)
      </p>

      <h2 className="text-lg text-slate-900 font-semibold mt-4">Verbraucher­streit­beilegung/Universal­schlichtungs­stelle</h2>
      <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
    </div>
  );
}