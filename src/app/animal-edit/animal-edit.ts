import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

// --- เพิ่ม Import ToastService ---
import { ToastService } from '../services/toast'; 

@Component({
  selector: 'app-animal-edit',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './animal-edit.html',
  styleUrl: './animal-edit.css',
})
export class AnimalEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);
  // --- เพิ่มการ Inject ToastService ---
  private toast = inject(ToastService); 

  API_BASE = environment.apiUrl;

  animalId = signal<string | null>(null);

  name = signal('');
  species = signal('');
  status = signal('');
  description = signal('');

  loading = signal(true);

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`,
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.animalId.set(id);

    this.http
      .get<any>(`${this.API_BASE}/api/animals/${id}/`, {
        headers: this.authHeaders(),
      })
      .subscribe({
        next: (data) => {
          this.name.set(data.name);
          this.species.set(data.species);
          this.status.set(data.status);
          this.description.set(data.description || '');
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Fehler beim Laden:', err);
          this.loading.set(false);
        },
      });
  }

  save(): void {
    const id = this.animalId();

    const formData = new FormData();
    formData.append('name', this.name());
    formData.append('species', this.species());
    formData.append('status', this.status());
    formData.append('description', this.description());

    this.http
      .put(`${this.API_BASE}/api/animals/${id}/`, formData, {
        headers: this.authHeaders(),
      })
      .subscribe({
        // --- ส่วนที่มีการแก้ไขตามรูปภาพที่ส่งมา ---
        next: () => {
          this.toast.success('Tier erfolgreich aktualisiert'); // แจ้งเตือนสำเร็จ
          this.router.navigate(['/animals', id]); // ย้ายไปหน้าแสดงรายละเอียด
        },
        error: (err) => {
          console.error('Fehler beim Speichern:', err);
          this.toast.error('Fehler beim Speichern'); // แจ้งเตือนเมื่อผิดพลาด
        },
        // ------------------------------------
      });
  }

  cancel(): void {
    const id = this.animalId();
    this.router.navigate(['/animals', id]);
  }
}