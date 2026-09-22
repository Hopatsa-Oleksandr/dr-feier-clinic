import React from 'react';

export function Datenschutz({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-8 max-w-4xl mx-auto shadow-xl shadow-slate-200/50 flex flex-col gap-6 text-sm text-slate-600 font-medium leading-relaxed">
      <button onClick={onBack} className="text-amber-600 hover:underline w-max font-bold text-xs uppercase tracking-wider">← На главную</button>
      
      <h1 className="font-serif text-3xl text-slate-900 font-semibold mb-2">Datenschutzerklärung</h1>
      
      <h2 className="text-xl text-slate-900 font-semibold mt-4">1. Datenschutz auf einen Blick</h2>
      <p><strong>Allgemeine Hinweise</strong><br/>
      Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</p>

      <h2 className="text-xl text-slate-900 font-semibold mt-4">2. Verantwortlicher</h2>
      <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
      <p className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-900">
        <strong>Dr. Feier CLINIC</strong><br/>
        Yuliia Feier<br/>
        [Улица, номер дома]<br/>
        [Индекс] Stuttgart<br/>
        Telefon: [Ваш номер телефона]<br/>
        E-Mail: [Ваш email]
      </p>

      <h2 className="text-xl text-slate-900 font-semibold mt-4">3. Datenerfassung auf dieser Website</h2>
      <p><strong>Cookies</strong><br/>
      Unsere Website verwendet Cookies, die für den technischen Betrieb der Website erforderlich sind. Diese werden auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO gespeichert.</p>
      
      <p><strong>Kontaktformular & Terminbuchung</strong><br/>
      Wenn Sie uns per Kontaktformular oder Buchungssystem Anfragen zukommen lassen, werden Ihre Angaben aus dem Formular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO.</p>

      <h2 className="text-xl text-slate-900 font-semibold mt-4">4. Ihre Rechte</h2>
      <p>Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit an uns wenden.</p>
    </div>
  );
}