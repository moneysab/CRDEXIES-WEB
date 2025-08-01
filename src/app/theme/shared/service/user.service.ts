import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { User } from '../components/_helpers/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<User[]>(`${environment.apiUrl}/api/account/login`);
  }
}
