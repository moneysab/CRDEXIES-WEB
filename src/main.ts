// angular import
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

// project import
import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BasicAuthInterceptor } from 'src/app/theme/shared/components/_helpers/basic-auth.interceptor';
import { ErrorInterceptor } from 'src/app/theme/shared/components/_helpers/error.interceptor';
import { SharedModule } from 'src/app/theme/shared/shared.module';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, AppRoutingModule, SharedModule),
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    [provideHttpClient(withInterceptorsFromDi())],
    provideAnimations()
  ]
}).catch((err) => console.error(err));
