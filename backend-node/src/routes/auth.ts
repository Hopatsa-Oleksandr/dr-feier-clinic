import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';

const router = Router();
const prisma = new PrismaClient();

// Настройка почтового отправщика
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

// 1. ЛОГИН (переведен на базу данных)
router.post('/login', async (req: Request, res: Response) => {
  const { password } = req.body;

  try {
    let admin = await prisma.admin.findFirst();

    // Авто-создание админа при пустой базе
    if (!admin) {
      if (!process.env.ADMIN_PASSWORD || !process.env.SMTP_EMAIL) {
        return res.status(500).json({ success: false, error: 'Настройте ADMIN_PASSWORD и SMTP_EMAIL в .env' });
      }
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      admin = await prisma.admin.create({
        data: {
          email: process.env.SMTP_EMAIL,
          password: hashedPassword
        }
      });
    }

    // Проверка пароля из базы
    const isValid = await bcrypt.compare(password, admin.password);
    
    // Временный fallback для старого пароля из .env
    if (isValid || password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { role: 'admin', id: admin.id }, 
        process.env.JWT_SECRET as string, 
        { expiresIn: '24h' }
      );
      return res.json({ success: true, token });
    }

    return res.status(401).json({ success: false, error: 'Неверный пароль' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
});

// 2. ГЕНЕРАЦИЯ И ОТПРАВКА КОДА
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  
  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(404).json({ error: 'Администратор с таким email не найден' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 минут

    await prisma.admin.update({
      where: { email },
      data: { resetCode, resetCodeExpiry }
    });

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Код восстановления пароля - Dr. Feier CLINIC',
      text: `Ваш код для сброса пароля: ${resetCode}\nКод действителен 15 минут.`
    });

    res.json({ success: true, message: 'Код отправлен на email' });
  } catch (error) {
    console.error('Ошибка при запросе кода:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// 3. ПРОВЕРКА КОДА И СМЕНА ПАРОЛЯ
router.post('/reset-password', async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) return res.status(404).json({ error: 'Пользователь не найден' });
    if (admin.resetCode !== code) return res.status(400).json({ error: 'Неверный код' });
    if (!admin.resetCodeExpiry || admin.resetCodeExpiry < new Date()) {
      return res.status(400).json({ error: 'Срок действия кода истек' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
      where: { email },
      data: { 
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiry: null
      }
    });

    res.json({ success: true, message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Ошибка при смене пароля:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;