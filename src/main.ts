import { bootstrapApplication } from '@angular/platform-browser';
import { TableStyleDemo } from './app/table-style-demo';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

    export const appConfig: ApplicationConfig = {
      providers: [
      provideHttpClient(withFetch()),
      provideAnimationsAsync(),
      providePrimeNG({
        theme: { preset: Aura },
      }),
    ],
  };

    bootstrapApplication(TableStyleDemo, appConfig).catch((err) =>
    console.error(err)
);