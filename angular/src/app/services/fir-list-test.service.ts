import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirListTestService {
  private baseUrl = 'http://localhost:3000/api/fir_list'; // Your backend URL

  constructor(private http: HttpClient) {}

  // Fetch FIR list from the backend
  getFirList(): Observable<any[]> {
    console.log("Requesting FIR list from backend (FirListTestService)");
    return this.http.get<any[]>(`${this.baseUrl}/list`);
  }


   // Delete a FIR by ID
   deleteFir(firId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${firId}`);
  }

  // Update FIR status
  updateFirStatus(firId: number, status: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/update-status/${firId}`, { status });
  }
}
