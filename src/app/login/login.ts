import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onLogin(event: Event): void {
    event.preventDefault();

    // เคลียร์ error เก่า
    this.errorMessage = '';

    // กันค่าว่าง
    if (!this.username || !this.password) {
      this.errorMessage = 'Bitte Benutzername und Passwort eingeben.';
      return;
    }

    const credentials = { username: this.username, password: this.password };

    this.authService.login(credentials).subscribe({
      next: (response: { access: string; refresh: string }) => {
        // ✅ เก็บ token
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);

        console.log('Login erfolgreich!', response);

        // ✅ เด้งไป animals
        this.router.navigate(['/animals']);
      },
      error: (err) => {
        console.error('Login-Fehler:', err);
        this.errorMessage = 'Ungültiger Benutzername oder Passwort.';
      },
    });
  }
}