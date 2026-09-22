import React, { useState, useEffect } from 'react';

interface Payment { id: string; amount: number; method: string; taxRate: number; createdAt: string; }
interface Expense { id: string; title: string; category: string; amount: number; createdAt: string; }
interface FinanceSummary { totalIncomeBrutto: string; totalTaxToPay: string; totalIncomeNetto: string; totalExpenses: string; netProfit: string; }
interface Review { id: string; author: string; rating: number; text: string; source: string; reply?: string | null; createdAt: string; }
interface Appointment { id: string; clientName: string; clientPhone: string; service: string; date: string; status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'; notes?: string; createdAt: string; sessionNum?: number; payment?: Payment | null; }
interface MedicalRecord { allergies: string; chronicDiseases: string; procedurePlan: string; sessionNotes: string; prescription?: string; }
interface BookedInterval { startMins: number; endMins: number; }

const getStatusStyle = (status: string) => {
  if (status === 'CONFIRMED') return 'bg-emerald-100 text-emerald-700';
  if (status === 'CANCELLED') return 'bg-rose-100 text-rose-700';
  return 'bg-amber-100 text-amber-700';
};

const REPLY_TEMPLATES = [
  "Благодарим за ваш теплый отзыв! Мы очень рады, что вы остались довольны результатом. Ждем вас снова в клинике Dr. Feier.",
  "Большое спасибо за доверие! Для нас очень важно предоставлять сервис высочайшего уровня. Будем рады видеть вас снова.",
  "Спасибо за ваш прекрасный отзыв! Доктор Файя и вся команда клиники передают вам свои наилучшие пожелания."
];

// База процедур для точного расчета времени в панели администратора
const SERVICES = [
  { title: 'Лечение пигментации IPL Lumecca', duration: 45 },
  { title: 'Удаление сосудов / розацеа IPL Lumecca', duration: 45 },
  { title: 'Лечение акне / постакне IPL Lumecca', duration: 45 },
  { title: 'Микроигольчатый RF-лифтинг Morpheus 8', duration: 60 },
  { title: 'SMAS лифтинг лица Ultraformer MPT', duration: 90 },
  { title: 'Лазерное удаление шрамов (рубцов)', duration: 30 },
  { title: 'Лазерная шлифовка лица и тела', duration: 60 },
  { title: 'Эндосфера терапия, массаж лица', duration: 45 },
  { title: 'Контурная пластика', duration: 45 },
  { title: 'Векторный лифтинг Radiesse', duration: 60 },
  { title: 'Ботулинотерапия', duration: 30 },
  { title: 'Биоревитализация', duration: 45 },
  { title: 'Мезотерапия', duration: 45 },
  { title: 'Ферментная липосакция', duration: 40 },
  { title: 'Липолитики', duration: 30 },
  { title: 'Лечение гипергидроза', duration: 40 },
  { title: 'Плазмолифтинг Endoret', duration: 60 },
  { title: 'Плазмолифтинг', duration: 50 },
  { title: 'Вакуумный гидропилинг Aquapure', duration: 60 },
  { title: 'Чистка лица', duration: 60 },
  { title: 'Пилинг лица', duration: 35 },
  { title: 'Ферментотерапия DMK', duration: 90 },
  { title: 'Монодозные процедуры Casmara', duration: 60 },
  { title: 'Атравматическая чистка лица', duration: 50 },
  { title: 'Микротоковая терапия | Электропорация', duration: 45 },
  { title: 'Ультразвуковая чистка лица', duration: 40 }
];

export function DoctorDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState('');
  
