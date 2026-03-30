import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-animal-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './animal-detail.html',
  styleUrl: './animal-detail.css',
})
export class AnimalDetailComponent {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);

  API_BASE = environment.apiUrl;

  animal = signal<any | null>(null);
  currentUser = signal<any | null>(null);
  loading = signal(true);
  error = signal('');

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

  ngOnInit(): void {
    this.loadCurrentUser();

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Ungültige Tier-ID');
      this.loading.set(false);
      return;
    }

    this.http
      .get<any>(`${this.API_BASE}/api/animals/${id}/`, {
        headers: this.authHeaders(),
      })
      .subscribe({
        next: (data) => {
          this.animal.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Fehler beim Laden der Tierdetails:', err);
          this.error.set('Tier konnte nicht geladen werden');
          this.loading.set(false);
        },
      });
  }

  canManageAnimal(): boolean {
    const user = this.currentUser();
    const animal = this.animal();

    if (!user || !animal) return false;

    if (user.is_staff || user.is_superuser) {
      return true;
    }

    return animal.owner === user.username;
  }

  deleteAnimal(): void {
    const animal = this.animal();

    if (!animal) return;

    const confirmed = window.confirm(
      'Sind Sie sicher, dass Sie dieses Tier löschen möchten?'
    );

    if (!confirmed) return;

    this.http
      .delete(`${this.API_BASE}/api/animals/${animal.id}/`, {
        headers: this.authHeaders(),
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/animals']);
        },
        error: (err) => {
          console.error('Fehler beim Löschen:', err);
        },
      });
  }

  goToAnimals(): void {
  this.router.navigate(['/animals']);
}

goToEdit(): void {
  const animal = this.animal();
  if (!animal) return;

  this.router.navigate(['/animals', animal.id, 'edit']);
}
}
