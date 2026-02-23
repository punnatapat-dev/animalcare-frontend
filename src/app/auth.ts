import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly API = 'http://127.0.0.1:8000';

  login(credentials: { username: string; password: string }): Observable<{ access: string; refresh: string }> {
    return this.http
      .post<{ access: string; refresh: string }>(`${this.API}/api/token/`, credentials)
      .pipe(
        tap((res) => {
          localStorage.setItem('access_token', res.access);
          localStorage.setItem('refresh_token', res.refresh);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}