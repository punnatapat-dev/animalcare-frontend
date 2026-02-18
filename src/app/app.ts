import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnimalListComponent } from './animal-list/animal-list'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AnimalListComponent], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'animalcare-frontend';
}