import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// Надежный обработчик вебхуков для n8n
const sendWebhook = async (url: string, payload: any) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      console.error(`[Webhook Error] n8n вернул статус ${response.status} для ${url}`);
    } else {
      console.log(`[Webhook Success] Данные отправлены на ${url}`);
    }
  } catch (error) {
    console.error(`[Webhook Failed] Нет связи с n8n по адресу ${url}. Убедитесь, что n8n запущен.`, error);
  }
};

// ==========================================
// НОВЫЙ МАРШРУТ: ПОЛУЧЕНИЕ ЗАНЯТОГО ВРЕМЕНИ И ПРОЦЕДУР
// ==========================================
router.get('/appointments/booked', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date || typeof date !== 'string') {
      return res.json({ success: true, bookedAppointments: [] });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        date: { startsWith: date },
        status: { in: ['PENDING', 'CONFIRMED'] }
      },
      select: { date: true, service: true } // Берем время и название услуги
    });

    const bookedAppointments = appointments.map(app => ({
      time: app.date.split(' ')[1],
      service: app.service
    }));

    return res.json({ success: true, bookedAppointments });
  } catch (error) {
    console.error('Ошибка получения занятых слотов:', error);
    return res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});


// 1. Создание одиночного бронирования клиентом
router.post('/appointments', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, email, service, date, time } = req.body;
    if (!phone || !service || !date || !time) {
      return res.status(400).json({ success: false, error: 'Не все обязательные поля заполнены' });
    }
    const clientName = [firstName, lastName].filter(Boolean).join(' ').trim() || 'Клиент';
    const dateTime = `${date.trim()} ${time.trim()}`;

    const existingAppointment = await prisma.appointment.findFirst({
      where: { date: dateTime, status: { in: ['PENDING', 'CONFIRMED'] } }
    });
    if (existingAppointment) {
      return res.status(400).json({ success: false, error: 'Время занято' });
    }

    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({ data: { name: clientName, phone, email } });
    } else if (email && !user.email) {
      user = await prisma.user.update({ where: { phone }, data: { email } });
    }

    const appointment = await prisma.appointment.create({
      data: { userId: user.id, clientName, clientPhone: phone, clientEmail: email, service, date: dateTime, status: 'PENDING' }
    });

    // Отправка вебхука (не блокирует ответ клиенту)
    sendWebhook('http://127.0.0.1:5678/webhook/new-booking', {
      event: 'new_booking',
      appointmentId: appointment.id,
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone,
      clientEmail: appointment.clientEmail,
      service: appointment.service,
      date: appointment.date,
      status: appointment.status
    });

    return res.status(201).json({ success: true, appointment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// 2. Получение всех записей (с включенными данными об оплате)
router.get('/appointments', verifyToken, async (req: Request, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany({ 
      orderBy: { createdAt: 'desc' },
      include: { payment: true } 
    });
    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// 3. Изменение статуса записи врачом
router.patch('/appointments/:id/status', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['CONFIRMED', 'CANCELLED', 'PENDING'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Неверный статус' });
    }

    const updated = await prisma.appointment.update({ where: { id }, data: { status }, include: { payment: true } });
    
    // Отправка вебхука
    sendWebhook('http://127.0.0.1:5678/webhook/clinic-status', {
      event: 'status_changed',
      appointmentId: updated.id,
      clientName: updated.clientName,
      clientPhone: updated.clientPhone,
      clientEmail: updated.clientEmail,
      service: updated.service,
      date: updated.date,
      newStatus: updated.status
    });
    
    return res.json({ success: true, appointment: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// 4. Сохранение заметок врача
router.patch('/appointments/:id/notes', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const updated = await prisma.appointment.update({ where: { id }, data: { notes }, include: { payment: true } });
    return res.json({ success: true, appointment: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// 5. Полное удаление записи
router.delete('/appointments/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    await prisma.appointment.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// 6. Пакетное создание курса процедур врачом (Гибкий график сеансов)
router.post('/appointments/course', verifyToken, async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phone, email, service, sessions } = req.body;

    if (!phone || !service || !sessions || !Array.isArray(sessions) || sessions.length === 0) {
      return res.status(400).json({ success: false, error: 'Неверные данные: добавьте хотя бы один сеанс' });
    }

    const clientName = [firstName, lastName].filter(Boolean).join(' ').trim() || 'Клиент';
    const seriesId = `series_${Date.now()}`; 
    const createdAppointments = [];

    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({ data: { name: clientName, phone, email } });
    } else if (email && !user.email) {
      user = await prisma.user.update({ where: { phone }, data: { email } });
    }

    for (let i = 0; i < sessions.length; i++) {
      const { date, time } = sessions[i];
      if (!date || !time) continue;

      const dateTime = `${date.trim()} ${time.trim()}`;

      const appointment = await prisma.appointment.create({
        data: {
          userId: user.id, clientName, clientPhone: phone, clientEmail: email,
          service, date: dateTime, status: 'CONFIRMED', seriesId, sessionNum: i + 1
        },
        include: { payment: true }
      });

      createdAppointments.push(appointment);
    }

    return res.status(201).json({ success: true, count: createdAppointments.length, seriesId });
  } catch (error) {
    console.error('Ошибка при создании курса процедур:', error);
    return res.status(500).json({ success: false, error: 'Ошибка сервера при сохранении курса' });
  }
});

// ==========================================
// ФИНАНСОВЫЙ БЛОК (БУХГАЛТЕРИЯ)
// ==========================================

router.post('/finance/payment', verifyToken, async (req: Request, res: Response) => {
  try {
    const { appointmentId, amount, method } = req.body; 
    if (!appointmentId || !amount || !method) return res.status(400).json({ success: false, error: 'Не все данные об оплате переданы' });

    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) return res.status(404).json({ success: false, error: 'Запись не найдена' });

    const taxRate = 19.0;
    const payment = await prisma.payment.create({
      data: { appointmentId, userId: appointment.userId, amount: parseFloat(amount), method, taxRate }
    });

    return res.json({ success: true, payment });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Ошибка при сохранении оплаты' });
  }
});

router.post('/finance/expense', verifyToken, async (req: Request, res: Response) => {
  try {
    const { title, category, amount, isDeductible } = req.body;
    if (!title || !category || !amount) return res.status(400).json({ success: false, error: 'Заполните название, категорию и сумму расхода' });

    const expense = await prisma.expense.create({
      data: { title, category, amount: parseFloat(amount), isDeductible: isDeductible ?? true }
    });

    return res.json({ success: true, expense });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Ошибка при сохранении расхода' });
  }
});

router.get('/finance/summary', verifyToken, async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany();
    const expenses = await prisma.expense.findMany();

    let totalIncomeBrutto = 0; 
    let totalTaxToPay = 0;     
    
    payments.forEach(p => {
      totalIncomeBrutto += p.amount;
      if (p.taxRate > 0) totalTaxToPay += p.amount - (p.amount / (1 + p.taxRate / 100));
    });

    const totalIncomeNetto = totalIncomeBrutto - totalTaxToPay; 
    let totalExpenses = 0;     
    expenses.forEach(e => { totalExpenses += e.amount; });
    const netProfit = totalIncomeNetto - totalExpenses; 

    return res.json({
      success: true,
      summary: {
        totalIncomeBrutto: totalIncomeBrutto.toFixed(2),
        totalTaxToPay: totalTaxToPay.toFixed(2),
        totalIncomeNetto: totalIncomeNetto.toFixed(2),
        totalExpenses: totalExpenses.toFixed(2),
        netProfit: netProfit.toFixed(2),
      },
      payments, expenses
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Ошибка при формировании финансового отчета' });
  }
});

// ==========================================
// БЛОК ОТЗЫВОВ (REVIEWS)
// ==========================================

router.get('/reviews', async (req: Request, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

router.post('/reviews', async (req: Request, res: Response) => {
  try {
    const { author, rating, text, source } = req.body;
    if (!author || !rating || !text) return res.status(400).json({ success: false, error: 'Заполните обязательные поля' });
    const review = await prisma.review.create({
      data: { author, rating: Number(rating), text, source: source || 'SITE' }
    });
    return res.status(201).json({ success: true, review });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

router.delete('/reviews/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

router.patch('/reviews/:id/reply', verifyToken, async (req: Request, res: Response) => {
  try {
    const { reply } = req.body;
    const review = await prisma.review.update({
      where: { id: req.params.id }, data: { reply }
    });
    return res.json({ success: true, review });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Ошибка сохранения ответа' });
  }
});

export default router;