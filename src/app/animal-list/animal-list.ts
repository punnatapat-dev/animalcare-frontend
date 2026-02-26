import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-animal-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './animal-list.html',
  styleUrl: './animal-list.css',
})
export class AnimalListComponent implements OnInit {
  API_BASE = 'http://127.0.0.1:8000';

  animals = signal<any[]>([]);
  newAnimalName = signal('');
  newAnimalSpecies = signal('');
  selectedImage = signal<File | null>(null);

  editingAnimalId = signal<number | null>(null);

  private http = inject(HttpClient);
  private router = inject(Router);

  ngOnInit() {
    this.loadAnimals();
  }

  // ✅ ดึง token มาใส่ header
  private authHeaders(): HttpHeaders {
  const token = localStorage.getItem('access_token');
  return token
    ? new HttpHeaders({ Authorization: `Bearer ${token}` })
    : new HttpHeaders();
}

  loadAnimals() {
    this.http.get(`${this.API_BASE}/api/animals/`).subscribe({
      next: (data: any) => {
        this.animals.set(data.results);
      },
      error: (err) => console.error('Fehler beim Laden:', err),
    });
  }

  getImageUrl(image: string | null): string | null {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    if (image.startsWith('/')) return this.API_BASE + image;
    return this.API_BASE + '/' + image;
  }

  prepareEdit(animal: any) {
    this.editingAnimalId.set(animal.id);
    this.newAnimalName.set(animal.name);
    this.newAnimalSpecies.set(animal.species);
    this.selectedImage.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingAnimalId.set(null);
    this.newAnimalName.set('');
    this.newAnimalSpecies.set('');
    this.selectedImage.set(null);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedImage.set(file);
  }

  submitForm() {
    if (!this.newAnimalName() || !this.newAnimalSpecies()) return;

    const formData = new FormData();
    formData.append('name', this.newAnimalName());
    formData.append('species', this.newAnimalSpecies());
    formData.append('status', 'AVAILABLE');

    if (this.selectedImage()) {
      formData.append('image', this.selectedImage()!);
    }

    // ✅ UPDATE (ใช้ PATCH ปลอดภัยกว่า PUT)
    if (this.editingAnimalId()) {
      this.http
        .patch(
          `${this.API_BASE}/api/animals/${this.editingAnimalId()}/`,
          formData,
          { headers: this.authHeaders() }
        )
        .subscribe({
          next: () => {
            this.loadAnimals();
            this.cancelEdit();
          },
          error: (err) => console.error('Fehler beim Update:', err),
        });
    } else {
      // ✅ CREATE
      this.http
        .post(`${this.API_BASE}/api/animals/`, formData, {
          headers: this.authHeaders(),
        })
        .subscribe({
          next: () => {
            this.loadAnimals();
            this.newAnimalName.set('');
            this.newAnimalSpecies.set('');
            this.selectedImage.set(null);
          },
          error: (err) => console.error('Fehler beim Hinzufügen:', err),
        });
    }
  }

  deleteAnimal(id: number) {
    if (confirm('Möchten Sie dieses Tier wirklich löschen?')) {
      this.http
        .delete(`${this.API_BASE}/api/animals/${id}/`, {
          headers: this.authHeaders(),
        })
        .subscribe({
          next: () => {
            this.animals.update((items) =>
              items.filter((a) => a.id !== id)
            );
          },
          error: (err) => console.error('Fehler:', err),
        });
    }
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }
}