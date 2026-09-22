import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ success: false, error: 'Нет доступа. Требуется токен.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
    next(); // Токен валиден, пропускаем запрос дальше
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Недействительный или просроченный токен' });
  }
};