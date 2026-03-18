import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // เพิ่ม HttpClient

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule], // เพิ่ม HttpClientModule ตรงนี้
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  // เปลี่ยนมาใช้ HttpClient โดยตรงเพื่อระบุ URL ของ Django ให้ชัดเจน
  constructor(
    private http: HttpClient, 
    private router: Router
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

    // ระบุ URL ของ Django ที่รันอยู่ที่พอร์ต 8000 (ตรวจสอบ Path /api/token/ )
    const djangoUrl = 'http://127.0.0.1:8000/api/token/'; 

    this.http.post<{ access: string; refresh: string }>(djangoUrl, credentials).subscribe({
      next: (response) => {
        // ✅ เก็บ token ลงเครื่อง
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);

        console.log('Login erfolgreich!', response);

        // ✅ ล็อกอินผ่านแล้ว เด้งไปหน้า animals
        this.router.navigate(['/animals']);
      },
      error: (err) => {
        console.error('Login-Fehler:', err);
        // ถ้าขึ้น error นี้ ให้เช็กที่ Terminal ของ Django ว่าได้รับ Request หรือไม่
        this.errorMessage = 'Ungültiger Benutzername oder Passwort หรือปัญหาการเชื่อมต่อ Server';
      },
    });
  }
}