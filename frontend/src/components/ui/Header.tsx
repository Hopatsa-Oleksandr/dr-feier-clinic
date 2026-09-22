import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const Header = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: any) => void }) => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
        
        {/* Логотип */}
        <div onClick={() => handleNavClick('home')} className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0 relative z-50">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center font-serif font-bold text-lg sm:text-xl text-white shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            F
          </div>
          <div>
            <span className="font-serif text-sm sm:text-lg tracking-wider text-slate-900 block leading-tight">Dr. Feier CLINIC</span>
            <span className="block text-[9px] sm:text-[10px] uppercase tracking-widest text-amber-600 font-semibold">{t('clinic_subtitle', 'Medical Clinic')}</span>
          </div>
        </div>

        {/* Десктопная навигация */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold tracking-wider uppercase">
          <button onClick={() => handleNavClick('home')} className={`transition-colors hover:text-amber-600 ${activeTab === 'home' ? 'text-amber-600' : 'text-slate-500'}`}>{t('nav_home', 'Главная')}</button>
          <button onClick={() => handleNavClick('services')} className={`transition-colors hover:text-amber-600 ${activeTab === 'services' ? 'text-amber-600' : 'text-slate-500'}`}>{t('nav_services', 'Услуги')}</button>
          <button onClick={() => handleNavClick('doctors')} className={`transition-colors hover:text-amber-600 ${activeTab === 'doctors' ? 'text-amber-600' : 'text-slate-500'}`}>{t('nav_doctor', 'Врач')}</button>
          <button onClick={() => handleNavClick('reviews')} className={`transition-colors hover:text-amber-600 ${activeTab === 'reviews' ? 'text-amber-600' : 'text-slate-500'}`}>{t('nav_reviews', 'Отзывы')}</button>
          <button onClick={() => handleNavClick('contacts')} className={`transition-colors hover:text-amber-600 ${activeTab === 'contacts' ? 'text-amber-600' : 'text-slate-500'}`}>{t('nav_contacts', 'Контакты')}</button>
        </nav>

        {/* Десктопные элементы и Бургер */}
        <div className="flex items-center gap-2 sm:gap-4 relative z-50">
          
          <div className="hidden lg:flex items-center gap-2 mr-1">
            <a href="https://instagram.com/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-amber-500 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://facebook.com/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-amber-500 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/></svg>
            </a>
          </div>

          <div className="hidden lg:flex gap-0.5 sm:gap-1 bg-slate-100 border border-slate-200 rounded-lg p-0.5 sm:p-1">
            {['ru', 'ua', 'de', 'en'].map((lang) => (
              <button 
                key={lang}
                onClick={() => i18n.changeLanguage(lang)} 
                className={`text-[10px] font-bold uppercase px-2 py-1 rounded transition-all ${i18n.language === lang ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {lang}
              </button>
            ))}
          </div>

          <a href="tel:+380443345678" className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-amber-300 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 transition-colors">
            +38 (044) 334-56-78
          </a>
          
          <button 
            onClick={() => handleNavClick('booking')}
            className="hidden lg:block px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:-translate-y-0.5 shrink-0"
          >
            {t('btn_book', 'Записаться')}
          </button>

          {/* Кнопка Мобильного Меню (Бургер) */}
          <button 
            className="lg:hidden p-2 text-slate-600 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            )}
          </button>
        </div>
      </div>

      {/* Мобильное выпадающее меню */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full h-[calc(100vh-70px)] bg-white border-t border-slate-100 flex flex-col p-6 overflow-y-auto lg:hidden z-40">
          <nav className="flex flex-col gap-6 text-sm font-bold tracking-widest uppercase mb-8">
            <button onClick={() => handleNavClick('home')} className={`text-left ${activeTab === 'home' ? 'text-amber-600' : 'text-slate-800'}`}>{t('nav_home', 'Главная')}</button>
            <button onClick={() => handleNavClick('services')} className={`text-left ${activeTab === 'services' ? 'text-amber-600' : 'text-slate-800'}`}>{t('nav_services', 'Услуги')}</button>
            <button onClick={() => handleNavClick('doctors')} className={`text-left ${activeTab === 'doctors' ? 'text-amber-600' : 'text-slate-800'}`}>{t('nav_doctor', 'Врач')}</button>
            <button onClick={() => handleNavClick('reviews')} className={`text-left ${activeTab === 'reviews' ? 'text-amber-600' : 'text-slate-800'}`}>{t('nav_reviews', 'Отзывы')}</button>
            <button onClick={() => handleNavClick('contacts')} className={`text-left ${activeTab === 'contacts' ? 'text-amber-600' : 'text-slate-800'}`}>{t('nav_contacts', 'Контакты')}</button>
          </nav>

          <div className="h-px bg-slate-100 w-full mb-8"></div>

          <div className="flex flex-col gap-6">
            <button 
              onClick={() => handleNavClick('booking')}
              className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20"
            >
              {t('btn_book', 'Записаться онлайн')}
            </button>

            <a href="tel:+380443345678" className="w-full flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 py-3 rounded-xl text-sm font-bold text-slate-700">
              📞 +38 (044) 334-56-78
            </a>

            <div className="flex justify-center gap-2 bg-slate-50 p-2 rounded-xl">
              {['ru', 'ua', 'de', 'en'].map((lang) => (
                <button 
                  key={lang}
                  onClick={() => i18n.changeLanguage(lang)} 
                  className={`text-xs font-bold uppercase px-3 py-2 rounded-lg flex-1 transition-all ${i18n.language === lang ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};