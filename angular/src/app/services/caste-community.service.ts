import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CasteCommunityService {
  private apiUrl = 'http://localhost:3000/api/caste';

  constructor(private http: HttpClient) {}

  getAllCastes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  addCaste(caste: any): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}`, caste);
  }

  updateCaste(id: number, caste: any): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, caste);
  }

  deleteCaste(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  toggleStatus(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}
