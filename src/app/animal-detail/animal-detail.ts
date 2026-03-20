import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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

  API_BASE = environment.apiUrl;

  animal = signal<any | null>(null);
  loading = signal(true);
  error = signal('');

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`,
    });
  }

  ngOnInit(): void {
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
}