  const [resetStep, setResetStep] = useState<0 | 1 | 2 | 3>(0);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord>({
    allergies: '', chronicDiseases: '', procedurePlan: '', sessionNotes: '', prescription: ''
  });

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseData, setCourseData] = useState({
    firstName: '', lastName: '', phone: '', service: SERVICES[0].title, sessions: [{ date: '', time: '10:00' }]
  });
  
  // Хранилище занятых интервалов по датам
  const [bookedIntervalsByDate, setBookedIntervalsByDate] = useState<Record<string, BookedInterval[]>>({});

  const [viewMode, setViewMode] = useState<'schedule' | 'patients' | 'finance' | 'reviews' | 'guide'>('schedule');
  
  const [expandedPatients, setExpandedPatients] = useState<string[]>([]);
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, ids: string[]}>({isOpen: false, ids: []});
  const [pinCode, setPinCode] = useState('');
  const ADMIN_PIN = '1111';

  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [expenseData, setExpenseData] = useState({ title: '', category: 'MATERIAL', amount: '' });

  const [searchQuery, setSearchQuery] = useState('');
  const [networkError, setNetworkError] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ author: '', rating: 5, text: '', source: 'SITE' });
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      fetchAppointments(savedToken);
      fetchFinanceData(savedToken);
      fetchReviews();
    }
  }, []);

  // Динамическая подгрузка занятых слотов для выбранных дат в курсе
  useEffect(() => {
    if (!showCourseModal) return;
    courseData.sessions.forEach(async (session) => {
      if (session.date && !bookedIntervalsByDate[session.date]) {
        try {
          const res = await fetch(`http://127.0.0.1:5000/api/appointments/booked?date=${session.date}`);
          const data = await res.json();
          if (data.success) {
            const intervals = data.bookedAppointments.map((app: any) => {
              const [h, m] = app.time.split(':').map(Number);
              const startMins = h * 60 + m;
              let duration = 0;
              const names = app.service ? app.service.split(' + ').map((s: string) => s.trim()) : [];
              names.forEach((name: string) => {
                const s = SERVICES.find(x => x.title === name);
                if (s) duration += s.duration;
              });
              if (duration === 0) duration = 45;
              return { startMins, endMins: startMins + duration };
            });
            setBookedIntervalsByDate(prev => ({ ...prev, [session.date]: intervals }));
          }
        } catch (err) {
          console.error('Ошибка загрузки занятых слотов:', err);
        }
      }
    });
  }, [courseData.sessions, showCourseModal]);

  // Функция проверки конфликта времени
  const isSessionValid = (session: {date: string, time: string}, index: number, selectedServiceTitle: string) => {
    if (!session.date || !session.time) return true;

    const service = SERVICES.find(s => s.title === selectedServiceTitle);
    const duration = service ? service.duration : 45;
    const [h, m] = session.time.split(':').map(Number);
    const startMins = h * 60 + m;
    const endMins = startMins + duration;

    // 1. Проверка пересечения с базой данных
    const dbIntervals = bookedIntervalsByDate[session.date] || [];
    const dbConflict = dbIntervals.some(interval =>
      Math.max(startMins, interval.startMins) < Math.min(endMins, interval.endMins)
    );
    if (dbConflict) return false;

    // 2. Проверка пересечения с другими сеансами внутри ЭТОЙ ЖЕ формы
    const formConflict = courseData.sessions.some((otherSession, otherIndex) => {
      if (index === otherIndex || otherSession.date !== session.date || !otherSession.time) return false;
      const [oh, om] = otherSession.time.split(':').map(Number);
      const oStart = oh * 60 + om;
      const oEnd = oStart + duration;
      return Math.max(startMins, oStart) < Math.min(endMins, oEnd);
    });

    return !formConflict;
  };

  const hasConflicts = courseData.sessions.some((session, idx) => !isSessionValid(session, idx, courseData.service));

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      await Promise.all([
        fetchAppointments(token),
        fetchFinanceData(token),
        fetchReviews()
      ]);
    } finally {
      setIsReconnecting(false);
    }
  };

  const fetchFinanceData = async (authToken: string) => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/finance/summary', { headers: { 'Authorization': `Bearer ${authToken}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) {
        setFinanceSummary(data.summary);
        setExpenses(data.expenses.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setNetworkError(false);
      }
    } catch (err) { setNetworkError(true); }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/reviews');
      const data = await res.json();
      if (data.success) setReviews(data.reviews);
    } catch (err) {}
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setToken(data.token);
        setIsAuthenticated(true);
        fetchAppointments(data.token);
        fetchFinanceData(data.token);
        fetchReviews();
      } else setError('Неверный пароль');
    } catch (err) { setError('Ошибка соединения'); }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (res.ok && data.success) setResetStep(2);
      else setError(data.error || 'Ошибка при отправке кода');
    } catch (err) { setError('Ошибка соединения'); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: resetEmail, code: resetCode, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Пароль успешно изменен!');
        setResetStep(0); setResetCode(''); setNewPassword(''); setPassword('');
      } else setError(data.error || 'Ошибка сброса пароля');
    } catch (err) { setError('Ошибка соединения'); }
  };

  const fetchAppointments = async (authToken: string) => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/appointments', { headers: { 'Authorization': `Bearer ${authToken}` } });
      if (res.status === 401 || res.status === 403) return handleLogout();
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (Array.isArray(data)) { setAppointments(data); setNetworkError(false); }
    } catch (err) { setNetworkError(true); }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(''); setIsAuthenticated(false); setAppointments([]);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/appointments/${id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error();
      setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: newStatus as any } : app));
      setNetworkError(false);
    } catch (err) { setNetworkError(true); alert('Сбой подключения. Изменение не сохранено.'); }
  };

  const toggleSelect = (id: string) => {
    setSelectedAppIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectGroup = (ids: string[]) => {
    const allSelected = ids.every(id => selectedAppIds.includes(id));
    if (allSelected) setSelectedAppIds(prev => prev.filter(id => !ids.includes(id)));
    else setSelectedAppIds(prev => [...new Set([...prev, ...ids])]);
  };

  const requestDelete = (ids: string[]) => {
    setDeleteModal({ isOpen: true, ids });
    setPinCode('');
  };

  const confirmDelete = async () => {
    if (pinCode !== ADMIN_PIN) { alert('Неверный PIN-код. Удаление отменено.'); return; }
    try {
      await Promise.all(deleteModal.ids.map(id => 
        fetch(`http://127.0.0.1:5000/api/appointments/${id}`, {
          method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => { if (!res.ok) throw new Error(); })
      ));
      setAppointments(prev => prev.filter(app => !deleteModal.ids.includes(app.id)));
      setSelectedAppIds(prev => prev.filter(id => !deleteModal.ids.includes(id)));
      if (selectedApp && deleteModal.ids.includes(selectedApp.id)) setSelectedApp(null);
      setDeleteModal({ isOpen: false, ids: [] });
      setNetworkError(false);
    } catch (err) { setNetworkError(true); alert('Ошибка при удалении. Проверьте соединение.'); }
  };

  const toggleExpandPatient = (key: string) => {
    setExpandedPatients(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  };

  const openMedicalCard = (app: Appointment) => {
    setSelectedApp(app);
    setPaymentAmount('');
    try {
      if (!app.notes) throw new Error();
      const parsed = JSON.parse(app.notes);
      setMedicalRecord({
        allergies: parsed.allergies || '', chronicDiseases: parsed.chronicDiseases || '',
        procedurePlan: parsed.procedurePlan || '', sessionNotes: parsed.sessionNotes || '', prescription: parsed.prescription || ''
      });
    } catch {
      setMedicalRecord({ allergies: '', chronicDiseases: '', procedurePlan: '', sessionNotes: app.notes || '', prescription: '' });
    }
  };

  const saveNotes = async () => {
    if (!selectedApp) return;
    const payload = JSON.stringify(medicalRecord);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/appointments/${selectedApp.id}/notes`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ notes: payload })
      });
      if (!res.ok) throw new Error();
      setAppointments(prev => prev.map(app => app.id === selectedApp.id ? { ...app, notes: payload } : app));
      alert('Данные сохранены');
      setNetworkError(false);
    } catch (err) { setNetworkError(true); alert('Сбой подключения. Данные не сохранены.'); }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedApp || !paymentAmount) return;
    try {
      const res = await fetch('http://127.0.0.1:5000/api/finance/payment', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ appointmentId: selectedApp.id, amount: paymentAmount, method: paymentMethod })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) {
        const updatedApp = { ...selectedApp, payment: data.payment };
        setSelectedApp(updatedApp);
        setAppointments(prev => prev.map(app => app.id === selectedApp.id ? updatedApp : app));
        fetchFinanceData(token);
        setNetworkError(false);
      } else alert(data.error || 'Ошибка оплаты');
    } catch (err) { setNetworkError(true); alert('Сбой подключения. Оплата не проведена.'); }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseData.title || !expenseData.amount) return;
    try {
      const res = await fetch('http://127.0.0.1:5000/api/finance/expense', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(expenseData)
      });
      if (!res.ok) throw new Error();
      setExpenseData({ title: '', category: 'MATERIAL', amount: '' });
      fetchFinanceData(token);
      alert('Расход успешно добавлен');
      setNetworkError(false);
    } catch (err) { setNetworkError(true); alert('Сбой подключения. Расход не добавлен.'); }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.author || !newReview.text) return;
    try {
      const res = await fetch('http://127.0.0.1:5000/api/reviews', { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newReview) 
      });
      if (res.ok) { 
        setNewReview({ author: '', rating: 5, text: '', source: 'SITE' }); 
        fetchReviews(); 
        alert('Отзыв успешно добавлен'); 
      }
    } catch (err) {}
  };

  const deleteReview = async (id: string) => {
    if (!window.confirm('Удалить отзыв навсегда?')) return;
    try {
      await fetch(`http://127.0.0.1:5000/api/reviews/${id}`, { 
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } 
      });
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {}
  };

  const submitReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/reviews/${id}/reply`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reply: replyText })
      });
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, reply: replyText } : r));
        setReplyingId(null);
        setReplyText('');
      }
    } catch (err) { alert('Ошибка сохранения ответа'); }
  };

  const handleOpenCourseModal = () => {
    if (!selectedApp) return;
    const nameParts = selectedApp.clientName.split(' ');
    setCourseData({
      firstName: nameParts[0] || '', lastName: nameParts.slice(1).join(' ') || '',
      phone: selectedApp.clientPhone, service: selectedApp.service, sessions: [{ date: '', time: '10:00' }]
    });
    setShowCourseModal(true);
  };

  const addSession = () => setCourseData({ ...courseData, sessions: [...courseData.sessions, { date: '', time: '10:00' }] });
  const removeSession = (index: number) => setCourseData({ ...courseData, sessions: courseData.sessions.filter((_, i) => i !== index) });
  const updateSession = (index: number, field: string, value: string) => {
    const newSessions = [...courseData.sessions];
    newSessions[index] = { ...newSessions[index], [field]: value };
    setCourseData({ ...courseData, sessions: newSessions });
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasConflicts) {
      alert('Пожалуйста, исправьте накладки в расписании (выделены красным) перед сохранением.');
      return;
    }
    try {
      const res = await fetch('http://127.0.0.1:5000/api/appointments/course', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(courseData)
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) {
        alert(`Курс успешно создан! Добавлено сеансов: ${data.count}`);
        setShowCourseModal(false);
        fetchAppointments(token); 
        setNetworkError(false);
      } else alert(data.error || 'Ошибка при создании курса');
    } catch (err) { setNetworkError(true); alert('Сбой подключения к серверу.'); }
  };

  const handlePrintPrescription = () => {
    if (!selectedApp) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('Разрешите всплывающие окна для печати.'); return; }
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Лист назначений - ${selectedApp.clientName}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #f59e0b; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; margin-bottom: 5px; color: #0f172a; }
            .logo span { color: #d97706; }
            .sub { font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; }
            .info { margin-bottom: 40px; font-size: 16px; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; background: #f8fafc; }
            .content { font-size: 16px; white-space: pre-wrap; min-height: 300px; }
            .footer { margin-top: 50px; font-size: 16px; border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; }
            .sign-line { width: 200px; border-bottom: 1px solid #1e293b; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Dr. Feier <span>CLINIC</span></div>
            <div class="sub">Медицинская косметология и эстетика</div>
          </div>
          <div class="info">
            <strong>Пациент:</strong> ${selectedApp.clientName}<br/>
            <strong>Дата визита:</strong> ${new Date().toLocaleDateString('ru-RU')}<br/>
            <strong>Процедура:</strong> ${selectedApp.service}
          </div>
          <div class="content">
            <h3 style="text-transform: uppercase; color: #d97706; font-size: 14px;">Рекомендации и домашний уход:</h3>
            ${medicalRecord.prescription || 'Специфических рекомендаций не добавлено.'}
          </div>
          <div class="footer">
            <div>МП</div>
            <div>Врач: Dr. Feier<br/><br/><span class="sign-line"></span></div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
  };

  const handlePrintConsent = () => {
    if (!selectedApp) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('Разрешите всплывающие окна для печати.'); return; }
    
    const printContent = `
      <!DOCTYPE html>
      <html lang="de">
        <head>
          <title>Aufklärungsbogen - ${selectedApp.clientName}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.5; font-size: 14px; }
            .header { text-align: center; border-bottom: 2px solid #1e293b; padding-bottom: 10px; margin-bottom: 20px; }
            h1 { font-size: 22px; margin-bottom: 5px; text-transform: uppercase; }
            h2 { font-size: 16px; margin-top: 25px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; color: #d97706; }
            .info-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
            .info-table td { border: 1px solid #94a3b8; padding: 10px; }
            .text-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; margin-bottom: 20px; border-radius: 8px; }
            .signatures { margin-top: 50px; display: flex; justify-content: space-between; }
            .sign-line { border-top: 1px solid #1e293b; width: 300px; padding-top: 5px; text-align: center; font-size: 12px; }
            ul { margin-top: 5px; padding-left: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Aufklärungs- und Einwilligungsbogen</h1>
            <p>Dr. Feier CLINIC | Ästhetische Medizin</p>
          </div>
          
          <table class="info-table">
            <tr>
              <td><strong>Patient/in:</strong> ${selectedApp.clientName}</td>
              <td><strong>Datum:</strong> ${new Date().toLocaleDateString('de-DE')}</td>
            </tr>
            <tr>
              <td><strong>Telefon:</strong> ${selectedApp.clientPhone}</td>
              <td><strong>Geplante Behandlung:</strong> ${selectedApp.service}</td>
            </tr>
          </table>

          <div class="text-box">
            <p>Gemäß <strong>§ 630e BGB</strong> (Patientenrechtegesetz) sind wir verpflichtet, Sie vor einer ästhetisch-medizinischen Behandlung über Art, Umfang, Durchführung, zu erwartende Folgen und Risiken der Maßnahme aufzuklären.</p>
          </div>

          <h2>1. Risiken und mögliche Nebenwirkungen</h2>
          <p>Trotz fachgerechter Durchführung können bei der o.g. Behandlung folgende Nebenwirkungen auftreten:</p>
          <ul>
            <li>Rötungen, Schwellungen oder Blutergüsse (Hämatome) an der Behandlungsstelle.</li>
            <li>Leichte Schmerzen, Juckreiz oder Druckempfindlichkeit.</li>
            <li>In seltenen Fällen: Infektionen, allergische Reaktionen, Pigmentverschiebungen oder Asymmetrien.</li>
          </ul>

          <h2>2. Verhaltensregeln nach der Behandlung</h2>
          <p>Um ein optimales Ergebnis zu gewährleisten, verpflichte ich mich, folgende Regeln einzuhalten:</p>
          <ul>
            <li>In den ersten 24 Stunden keine intensive sportliche Betätigung.</li>
            <li>Für 1-2 Wochen Verzicht auf Sauna, Solarium und direkte Sonneneinstrahlung.</li>
            <li>Strikte Einhaltung der vom Arzt verschriebenen Pflegeempfehlungen.</li>
          </ul>

          <h2>3. Finanzielles (Kostenaufklärung)</h2>
          <p>Mir ist bekannt, dass es sich um eine ästhetische Leistung handelt, deren Kosten (inkl. 19% MwSt.) <strong>nicht</strong> von den gesetzlichen oder privaten Krankenkassen übernommen werden. Die Kosten trage ich als Selbstzahler.</p>

          <h2>4. DSGVO & Fotodokumentation</h2>
          <p>Ich willige ein, dass zu internen medizinischen Dokumentationszwecken Vorher-Nachher-Fotos angefertigt werden dürfen (Art. 6 Abs. 1 lit. a DSGVO).</p>

          <h2>5. Einwilligungserklärung</h2>
          <p>Ich bestätige hiermit, dass ein ausführliches Aufklärungsgespräch mit dem behandelnden Arzt stattgefunden hat. Alle meine Fragen wurden verständlich beantwortet. Ich hatte ausreichend Zeit zur Bedenkzeit und stimme der Behandlung ausdrücklich zu.</p>

          <div class="signatures">
            <div class="sign-line">Ort, Datum / Unterschrift Patient/in</div>
            <div class="sign-line">Unterschrift Arzt (Dr. Feier)</div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
  };

  const groupedPatients = Object.values(
    appointments.reduce((acc, app) => {
      const key = `${app.clientName.trim().toLowerCase()}_${app.clientPhone.trim()}`;
      if (!acc[key]) acc[key] = { groupKey: key, clientName: app.clientName, clientPhone: app.clientPhone, apps: [] };
      acc[key].apps.push(app);
      return acc;
    }, {} as Record<string, {groupKey: string, clientName: string, clientPhone: string, apps: Appointment[]}>)
  )
  .map(group => {
    group.apps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return group;
  })
  .filter(group => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return group.clientName.toLowerCase().includes(query) || group.clientPhone.includes(query);
  })
  .sort((a, b) => a.clientName.localeCompare(b.clientName));

  const clientHistory = selectedApp && Array.isArray(appointments)
    ? appointments
        .filter(a => a.clientPhone === selectedApp.clientPhone && a.clientName.trim().toLowerCase() === selectedApp.clientName.trim().toLowerCase())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  if (!isAuthenticated) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-white border border-slate-200 p-8 rounded-3xl max-w-md w-full shadow-2xl text-center">
        {resetStep === 0 && (
          <>
            <h2 className="font-serif text-2xl text-slate-900 mb-6 font-semibold">Доступ к журналу</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 text-center font-medium" />
              {error && <div className="text-rose-500 text-xs font-semibold">{error}</div>}
              <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors text-xs uppercase tracking-wider shadow-md shadow-amber-500/20">Войти</button>
            </form>
            <button onClick={() => {setResetStep(1); setError('');}} className="mt-4 text-xs text-slate-500 hover:text-amber-600 font-semibold transition-colors">Забыли пароль?</button>
          </>
        )}
        {resetStep === 1 && (
          <>
            <h2 className="font-serif text-2xl text-slate-900 mb-2 font-semibold">Восстановление</h2>
            <p className="text-xs text-slate-500 mb-6 font-medium">Введите email администратора. Мы отправим код подтверждения.</p>
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              <input type="email" placeholder="admin@clinic.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 text-center font-medium" />
              <button type="submit" className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors text-xs uppercase tracking-wider">Отправить код</button>
            </form>
            <button onClick={() => {setResetStep(0); setError('');}} className="mt-4 text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors">Отмена</button>
          </>
        )}
        {resetStep === 2 && (
          <>
            <h2 className="font-serif text-2xl text-slate-900 mb-2 font-semibold">Ввод кода</h2>
            <p className="text-xs text-slate-500 mb-6 font-medium">Код отправлен на {resetEmail}</p>
            <form onSubmit={(e) => { e.preventDefault(); setResetStep(3); setError(''); }} className="flex flex-col gap-4">
              <input type="text" placeholder="123456" value={resetCode} onChange={(e) => setResetCode(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-2xl tracking-[0.5em] text-slate-900 focus:outline-none focus:border-amber-500 text-center font-bold" />
              <button type="submit" className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors text-xs uppercase tracking-wider">Подтвердить</button>
            </form>
            <button onClick={() => {setResetStep(1); setError('');}} className="mt-4 text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors">Отмена</button>
          </>
        )}
        {resetStep === 3 && (
          <>
            <h2 className="font-serif text-2xl text-slate-900 mb-6 font-semibold">Новый пароль</h2>
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <input type="password" placeholder="Новый пароль" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 text-center font-medium" />
              {error && <div className="text-rose-500 text-xs font-semibold">{error}</div>}
              <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors text-xs uppercase tracking-wider">Сохранить и войти</button>
            </form>
            <button onClick={() => {setResetStep(0); setError('');}} className="mt-4 text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors">Отмена</button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h2 className="font-serif text-3xl text-slate-900 font-semibold">Журнал записей</h2>
          <p className="text-xs text-amber-600 mt-2 uppercase font-bold tracking-wider">Управление клиникой</p>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-slate-100 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold rounded-xl text-xs uppercase transition-colors">Выйти</button>
      </div>

      {networkError && (
        <div className="bg-rose-500 text-white px-6 py-4 rounded-2xl flex items-center justify-between shadow-lg shadow-rose-500/20 mb-2 animate-fade-in">
          <div className="flex items-center gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-bold text-sm uppercase tracking-wider">Сбой подключения</div>
              <div className="text-xs text-rose-100 font-medium">Связь с сервером потеряна. Данные на экране могут быть неактуальны.</div>
            </div>
          </div>
          <button 
            onClick={handleReconnect} 
            disabled={isReconnecting}
            className="px-4 py-2 bg-white text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold uppercase transition-colors shadow-sm disabled:opacity-50"
          >
            {isReconnecting ? 'Соединение...' : 'Переподключиться'}
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-max overflow-x-auto">
          <button onClick={() => setViewMode('schedule')} className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${viewMode === 'schedule' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}>📅 Расписание</button>
          <button onClick={() => setViewMode('patients')} className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${viewMode === 'patients' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}>👥 База пациентов</button>
          <button onClick={() => { setViewMode('finance'); fetchFinanceData(token); }} className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${viewMode === 'finance' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}>💶 Финансы</button>
          <button onClick={() => { setViewMode('reviews'); fetchReviews(); }} className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${viewMode === 'reviews' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}>⭐ Модерация отзывов</button>
          <button onClick={() => setViewMode('guide')} className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${viewMode === 'guide' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}>📖 Инструкция</button>
        </div>

        {viewMode !== 'finance' && viewMode !== 'guide' && viewMode !== 'reviews' && (
          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="relative w-full max-w-sm animate-fade-in">
              <input type="text" placeholder="Поиск по имени или телефону..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-sm" />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
            </div>
            {selectedAppIds.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl flex items-center gap-4 animate-fade-in shrink-0">
                <span className="text-xs font-bold text-rose-700">Выбрано: {selectedAppIds.length}</span>
                <button onClick={() => requestDelete(selectedAppIds)} className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold uppercase transition-colors shadow-sm">Удалить</button>
                <button onClick={() => setSelectedAppIds([])} className="text-slate-400 hover:text-slate-600 font-bold text-lg leading-none">✕</button>
              </div>
            )}
          </div>
        )}
      </div>

      {viewMode === 'guide' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 flex flex-col gap-8 animate-fade-in max-w-4xl mx-auto w-full">
          <div className="border-b border-slate-100 pb-6">
            <h3 className="font-serif text-3xl text-slate-900 font-semibold mb-2">Руководство пользователя клиники</h3>
            <p className="text-sm text-slate-500">Краткая инструкция для доктора и администратора по управлению расписанием, картами пациентов и финансами.</p>
          </div>
          <div className="flex flex-col gap-6 text-slate-700 text-sm leading-relaxed">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6">
              <h4 className="text-base font-bold text-amber-600 mb-2 flex items-center gap-2"><span>1.</span> Управление расписанием и курсами процедур</h4>
              <p className="mb-3">В разделе <strong>«Расписание»</strong> отображаются все визиты. Если пациент записан на курс из нескольких процедур, система автоматически сгруппирует их в одну строку:</p>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-slate-600">
                <li>Нажмите кнопку <strong>«Развернуть»</strong>, чтобы увидеть все даты сеансов конкретного курса.</li>
                <li>Вы можете подтверждать визиты (галочка ✓), отменять (крестик ✕) или удалять.</li>
                <li>Для удаления записей система запросит PIN-код администратора (по умолчанию: <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-slate-800">1111</code>).</li>
              </ul>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6">
              <h4 className="text-base font-bold text-amber-600 mb-2 flex items-center gap-2"><span>2.</span> Медицинская карта пациента и юридические бланки</h4>
              <p className="mb-3">Кликнув на имя любого пациента или кнопку <strong>«Открыть карту»</strong>, вы попадаете в его медицинское досье:</p>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-slate-600">
                <li><strong>Печать согласия:</strong> Вверху карты нажмите <strong>«📝 Бланк согласия (PDF)»</strong>. Распечатайте официальный немецкий Aufklärungsbogen (согласно § 630e BGB) для подписи пациентом перед процедурой.</li>
                <li><strong>Анамнез:</strong> Указывайте аллергии и хронические заболевания (сохраняются навсегда для этого пациента).</li>
                <li><strong>План лечения и сеансы:</strong> Вы можете переключаться между визитами в левой колонке, записывая индивидуальные параметры аппарата.</li>
                <li><strong>Печать рецепта:</strong> Внизу правой колонки заполните поле <em>«Лист назначений (Рецепт)»</em> и нажмите кнопку <strong>«🖨 Распечатать»</strong>.</li>
              </ul>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6">
              <h4 className="text-base font-bold text-amber-600 mb-2 flex items-center gap-2"><span>3.</span> Прием оплат и финансовый учет (EÜR для налоговой)</h4>
              <p className="mb-3">Внутри каждой открытой карты пациента вверху справа расположен <strong>Финансовый терминал сеанса</strong>:</p>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-slate-600">
                <li>Введите сумму (€), выберите тип оплаты (Терминал / Наличные / Перевод) и нажмите <strong>«Провести оплату»</strong>.</li>
                <li>Все чеки автоматически поступают во вкладку <strong>«💶 Финансы»</strong> вверху панели.</li>
                <li>Там же вы можете вносить расходы клиники (покупка препаратов, аренда, реклама), а система в реальном времени рассчитывает грязную выручку, налог (НДС 19% MwSt) и итоговую чистую прибыль для вашего налогового консультанта (Steuerberater).</li>
              </ul>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 font-medium">
            💡 <strong>Совет:</strong> Рекомендуется ежедневно проверять вкладку «Расписание» и вовремя фиксировать оплаты после завершения процедур для поддержания идеального порядка в бухгалтерии.
          </div>
        </div>
      )}

      {viewMode === 'reviews' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-fade-in">
          
          <div className="xl:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xl sticky top-24">
            <h3 className="font-serif text-xl text-slate-900 font-semibold mb-4">Оставить отзыв</h3>
            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3">
              <input type="text" required placeholder="Имя пациента" value={newReview.author} onChange={e => setNewReview({...newReview, author: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
              <select value={newReview.rating} onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500">
                <option value="5">5 Звезд ⭐⭐⭐⭐⭐</option>
                <option value="4">4 Звезды ⭐⭐⭐⭐</option>
                <option value="3">3 Звезды ⭐⭐⭐</option>
                <option value="2">2 Звезды ⭐⭐</option>
                <option value="1">1 Звезда ⭐</option>
              </select>
              <textarea required placeholder="Текст отзыва..." value={newReview.text} onChange={e => setNewReview({...newReview, text: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm min-h-[80px] focus:outline-none focus:border-amber-500 resize-none"></textarea>
              <select value={newReview.source} onChange={e => setNewReview({...newReview, source: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500">
                <option value="SITE">Напрямую в клинике</option>
                <option value="GOOGLE">Google Maps</option>
              </select>
              <button type="submit" className="mt-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl uppercase text-xs tracking-wider transition-colors shadow-lg shadow-amber-500/20">Опубликовать отзыв</button>
            </form>
          </div>
          
          <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map(r => (
              <div key={r.id} className="bg-white border border-slate-200 p-6 rounded-3xl relative shadow-sm flex flex-col group">
                <button onClick={() => deleteReview(r.id)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                <div className="text-amber-400 mb-2 text-base">{'⭐'.repeat(r.rating)}</div>
                <p className="text-sm text-slate-700 mb-4 leading-relaxed italic">"{r.text}"</p>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <div className="font-bold text-sm text-slate-900 font-serif">{r.author}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(r.createdAt).toLocaleDateString('ru-RU')}</div>
                  </div>
                  <span className={`text-[9px] uppercase font-bold px-2 py-1 rounded ${r.source === 'GOOGLE' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {r.source}
                  </span>
                </div>

                <div className="mt-auto border-t border-slate-100 pt-4">
                  {r.reply ? (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
                      <span className="font-bold text-amber-600 block mb-1 uppercase tracking-wider text-[10px]">Ответ клиники:</span>
                      {r.reply}
                    </div>
                  ) : replyingId === r.id ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {REPLY_TEMPLATES.map((tmpl, idx) => (
                          <button key={idx} onClick={() => setReplyText(tmpl)} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded hover:bg-amber-100 transition-colors text-left max-w-full truncate">
                            Шаблон {idx + 1}
                          </button>
                        ))}
                      </div>
                      <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Ваш ответ..." className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-amber-500 min-h-[60px] resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => submitReply(r.id)} className="flex-1 bg-slate-900 text-white text-xs font-bold py-2 rounded-lg uppercase hover:bg-slate-800">Ответить</button>
                        <button onClick={() => { setReplyingId(null); setReplyText(''); }} className="px-3 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg uppercase hover:bg-slate-200">Отмена</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setReplyingId(r.id); setReplyText(''); }} className="text-[10px] font-bold uppercase tracking-wider text-amber-600 hover:text-amber-800 transition-colors flex items-center gap-1">
                      ↪ Написать ответ
                    </button>
                  )}
                </div>
              </div>
            ))}
            {reviews.length === 0 && <div className="md:col-span-2 text-slate-400 text-sm font-medium p-6 bg-slate-50 rounded-3xl border border-dashed text-center">Отзывов пока нет.</div>}
          </div>
        </div>
      )}

      {viewMode === 'finance' && financeSummary && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-lg shadow-slate-200/50">
              <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Грязная выручка (Brutto)</div>
              <div className="text-2xl font-serif font-bold text-slate-900">{financeSummary.totalIncomeBrutto} €</div>
            </div>
            <div className="bg-rose-50 border border-rose-100 p-5 rounded-3xl shadow-lg shadow-rose-100/50">
              <div className="text-[10px] uppercase text-rose-500 font-bold mb-1">НДС к уплате (19% MwSt)</div>
              <div className="text-2xl font-serif font-bold text-rose-700">- {financeSummary.totalTaxToPay} €</div>
            </div>
            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-lg shadow-slate-200/50">
              <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Чистая выручка (Netto)</div>
              <div className="text-2xl font-serif font-bold text-slate-900">{financeSummary.totalIncomeNetto} €</div>
            </div>
            <div className="bg-orange-50 border border-orange-100 p-5 rounded-3xl shadow-lg shadow-orange-100/50">
              <div className="text-[10px] uppercase text-orange-600 font-bold mb-1">Расходы клиники (Ausgaben)</div>
              <div className="text-2xl font-serif font-bold text-orange-700">- {financeSummary.totalExpenses} €</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl shadow-lg shadow-emerald-200/50">
              <div className="text-[10px] uppercase text-emerald-700 font-bold mb-1">Чистая прибыль (Gewinn)</div>
              <div className="text-2xl font-serif font-bold text-emerald-700">{financeSummary.netProfit} €</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/50 lg:col-span-1 h-max">
              <h3 className="font-serif text-xl text-slate-900 font-semibold border-b border-slate-100 pb-4 mb-4">Внести расход</h3>
              <form onSubmit={handleExpenseSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs uppercase text-slate-500 font-bold mb-1 block">Название (чек)</label>
                  <input type="text" required value={expenseData.title} onChange={e => setExpenseData({...expenseData, title: e.target.value})} placeholder="Например: Препараты Allergan" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs uppercase text-slate-500 font-bold mb-1 block">Категория</label>
                  <select value={expenseData.category} onChange={e => setExpenseData({...expenseData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none">
                    <option value="MATERIAL">Материалы и препараты</option>
                    <option value="RENT">Аренда и коммуналка</option>
                    <option value="MARKETING">Реклама и маркетинг</option>
                    <option value="EQUIPMENT">Оборудование</option>
                    <option value="OTHER">Прочее</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase text-slate-500 font-bold mb-1 block">Сумма (€)</label>
                  <input type="number" step="0.01" required value={expenseData.amount} onChange={e => setExpenseData({...expenseData, amount: e.target.value})} placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none font-bold" />
                </div>
                <button type="submit" className="w-full mt-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors">Сохранить расход</button>
              </form>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 lg:col-span-2">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-serif text-xl text-slate-900 font-semibold">Журнал расходов (Ausgabenbuch)</h3>
              </div>
              <div className="overflow-y-auto max-h-[400px]">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="text-xs uppercase bg-slate-50 text-slate-500 font-bold sticky top-0">
                    <tr>
                      <th className="px-6 py-3">Дата</th>
                      <th className="px-6 py-3">Название</th>
                      <th className="px-6 py-3">Категория</th>
                      <th className="px-6 py-3 text-right">Сумма</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenses.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-slate-400">Расходов пока нет</td></tr>}
                    {expenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-slate-50/80">
                        <td className="px-6 py-3 font-mono text-xs">{new Date(exp.createdAt).toLocaleDateString('ru-RU')}</td>
                        <td className="px-6 py-3 font-semibold text-slate-900">{exp.title}</td>
                        <td className="px-6 py-3"><span className="text-[10px] uppercase bg-slate-100 px-2 py-1 rounded font-bold">{exp.category}</span></td>
                        <td className="px-6 py-3 text-right font-bold text-orange-600">- {exp.amount.toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {(viewMode === 'schedule' || viewMode === 'patients') && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  {viewMode === 'schedule' && <th className="px-4 py-4 w-12"></th>}
                  <th className="px-6 py-4">Пациент</th>
                  {viewMode === 'schedule' ? (
                    <>
                      <th className="px-6 py-4">Процедура</th>
                      <th className="px-6 py-4">Дата / Статус</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4">История визитов</th>
                      <th className="px-6 py-4">Ближайший сеанс</th>
                    </>
                  )}
                  <th className="px-6 py-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {groupedPatients.length === 0 && (
                  <tr>
                    <td colSpan={viewMode === 'schedule' ? 5 : 4} className="px-6 py-12 text-center text-slate-400 font-medium">
                      Записей не найдено
                    </td>
                  </tr>
                )}
                
                {viewMode === 'patients' && groupedPatients.map((group, idx) => {
                  const latestApp = group.apps[0];
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-serif text-slate-900 text-base font-semibold">{group.clientName}</div>
                        <div className="text-xs text-amber-600 font-mono mt-1 font-semibold">{group.clientPhone}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                        Всего записей: <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded ml-1">{group.apps.length}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900">{latestApp.date}</div>
                        <div className="text-[10px] text-slate-500 uppercase mt-1">{latestApp.service}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openMedicalCard(latestApp)} className="px-5 py-2.5 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-xl text-xs font-bold uppercase transition-colors flex items-center gap-2 ml-auto border border-amber-100">
                          🗓 Открыть карту
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {viewMode === 'schedule' && groupedPatients.map((group) => {
                  if (group.apps.length === 1) {
                    const app = group.apps[0];
                    const isSelected = selectedAppIds.includes(app.id);
                    return (
                      <tr key={app.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-amber-50/30' : ''}`}>
                        <td className="px-4 py-4 border-r border-slate-100 text-center">
                          <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(app.id)} className="w-4 h-4 text-amber-500 rounded border-slate-300 cursor-pointer focus:ring-amber-500" />
                        </td>
                        <td className="px-6 py-4 cursor-pointer group" onClick={() => openMedicalCard(app)}>
                          <div className="font-serif text-slate-900 text-base group-hover:text-amber-600 transition-colors flex items-center gap-2 font-semibold">
                            {app.clientName}
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase tracking-wider font-bold">Карта</span>
                          </div>
                          <div className="text-xs text-amber-600 font-mono mt-1 font-semibold">{app.clientPhone}</div>
                        </td>
                        <td className="px-6 py-4 font-medium">{app.service}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-slate-700">{app.date}</div>
                          <div className="mt-1 flex gap-2 items-center">
                            {app.status === 'PENDING' && <span className="text-amber-600 text-[10px] font-bold uppercase">Ожидает</span>}
                            {app.status === 'CONFIRMED' && <span className="text-emerald-600 text-[10px] font-bold uppercase">Подтвержден</span>}
                            {app.status === 'CANCELLED' && <span className="text-rose-600 text-[10px] font-bold uppercase">Отменен</span>}
                            {app.payment && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase font-bold border border-emerald-200">Оплачено</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {app.status !== 'CONFIRMED' && <button onClick={() => updateStatus(app.id, 'CONFIRMED')} className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white font-bold transition-colors">✓</button>}
                            {app.status !== 'CANCELLED' && <button onClick={() => updateStatus(app.id, 'CANCELLED')} className="w-7 h-7 rounded bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white font-bold transition-colors">✕</button>}
                            <button onClick={() => requestDelete([app.id])} className="w-7 h-7 rounded bg-red-50 text-red-500 hover:bg-red-500 hover:text-white font-bold ml-2 transition-colors">🗑</button>
                          </div>
                        </td>
                      </tr>
                    );
                  } else {
                    const isExpanded = expandedPatients.includes(group.groupKey);
                    const groupIds = group.apps.map(a => a.id);
                    const isAllSelected = groupIds.every(id => selectedAppIds.includes(id));
                    const isSomeSelected = groupIds.some(id => selectedAppIds.includes(id)) && !isAllSelected;

                    return (
                      <React.Fragment key={group.groupKey}>
                        <tr className={`transition-colors border-l-4 ${isExpanded ? 'bg-slate-100 border-amber-400' : 'bg-slate-50 border-transparent hover:bg-slate-100/50'}`}>
                          <td className="px-4 py-4 border-r border-slate-200 text-center">
                            <input type="checkbox" checked={isAllSelected} ref={el => el && (el.indeterminate = isSomeSelected)} onChange={() => toggleSelectGroup(groupIds)} className="w-4 h-4 text-amber-500 rounded border-slate-300 cursor-pointer focus:ring-amber-500" />
                          </td>
                          <td className="px-6 py-4 cursor-pointer" onClick={() => toggleExpandPatient(group.groupKey)}>
                            <div className="font-serif text-slate-900 text-base font-semibold flex items-center gap-2">
                              {group.clientName}
                              <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-bold shadow-sm">{group.apps.length} записи(ей)</span>
                            </div>
                            <div className="text-xs text-amber-600 font-mono mt-1 font-semibold">{group.clientPhone}</div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500" colSpan={2}>
                            Курс процедур / Ближайшая: <strong className="text-slate-800">{group.apps[0].date}</strong>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => toggleExpandPatient(group.groupKey)} className="text-[10px] px-3 py-1.5 bg-white border border-slate-200 rounded text-slate-600 font-bold uppercase hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm">
                              {isExpanded ? '▴ Свернуть' : '▾ Развернуть'}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && group.apps.map((app, index) => {
                          const isSelected = selectedAppIds.includes(app.id);
                          return (
                            <tr key={app.id} className={`bg-white transition-colors border-l-4 border-amber-200 ${isSelected ? 'bg-amber-50/20' : 'hover:bg-slate-50'}`}>
                              <td className="px-4 py-3 border-r border-slate-100 text-center bg-slate-50/50">
                                <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(app.id)} className="w-4 h-4 text-amber-500 rounded border-slate-300 cursor-pointer focus:ring-amber-500" />
                              </td>
                              <td className="px-6 py-3 pl-8 cursor-pointer group" onClick={() => openMedicalCard(app)}>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-400 font-bold">{index + 1}.</span>
                                  <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-500 uppercase tracking-wider font-bold group-hover:text-amber-600 transition-colors shadow-sm">Открыть карту</span>
                                </div>
                              </td>
                              <td className="px-6 py-3 font-medium text-xs text-slate-600">
                                {app.service}
                                {app.sessionNum && <span className="ml-2 text-[9px] text-amber-600 bg-amber-50 px-1 rounded">Сеанс {app.sessionNum}</span>}
                              </td>
                              <td className="px-6 py-3">
                                <div className="text-xs font-semibold text-slate-700">{app.date}</div>
                                <div className="mt-1 flex gap-2 items-center">
                                  {app.status === 'PENDING' && <span className="text-amber-600 text-[9px] font-bold uppercase">Ожидает</span>}
                                  {app.status === 'CONFIRMED' && <span className="text-emerald-600 text-[9px] font-bold uppercase">Подтвержден</span>}
                                  {app.status === 'CANCELLED' && <span className="text-rose-600 text-[9px] font-bold uppercase">Отменен</span>}
                                  {app.payment && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase font-bold border border-emerald-200">Оплачено</span>}
                                </div>
                              </td>
                              <td className="px-6 py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {app.status !== 'CONFIRMED' && <button onClick={() => updateStatus(app.id, 'CONFIRMED')} className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white font-bold transition-colors text-xs">✓</button>}
                                  {app.status !== 'CANCELLED' && <button onClick={() => updateStatus(app.id, 'CANCELLED')} className="w-6 h-6 rounded bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white font-bold transition-colors text-xs">✕</button>}
                                  <button onClick={() => requestDelete([app.id])} className="w-6 h-6 rounded bg-red-50 text-red-500 hover:bg-red-500 hover:text-white font-bold ml-1 transition-colors text-xs">🗑</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  }
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-rose-100 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-3xl mb-4">⚠️</div>
            <h3 className="font-serif text-2xl text-slate-900 mb-2 font-semibold">Подтвердите удаление</h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">Введите PIN-код администратора для безвозвратного удаления {deleteModal.ids.length} записи(ей).</p>
            
            <input type="password" placeholder="****" maxLength={4} value={pinCode} onChange={(e) => setPinCode(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-2xl tracking-[1em] text-slate-900 focus:outline-none focus:border-rose-500 text-center font-bold mb-6" />

            <div className="flex gap-3 w-full">
              <button onClick={() => setDeleteModal({isOpen: false, ids: []})} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase transition-colors">Отмена</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs uppercase shadow-lg shadow-rose-500/20 transition-colors">Удалить</button>
            </div>
          </div>
        </div>
      )}

      {selectedApp && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-6xl w-full shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h3 className="font-serif text-3xl text-slate-900 font-semibold">{selectedApp.clientName}</h3>
                <a href={`tel:${selectedApp.clientPhone}`} className="text-amber-600 text-sm font-mono font-bold">{selectedApp.clientPhone}</a>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={handlePrintConsent} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs uppercase mr-4 transition-colors shadow-md shadow-slate-800/20">
                  📝 Бланк согласия (PDF)
                </button>
                <button onClick={handleOpenCourseModal} className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-500 hover:text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors">+ Назначить курс</button>
                <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-900 text-xl font-bold">✕</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 overflow-y-auto p-6 gap-8">
              
              <div className="flex flex-col gap-6 lg:col-span-1">
                <div>
                  <h4 className="text-xs text-amber-600 uppercase font-bold mb-3 border-b border-slate-200 pb-2">История визитов</h4>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
                    {clientHistory.map((hist) => (
                      <div key={hist.id} onClick={() => openMedicalCard(hist)} className={`p-3 rounded-xl border cursor-pointer hover:border-amber-400 transition-colors ${hist.id === selectedApp.id ? 'bg-amber-50 border-amber-300 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-500 font-mono font-medium">{hist.date}</span>
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${getStatusStyle(hist.status)}`}>{hist.status}</span>
                        </div>
                        <div className="text-sm text-slate-900 font-serif font-semibold">
                          {hist.service}
                          {hist.sessionNum && <span className="ml-2 text-[10px] text-amber-600 bg-amber-50 px-1 rounded border border-amber-100">Сеанс {hist.sessionNum}</span>}
                        </div>
                        {hist.payment && <div className="mt-1 text-[9px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">✓ Оплачено ({hist.payment.amount} €)</div>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs text-amber-600 uppercase font-bold mb-4">Анамнез пациента</h4>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-slate-400 block mb-1 font-bold">Аллергические реакции</label>
                      <input type="text" value={medicalRecord.allergies} onChange={e => setMedicalRecord({...medicalRecord, allergies: e.target.value})} placeholder="Нет / Указать препараты" className="w-full bg-transparent border-b border-slate-300 text-sm text-slate-900 py-1 focus:outline-none focus:border-amber-500 font-medium"/>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-slate-400 block mb-1 font-bold">Хронические заболевания</label>
                      <input type="text" value={medicalRecord.chronicDiseases} onChange={e => setMedicalRecord({...medicalRecord, chronicDiseases: e.target.value})} placeholder="Например: Герпес, диабет..." className="w-full bg-transparent border-b border-slate-300 text-sm text-slate-900 py-1 focus:outline-none focus:border-amber-500 font-medium"/>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6 lg:col-span-2">
                
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
                  <h4 className="text-xs text-emerald-700 uppercase font-bold mb-3 border-b border-emerald-200 pb-2">Финансовый терминал сеанса</h4>
                  {selectedApp.payment ? (
                    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">✓</div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">Оплачено: {selectedApp.payment.amount} €</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{new Date(selectedApp.payment.createdAt).toLocaleDateString('ru-RU')}</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 bg-emerald-100 rounded-lg text-emerald-700 border border-emerald-200">
                        {selectedApp.payment.method === 'CARD' ? '💳 Терминал (EC)' : '💵 Наличные'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <input type="number" step="1" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="Сумма, €" className="flex-1 min-w-[120px] bg-white border border-emerald-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                      <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="bg-white border border-emerald-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-emerald-500">
                        <option value="CARD">💳 Терминал (EC)</option>
                        <option value="CASH">💵 Наличные (Bar)</option>
                        <option value="TRANSFER">🏦 Перевод (Überweisung)</option>
                      </select>
                      <button onClick={handlePaymentSubmit} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md shadow-emerald-500/20">Провести оплату</button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs text-amber-600 uppercase font-bold mb-3 border-b border-slate-200 pb-2">План лечения</h4>
                    <input type="text" value={medicalRecord.procedurePlan} onChange={e => setMedicalRecord({...medicalRecord, procedurePlan: e.target.value})} placeholder="Например: Курс 10 процедур. Сейчас 2 из 10." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-500" />
                  </div>
                  <div className="flex-grow flex flex-col">
                    <h4 className="text-xs text-amber-600 uppercase font-bold mb-3 border-b border-slate-200 pb-2 flex justify-between items-end">
                      <span>Заметки сеанса</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{selectedApp?.date}</span>
                    </h4>
                    <textarea value={medicalRecord.sessionNotes} onChange={e => setMedicalRecord({...medicalRecord, sessionNotes: e.target.value})} placeholder="Параметры аппарата, реакция кожи..." className="w-full flex-grow min-h-[100px] bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 font-medium focus:border-amber-500 focus:outline-none resize-none"></textarea>
                  </div>
                </div>

                <div className="flex-grow flex flex-col bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
                  <h4 className="text-xs text-amber-700 uppercase font-bold mb-3 border-b border-amber-200 pb-2 flex justify-between items-end">
                    <span>Лист назначений (Рецепт)</span>
                    <button onClick={handlePrintPrescription} className="text-amber-600 hover:text-amber-800 transition-colors flex items-center gap-1 font-bold bg-white px-3 py-1 rounded shadow-sm border border-amber-200">🖨 Распечатать</button>
                  </h4>
                  <textarea value={medicalRecord.prescription || ''} onChange={e => setMedicalRecord({...medicalRecord, prescription: e.target.value})} placeholder="Укажите препараты, домашний уход, рекомендации для выдачи пациенту..." className="w-full flex-grow min-h-[120px] bg-white border border-amber-200 rounded-xl p-4 text-sm text-slate-900 font-medium focus:border-amber-500 focus:outline-none resize-none"></textarea>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 shrink-0">
              <button onClick={saveNotes} className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20">Сохранить данные сеанса</button>
            </div>
          </div>
        </div>
      )}

      {showCourseModal && (
        <div className="fixed inset-0 z-[55] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-serif text-2xl text-slate-900 font-semibold">Сформировать курс</h3>
              <button onClick={() => setShowCourseModal(false)} className="text-slate-400 hover:text-slate-900 text-xl font-bold">✕</button>
            </div>
            <form onSubmit={handleCourseSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Пациент</span>
                  <div className="font-serif text-lg text-slate-900 font-semibold">{courseData.firstName} {courseData.lastName}</div>
                  <div className="text-xs font-mono text-slate-600">{courseData.phone}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-lg font-bold">✓</div>
              </div>
              <div>
                <label className="text-xs uppercase text-slate-500 font-bold mb-1 block">Процедура</label>
                <select value={courseData.service} onChange={e => setCourseData({...courseData, service: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none font-medium">
                  {SERVICES.map((s, i) => (
                    <option key={i} value={s.title}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="text-xs uppercase text-slate-500 font-bold mb-3 block">График сеансов</label>
                <div className="flex flex-col gap-4">
                  {courseData.sessions.map((session, index) => {
                    const isValid = isSessionValid(session, index, courseData.service);
                    return (
                      <div key={index} className="flex flex-col gap-1">
                        <div className="flex gap-3 items-center">
                          <div className="font-bold text-slate-400 text-xs w-5 text-right">{index + 1}.</div>
                          <input type="date" required value={session.date} onChange={e => updateSession(index, 'date', e.target.value)} className={`flex-1 bg-white border rounded-lg px-3 py-2 text-sm focus:outline-none font-medium transition-colors ${!isValid ? 'border-rose-500 text-rose-600 focus:border-rose-500' : 'border-slate-200 focus:border-amber-500'}`} />
                          <input type="time" required value={session.time} onChange={e => updateSession(index, 'time', e.target.value)} className={`w-28 bg-white border rounded-lg px-3 py-2 text-sm focus:outline-none font-medium transition-colors ${!isValid ? 'border-rose-500 text-rose-600 focus:border-rose-500' : 'border-slate-200 focus:border-amber-500'}`} />
                          {index > 0 ? <button type="button" onClick={() => removeSession(index)} className="text-rose-500 hover:bg-rose-100 p-2 rounded-lg transition-colors">✕</button> : <div className="w-8"></div>}
                        </div>
                        {!isValid && <div className="text-[10px] text-rose-500 font-bold uppercase pl-11">Время пересекается с другой записью</div>}
                      </div>
                    );
                  })}
                </div>
                <button type="button" onClick={addSession} className="w-full mt-4 py-2.5 border border-dashed border-amber-300 text-amber-600 rounded-lg text-xs font-bold uppercase hover:bg-amber-100 transition-colors">+ Добавить визит</button>
              </div>
              <div className="pt-2 flex justify-end gap-3 mt-2 shrink-0">
                <button type="button" onClick={() => setShowCourseModal(false)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors">Отмена</button>
                <button type="submit" disabled={hasConflicts} className={`px-6 py-3 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors ${hasConflicts ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20'}`}>
                  Создать записи
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}