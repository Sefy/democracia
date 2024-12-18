import { UserData } from "@common/user";

declare global {
  namespace Express {
    interface Request {
      user?: UserData | { id: string|number, email?: string };
    }
  }
}
