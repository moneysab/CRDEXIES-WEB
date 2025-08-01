// angular import
import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

// project import
import { SpinnerComponent } from 'src/app/theme/shared/components/spinner/spinner.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, SpinnerComponent]
})
export class AppComponent implements OnInit {
  private router = inject(Router);

  // public props
  title = 'mantis';

  // Life cycle events
  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }
}
