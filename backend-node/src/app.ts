import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bookingRouter from './routes/booking';
import authRouter from './routes/auth';

const app = express();
app.use(express.json());
app.use(cors());

// Строгий лимитер ТОЛЬКО для создания новых записей (защита от спама на сайте)
const createBookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." }
});

// Открытый маршрут для входа в панель
app.use('/api/auth', authRouter);

// Применяем лимитер локально только на создание бронирования, а не на всю админку
app.use('/api/appointments', (req, res, next) => {
  if (req.method === 'POST') {
    return createBookingLimiter(req, res, next);
  }
  next();
}, bookingRouter);

// Остальные маршруты бэкенда работают без жестких ограничений для админа
app.use('/api', bookingRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend läuft auf Port ${PORT}`));