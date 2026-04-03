import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
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
  private toast = inject(ToastService);

  API_BASE = environment.apiUrl;

  animalId = signal<string | null>(null);
  name = signal('');
  species = signal('');
  status = signal('');
  description = signal('');
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
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
          this.imagePreview.set(data.image_url || null);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Fehler beim Laden:', err);
          this.loading.set(false);
        },
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;

    this.selectedImage.set(file);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      this.imagePreview.set(previewUrl);
    }
  }

  save(): void {
    const id = this.animalId();
    const formData = new FormData();
    formData.append('name', this.name());
    formData.append('species', this.species());
    formData.append('status', this.status());
    formData.append('description', this.description());

    if (this.selectedImage()) {
      formData.append('image', this.selectedImage()!);
    }

    this.http
      .put(`${this.API_BASE}/api/animals/${id}/`, formData, {
        headers: this.authHeaders(),
      })
      .subscribe({
        next: () => {
          this.toast.success('Tier erfolgreich aktualisiert');
          this.router.navigate(['/animals', id]);
        },
        error: (err) => {
          console.error('Fehler beim Speichern:', err);
          this.toast.error('Fehler beim Speichern');
        },
      });
  }

  cancel(): void {
    const id = this.animalId();
    this.router.navigate(['/animals', id]);
  }
}