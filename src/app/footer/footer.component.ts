import { Component } from '@angular/core';
import { environment } from '../environment-loader';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
})
export class FooterComponent {
  version = environment.version;
  releaseDate = environment.releaseDate;
  commitHash = environment.commitHash;

  visible = true;
  private touchStartY = 0;

  onTouchStart(event: TouchEvent) {
    this.touchStartY = event.touches[0].clientY;
  }

  onTouchEnd(event: TouchEvent) {
    const touchEndY = event.changedTouches[0].clientY;
    if (Math.abs(touchEndY - this.touchStartY) > 40) {
      // User swiped vertically (threshold: 40px)
      this.visible = false;
    }
  }
}
