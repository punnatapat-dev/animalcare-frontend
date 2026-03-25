import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-animal-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './animal-list.html',
  styleUrl: './animal-list.css',
})
export class AnimalListComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  API_BASE = environment.apiUrl;

  animals = signal<any[]>([]);
  loading = signal(false);
  currentUser = signal<any | null>(null);

  stats = signal<any | null>(null);
  statsLoading = signal(false);

  showOnlyMine = signal(false);

  newAnimalName = signal('');
  newAnimalSpecies = signal('');
  selectedImage = signal<File | null>(null);

  editingAnimalId = signal<number | null>(null);

  nameError = signal('');
  successMessage = signal('');

  nextUrl = signal<string | null>(null);
  prevUrl = signal<string | null>(null);
  currentPage = signal<number>(1);

  searchQuery = signal('');
  selectedSpecies = signal('ALL');

  speciesOptions: string[] = ['ALL', 'DOG', 'CAT', 'RABBIT', 'OTHER'];

  ngOnInit(): void {
  this.loadCurrentUser();
  this.loadAnimals();
  this.loadStats();
}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`,
    });
  }
  loadCurrentUser(): void {
  this.http
    .get<any>(`${this.API_BASE}/api/users/me/`, {
      headers: this.authHeaders(),
    })
    .subscribe({
      next: (data) => {
        this.currentUser.set(data);
      },
      error: (err) => {
        console.error('Fehler beim Laden des Benutzers:', err);
      },
    });
}
  loadAnimals(url?: string): void {
    this.loading.set(true);

    const targetUrl =
      url ??
      (this.showOnlyMine()
        ? `${this.API_BASE}/api/animals/my/`
        : `${this.API_BASE}/api/animals/?page=${this.currentPage()}`);

    let params = new HttpParams();

    const q = this.searchQuery().trim();
    const sp = this.selectedSpecies();

    if (q) {
      params = params.set('search', q);
    }

    if (sp !== 'ALL') {
      params = params.set('species', sp);
    }

    this.http
      .get<any>(targetUrl, {
        headers: this.authHeaders(),
        params,
      })
      .subscribe({
        next: (data: any) => {
          const items = Array.isArray(data) ? data : data?.results;

          this.animals.set(items ?? []);

          this.nextUrl.set(Array.isArray(data) ? null : (data?.next ?? null));
          this.prevUrl.set(Array.isArray(data) ? null : (data?.previous ?? null));

          this.loading.set(false);
        },
        error: (err) => {
          console.error('Fehler beim Laden:', err);
          this.loading.set(false);
        },
      });
  }

  loadStats(): void {
    this.statsLoading.set(true);

    this.http
      .get<any>(`${this.API_BASE}/api/animals/stats/`, {
        headers: this.authHeaders(),
      })
      .subscribe({
        next: (data) => {
          this.stats.set(data);
          this.statsLoading.set(false);
        },
        error: (err) => {
          console.error('Fehler beim Laden der Statistiken:', err);
          this.statsLoading.set(false);
        },
      });
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadAnimals();
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedSpecies.set('ALL');
    this.currentPage.set(1);
    this.loadAnimals();
  }

  goNext(): void {
    if (!this.nextUrl()) return;

    this.currentPage.update((p) => p + 1);
    this.loadAnimals(this.nextUrl()!);
  }

  goPrev(): void {
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

  prepareEdit(animal: any): void {
    this.editingAnimalId.set(animal.id);
    this.newAnimalName.set(animal.name ?? '');
    this.newAnimalSpecies.set(animal.species ?? '');
    this.selectedImage.set(null);
    this.nameError.set('');
    this.successMessage.set('');
  }

  cancelEdit(): void {
    this.editingAnimalId.set(null);
    this.newAnimalName.set('');
    this.newAnimalSpecies.set('');
    this.selectedImage.set(null);
    this.nameError.set('');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    const file = input.files && input.files.length > 0 ? input.files[0] : null;

    this.selectedImage.set(file);
  }

  private showSuccess(message: string): void {
    this.successMessage.set(message);

    setTimeout(() => {
      this.successMessage.set('');
    }, 2500);
  }

  submitForm(): void {
    const name = this.newAnimalName().trim();
    const species = this.newAnimalSpecies().trim().toUpperCase();

    if (name.length < 2) {
      this.nameError.set('Der Name muss mindestens 2 Zeichen lang sein.');
      return;
    }

    const formData = new FormData();

    formData.append('name', name);
    formData.append('species', species);

    const image = this.selectedImage();

    if (image) {
      formData.append('image', image);
    }

    const editingId = this.editingAnimalId();

    if (editingId) {
      this.http
        .put(`${this.API_BASE}/api/animals/${editingId}/`, formData, {
          headers: this.authHeaders(),
        })
        .subscribe({
          next: () => {
            this.showSuccess('Tier erfolgreich aktualisiert.');

            this.cancelEdit();
            this.loadAnimals();
          },

          error: (err) => {
            console.error('Fehler beim Aktualisieren:', err);
          },
        });

      return;
    }

    this.http
      .post(`${this.API_BASE}/api/animals/`, formData, {
        headers: this.authHeaders(),
      })
      .subscribe({
        next: () => {
          this.showSuccess('Tier erfolgreich erstellt.');

          this.newAnimalName.set('');
          this.newAnimalSpecies.set('');
          this.selectedImage.set(null);
          this.nameError.set('');
          this.loadStats();

          this.loadAnimals();
        },

        error: (err) => {
          console.error('Fehler beim Erstellen:', err);
        },
      });
  }

  deleteAnimal(id: number): void {
    const confirmed = window.confirm('Sind Sie sicher, dass Sie dieses Tier löschen möchten?');

    if (!confirmed) return;

    this.http
      .delete(`${this.API_BASE}/api/animals/${id}/`, {
        headers: this.authHeaders(),
      })
      .subscribe({
        next: () => {
          this.showSuccess('Tier erfolgreich gelöscht.');
          this.loadStats();

          const remaining = this.animals().filter((animal) => animal.id !== id);

          this.animals.set(remaining);

          if (remaining.length === 0 && this.prevUrl()) {
            this.goPrev();
          } else {
            this.loadAnimals();
          }
        },

        error: (err) => {
          console.error('Fehler beim Löschen:', err);
        },
      });
  }

  openDetail(id: number): void {
    this.router.navigate(['/animals', id]);
  }

  getStatusColor(status: string): string {
    if (status === 'AVAILABLE') return 'green';

    if (status === 'PENDING') return 'orange';

    if (status === 'ADOPTED') return 'gray';

    return 'black';
  }
  changeStatus(animal: any, newStatus: string): void {
    const formData = new FormData();

    formData.append('name', animal.name);
    formData.append('species', animal.species);
    formData.append('status', newStatus);

    this.http
      .put(`${this.API_BASE}/api/animals/${animal.id}/`, formData, {
        headers: this.authHeaders(),
      })
      .subscribe({
        next: () => {
          this.showSuccess(`Status von ${animal.name} wurde auf ${newStatus} gesetzt.`);
          this.loadAnimals();
          this.loadStats();
        },
        error: (err) => {
          console.error('Fehler beim Status-Update:', err);
        },
      });
  }



  toggleMyAnimals(showMine: boolean): void {
  this.showOnlyMine.set(showMine);
  this.currentPage.set(1);
  this.nextUrl.set(null);
  this.prevUrl.set(null);
  this.loadAnimals();
}

  canManageAnimal(animal: any): boolean {
  const user = this.currentUser();

  if (!user) return false;

  if (user.is_staff || user.is_superuser) {
    return true;
  }

  return animal.owner === user.username;
}

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    this.router.navigate(['/login']);
  }
}


