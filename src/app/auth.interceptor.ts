import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';

const API_HOSTS = ['http://localhost:8000', 'http://127.0.0.1:8000'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const http = inject(HttpClient);

  const isApiCall = API_HOSTS.some((base) => req.url.startsWith(base));

  const access = localStorage.getItem('access_token');
  const authReq =
    isApiCall && access
      ? req.clone({ setHeaders: { Authorization: `Bearer ${access}` } })
      : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      const refresh = localStorage.getItem('refresh_token');

      const isAuthError = err.status === 401 || err.status === 403;
      const isRefreshCall = req.url.includes('/api/token/refresh/');

      // backend ของคุณตอบ token_not_valid + "Token is expired"
      const tokenNotValid =
        (err.error as any)?.code === 'token_not_valid' ||
        (typeof (err.error as any)?.detail === 'string' &&
          (err.error as any).detail.toLowerCase().includes('token'));

      if (isApiCall && isAuthError && tokenNotValid && refresh && !isRefreshCall) {
        const apiBase = API_HOSTS.find((base) => req.url.startsWith(base)) ?? API_HOSTS[0];

        return http
          .post<{ access: string }>(`${apiBase}/api/token/refresh/`, { refresh })
          .pipe(
            switchMap((res) => {
              localStorage.setItem('access_token', res.access);

              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${res.access}` },
              });

              return next(retryReq);
            }),
            catchError((refreshErr) => {
              // refresh token ใช้ไม่ได้/หมดอายุ -> logout
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              router.navigate(['/login']);
              return throwError(() => refreshErr);
            })
          );
      }

      return throwError(() => err);
    })
  );
};