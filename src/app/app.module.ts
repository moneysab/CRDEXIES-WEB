import { NgModule, APP_INITIALIZER } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './theme/shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { AppInitializerService } from './core/services/app-initializer.service';

// Factory function for APP_INITIALIZER
export function initializeAppFactory(appInitializer: AppInitializerService) {
  return () => appInitializer.initializeApp();
}

@NgModule({
  declarations: [
  ],
  imports: [
    AppRoutingModule,
    CoreModule,
    HttpClientModule,
    SharedModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [AppInitializerService],
      multi: true
    }
  ],
})
export class AppModule { }
