import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const API_BASE = 'http://localhost:8000';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const http = inject(HttpClient);

  const access = localStorage.getItem('access_token');
  const refresh = localStorage.getItem('refresh_token');

  // ✅ 1) แนบ access token ให้ทุก request (ถ้ามี)
  const authReq = access
    ? req.clone({ setHeaders: { Authorization: `Bearer ${access}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // ✅ 2) ถ้าโดน 401 และมี refresh token => ยิง refresh
      if (err.status === 401 && refresh) {
        return http
          .post<{ access: string }>(`${API_BASE}/api/token/refresh/`, {
            refresh: refresh,
          })
          .pipe(
            switchMap((res) => {
              // ✅ ได้ access ใหม่ -> เก็บ -> ยิง request เดิมซ้ำ
              localStorage.setItem('access_token', res.access);

              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${res.access}` },
              });

              return next(retryReq);
            }),
            catchError((refreshErr) => {
              // ❌ refresh ใช้ไม่ได้ -> ล้าง token -> ไปหน้า login
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              router.navigate(['/login']);
              return throwError(() => refreshErr);
            })
          );
      }

      // ถ้า error อื่น ๆ ก็ปล่อยไปตามเดิม
      return throwError(() => err);
    })
  );
};