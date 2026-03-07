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

  // ✅ Validation states
  nameError = signal('');
  submitAttempted = false; 

  // ✅ Pagination
  nextUrl = signal<string | null>(null);
  prevUrl = signal<string | null>(null);
  currentPage = signal<number>(1);

  // ✅ Search + Filter
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
    const targetUrl = url ?? `${this.API_BASE}/api/animals/?page=${this.currentPage()}`;
    let params = new HttpParams();

    if (!url) {
      const q = this.searchQuery().trim();
      if (q) params = params.set('search', q);
      const sp = this.selectedSpecies();
      if (sp && sp !== 'ALL') params = params.set('species', sp);
    }

    this.http.get(targetUrl, { headers: this.authHeaders(), params }).subscribe({
      next: (data: any) => {
        const items = Array.isArray(data) ? data : data?.results;
        this.animals.set(items ?? []);
        this.nextUrl.set(data?.next ?? null);
        this.prevUrl.set(data?.previous ?? null);
      },
      error: (err) => console.error('Fehler beim Laden:', err),
    });
  }

  // ✅ ด่านตรวจข้อมูลก่อนส่ง
  handleFormSubmit() {
    this.submitAttempted = true; 
    this.nameError.set('');

    const name = this.newAnimalName().trim();
    if (!name) {
      this.nameError.set('Name ist erforderlich');
      return;
    }
    if (name.length < 2) {
      this.nameError.set('Name muss mindestens 2 Zeichen lang sein');
      return;
    }

    if (!this.newAnimalSpecies()) return;

    this.submitForm();
  }

  submitForm() {
    const formData = new FormData();
    formData.append('name', this.newAnimalName().trim());
    formData.append('species', this.newAnimalSpecies());
    formData.append('status', 'AVAILABLE');

    if (this.selectedImage()) {
      formData.append('image', this.selectedImage()!);
    }

    const request$ = this.editingAnimalId() 
      ? this.http.patch(`${this.API_BASE}/api/animals/${this.editingAnimalId()}/`, formData, { headers: this.authHeaders() })
      : this.http.post(`${this.API_BASE}/api/animals/`, formData, { headers: this.authHeaders() });

    request$.subscribe({
      next: () => {
        if (!this.editingAnimalId()) this.currentPage.set(1);
        this.loadAnimals();
        this.resetForm();
      },
      error: (err) => console.error('API Error:', err),
    });
  }

  resetForm() {
    this.editingAnimalId.set(null);
    this.newAnimalName.set('');
    this.newAnimalSpecies.set('');
    this.selectedImage.set(null);
    this.nameError.set('');
    this.submitAttempted = false;
  }

  cancelEdit() { this.resetForm(); }

  // --- ส่วนอื่นๆ เหมือนเดิม ---
  applyFilters() { this.currentPage.set(1); this.loadAnimals(); }
  resetFilters() { this.searchQuery.set(''); this.selectedSpecies.set('ALL'); this.applyFilters(); }
  goNext() { if (this.nextUrl()) { this.currentPage.update(p => p + 1); this.loadAnimals(this.nextUrl()!); } }
  goPrev() { if (this.prevUrl()) { this.currentPage.update(p => Math.max(1, p - 1)); this.loadAnimals(this.prevUrl()!); } }
  getImageUrl(image: string | null) { 
    if (!image) return null;
    return image.startsWith('http') ? image : `${this.API_BASE}${image.startsWith('/') ? '' : '/'}${image}`;
  }
  prepareEdit(animal: any) {
    this.editingAnimalId.set(animal.id);
    this.newAnimalName.set(animal.name);
    this.newAnimalSpecies.set(animal.species);
    this.submitAttempted = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedImage.set(file);
  }
  deleteAnimal(id: number) {
    if (!confirm('Möchten Sie dieses Tier wirklich löschen?')) return;
    this.http.delete(`${this.API_BASE}/api/animals/${id}/`, { headers: this.authHeaders() }).subscribe({
      next: () => this.loadAnimals(),
      error: (err) => console.error('Fehler:', err),
    });
  }
  logout() { localStorage.clear(); this.router.navigate(['/login']); }
}