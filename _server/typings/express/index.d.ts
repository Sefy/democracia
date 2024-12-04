import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {email: string} | JwtPayload | string; // Ou définissez votre propre type pour 'user'
    }
  }
}
