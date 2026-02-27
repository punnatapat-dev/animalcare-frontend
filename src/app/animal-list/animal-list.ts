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

  // ✅ Pagination (ถ้า backend ปิด pagination -> next/prev จะเป็น null และปุ่มจะกดไม่ได้เอง)
  nextUrl = signal<string | null>(null);
  prevUrl = signal<string | null>(null);
  currentPage = signal<number>(1);

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

  // ✅ โหลดสัตว์: รองรับทั้งแบบมี pagination และไม่มี
  loadAnimals(url?: string) {
    const targetUrl =
      url ?? `${this.API_BASE}/api/animals/?page=${this.currentPage()}`;

    this.http
      .get(targetUrl, { headers: this.authHeaders() })
      .subscribe({
        next: (data: any) => {
          // ✅ ถ้า data เป็น array -> backend ปิด pagination
          // ✅ ถ้า data เป็น object -> ใช้ data.results (มี pagination)
          const items = Array.isArray(data) ? data : data?.results;

          this.animals.set(items ?? []);

          // ถ้า backend ปิด pagination -> next/prev ไม่มี ให้เป็น null
          this.nextUrl.set(data?.next ?? null);
          this.prevUrl.set(data?.previous ?? null);
        },
        error: (err) => console.error('Fehler beim Laden:', err),
      });
  }

  goNext() {
    if (!this.nextUrl()) return;
    this.currentPage.update((p) => p + 1);
    this.loadAnimals(this.nextUrl()!);
  }

  goPrev() {
    if (!this.prevUrl()) return;
    this.currentPage.update((p) => Math.max(1, p - 1));
    this.loadAnimals(this.prevUrl()!);
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

    if (this.editingAnimalId()) {
      // ✅ UPDATE (PATCH)
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
            // ถ้า backend ยังมี pagination จะกลับหน้า 1 ให้เห็นตัวใหม่
            this.currentPage.set(1);
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
    if (!confirm('Möchten Sie dieses Tier wirklich löschen?')) return;

    this.http
      .delete(`${this.API_BASE}/api/animals/${id}/`, {
        headers: this.authHeaders(),
      })
      .subscribe({
        next: () => {
          this.animals.update((items) => items.filter((a) => a.id !== id));

          // ถ้า backend มี pagination และลบจนหน้านี้ว่าง ให้ถอยกลับ
          if (this.animals().length === 0 && this.prevUrl()) {
            this.goPrev();
          } else {
            this.loadAnimals();
          }
        },
        error: (err) => console.error('Fehler:', err),
      });
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }
}