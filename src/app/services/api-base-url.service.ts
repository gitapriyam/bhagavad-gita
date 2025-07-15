import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

import { environment as envGenerated } from '../../environments/environment.generated';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiBaseUrlService {
  public getApiBaseUrl(): string {
    if (Capacitor.getPlatform() === 'ios') {
      return envGenerated.apiBaseUrlIos || environment.apiBaseUrl;
    } else {
      return environment.apiBaseUrl;
    }
  }
}
