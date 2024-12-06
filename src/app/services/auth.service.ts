import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from "rxjs";
import { LoginData, PublicUser, UserRole } from "@common/user";
import { ApiService } from "@app/services/api.service";
import { HttpClient } from "@angular/common/http";

const TOKEN_STORAGE_KEY = 'user_token';

export interface CurrentUser extends PublicUser {
  token: string;
  role?: UserRole;
}

interface LoginResponse {
  ok: boolean;
  user?: CurrentUser;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService extends ApiService {
  currentUser$ = new BehaviorSubject<CurrentUser | null>(null);
  currentToken$ = new BehaviorSubject<string | null>(null);

  constructor(
    http: HttpClient,
  ) {
    super(http);

    this.apiUrl = this.apiUrl + '/auth';
  }

  get currentUser(): CurrentUser | null {
    return this.currentUser$.value;
  }

  set currentUser(value: CurrentUser) {
    this.currentUser$.next(value);
  }

  get isLogged() {
    return !!this.currentUser;
  }

  get currentToken(): string | null {
    return this.currentToken$.value;
  }

  set currentToken(value: string) {
    this.currentToken$.next(value);
    this.setTokenInStorage(value);
  }

  hasRole(role: UserRole) {
    const userRole = this.currentUser?.role;

    console.log('HAS ROLE ?', userRole, role);

    return (role === 'USER' && !!userRole) ||
      (role === 'MODERATOR' && (userRole === 'MODERATOR' || userRole === 'ADMIN')) ||
      (role === 'ADMIN' && userRole === 'ADMIN');
  }

  login(data: LoginData) {
    return this.post<LoginResponse>('/login', data).pipe(
      tap(res => {
        console.log('Login Response : ', res);

        if (res.user) {
          this.currentUser$.next(res.user);
          this.setTokenInStorage(res.user.token);
        }
      })
    );
  }

  logout() {
    return this.http.post<LoginResponse>(this.apiUrl + '/logout', {}).pipe(
      tap(res => {
        if (res.ok) {
          this.currentUser$.next(null);
        }
      })
    );
  }

  loadUser() {
    return this.http.get<{ user?: CurrentUser }>(this.apiUrl + '/get-session').pipe(
      tap(res => {
        if (res.user) {
          this.currentUser = res.user;
        }
      })
    );
  }

  loginWithGoogleAuth(credential: string) {
    return this.post<{ token?: string, firstLogin?: boolean }>('/login-google', {token: credential});
  }

  setTokenInStorage(token: string) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  loadTokenFromStorage() {
    this.currentToken = localStorage.getItem(TOKEN_STORAGE_KEY) ?? '';
  }

  setUsername(username: string) {
    return this.post<{ ok: boolean, error?: string }>('/set-username', {username}).pipe(
      tap(res => {
        if (res.ok && this.currentUser) {
          this.currentUser.username = username;
        }
      })
    )
  }
}
