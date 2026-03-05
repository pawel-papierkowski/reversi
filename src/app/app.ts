import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { projectProp } from "../code/data/const";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('reversi-angular');
  projectProp = projectProp;
}
