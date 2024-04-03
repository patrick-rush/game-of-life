import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { inject } from '@vercel/analytics';
const prod = environment.prod;

inject({ mode: prod ? 'production' : 'development' });

(function () {
  prod
    ? console.log('production environment')
    : console.log('development environment');
})();

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
