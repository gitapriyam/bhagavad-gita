import { Component } from '@angular/core';
import { environment } from '../environment-loader';
@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  standalone: true,
})
export class FooterComponent {
  version = environment.version;
  releaseDate = environment.releaseDate;
  commitHash = environment.commitHash;
}
