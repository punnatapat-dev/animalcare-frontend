import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

  API_BASE = 'https://animalcare-backend.onrender.com';

  animals = signal<any[]>([]);
  newAnimalName = signal('');
  newAnimalSpecies = signal('');
  selectedImage = signal<File | null>(null);

  editingAnimalId = signal<number | null>(null);

  nameError = signal('');
  successMessage = signal('');

  nextUrl = signal<string | null>(null);
  prevUrl = signal<string | null>(null);
  currentPage = signal<number>(1);

  searchQuery = signal<string>('');
  selectedSpecies = signal<string>('ALL');

  speciesOptions: string[] = ['ALL', 'DOG', 'CAT', 'RABBIT', 'OTHER'];

  private http = inject(HttpClient);
  private router = inject(Router);

  ngOnInit() {
    this.loadAnimals();
  }

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  loadAnimals(url?: string) {

    const targetUrl =
      url ?? `${this.API_BASE}/api/animals/?page=${this.currentPage()}`;

    let params = new HttpParams();

    if (!url) {

      const q = this.searchQuery().trim();
      if (q) params = params.set('search', q);

      const sp = this.selectedSpecies();
      if (sp !== 'ALL') params = params.set('species', sp);

    }

    this.http
      .get(targetUrl, { headers: this.authHeaders(), params })
      .subscribe({
        next: (data: any) => {

          const items = Array.isArray(data) ? data : data?.results;

          this.animals.set(items ?? []);
          this.nextUrl.set(data?.next ?? null);
          this.prevUrl.set(data?.previous ?? null);

        },
        error: (err) => console.error('Fehler beim Laden:', err),
      });
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadAnimals();
  }

  resetFilters() {
    this.searchQuery.set('');
    this.selectedSpecies.set('ALL');
    this.currentPage.set(1);
    this.loadAnimals();
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

  private showSuccess(message: string) {

    this.successMessage.set(message);

    setTimeout(() => {
      this.successMessage.set('');
    }, 3000);
  }

  submitForm() {

    const name = this.newAnimalName().trim();
    const species = this.newAnimalSpecies().trim();

    this.nameError.set('');

    if (!name) {
      this.nameError.set('Name ist erforderlich');
      return;
    }

    if (name.length < 2) {
      this.nameError.set('Name muss mindestens 2 Zeichen haben');
      return;
    }

    if (!species) return;

    const formData = new FormData();

    formData.append('name', name);
    formData.append('species', species);
    formData.append('status', 'AVAILABLE');

    if (this.selectedImage()) {
      formData.append('image', this.selectedImage()!);
    }

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
            this.showSuccess('Tier erfolgreich aktualisiert');

          },
          error: (err) => console.error('Fehler beim Update:', err),
        });

    } else {

      this.http
        .post(
          `${this.API_BASE}/api/animals/`,
          formData,
          { headers: this.authHeaders() }
        )
        .subscribe({
          next: () => {

            this.currentPage.set(1);
            this.loadAnimals();

            this.newAnimalName.set('');
            this.newAnimalSpecies.set('');
            this.selectedImage.set(null);

            this.showSuccess('Tier erfolgreich gespeichert');

          },
          error: (err) => console.error('Fehler beim Hinzufügen:', err),
        });
    }
  }

  deleteAnimal(id: number) {

    if (!confirm('Möchten Sie dieses Tier wirklich löschen?')) return;

    this.http
      .delete(
        `${this.API_BASE}/api/animals/${id}/`,
        { headers: this.authHeaders() }
      )
      .subscribe({
        next: () => {

          this.animals.update((items) =>
            items.filter((a) => a.id !== id)
          );

          if (this.animals().length === 0 && this.prevUrl()) {
            this.goPrev();
          } else {
            this.loadAnimals();
          }

          this.showSuccess('Tier erfolgreich gelöscht');
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