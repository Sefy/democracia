import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {env} from "../env";

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, env.SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Token non valide ou expiré' });
      }

      console.log('Verify JWT, result = ', user);

      req.user = user; // Attacher les informations utilisateur au request
      next();
    });
  } else {
    res.status(401).json({ message: 'Token manquant' });
  }
};
