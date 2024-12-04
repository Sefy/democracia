import {HttpEvent, HttpHandlerFn, HttpHeaders, HttpRequest} from '@angular/common/http';
import {inject} from "@angular/core";
import {Observable} from "rxjs";
import {AuthService} from "@app/services/auth.service";

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const auth = inject(AuthService);
  const token = auth.currentToken;

  if (!token) {
    return next(req);
  }

  const headers = new HttpHeaders({
    Authorization: "Bearer " + token
  });

  return next(req.clone({headers}));
}
