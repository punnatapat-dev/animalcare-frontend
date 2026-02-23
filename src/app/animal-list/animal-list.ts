import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-animal-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './animal-list.html',
  styleUrl: './animal-list.css'
})
export class AnimalListComponent implements OnInit {
  // ✅ ใช้ base เดียวกันทั้งหมด (สำคัญ)
  API_BASE = 'http://localhost:8000';

  animals = signal<any[]>([]);
  newAnimalName = signal('');
  newAnimalSpecies = signal('');
  selectedImage = signal<File | null>(null);

  editingAnimalId = signal<number | null>(null);

  private http = inject(HttpClient);

  ngOnInit() {
    this.loadAnimals();
  }

  loadAnimals() {
    this.http.get(`${this.API_BASE}/api/animals/`).subscribe({
      next: (data: any) => {
        this.animals.set(data.results);
      },
      error: (err) => console.error('Fehler beim Laden:', err)
    });
  }

  // ✅ แปลง path ของรูปให้ถูกเสมอ (รองรับทั้ง /media/... และ http...)
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingAnimalId.set(null);
    this.newAnimalName.set('');
    this.newAnimalSpecies.set('');
  }

  onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.selectedImage.set(file);
  }
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
    this.http
      .put(`${this.API_BASE}/api/animals/${this.editingAnimalId()}/`, formData)
      .subscribe({
        next: () => {
          this.loadAnimals();
          this.cancelEdit();
          this.selectedImage.set(null);
        },
        error: (err) => console.error('Fehler beim Update:', err)
      });
  } else {
    this.http
      .post(`${this.API_BASE}/api/animals/`, formData)
      .subscribe({
        next: () => {
          this.loadAnimals();
          this.newAnimalName.set('');
          this.newAnimalSpecies.set('');
          this.selectedImage.set(null);
        },
        error: (err) => console.error('Fehler beim Hinzufügen:', err)
      });
  }
}

  deleteAnimal(id: number) {
    if (confirm('Möchten Sie dieses Tier wirklich löschen?')) {
      this.http.delete(`${this.API_BASE}/api/animals/${id}/`).subscribe({
        next: () => {
          this.animals.update((items) => items.filter((a) => a.id !== id));
          console.log('Tier erfolgreich gelöscht!');
        },
        error: (err) => console.error('Fehler:', err)
      });
    }
  }
}