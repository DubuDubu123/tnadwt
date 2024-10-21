import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DistrictService {
  private baseUrl = 'http://localhost:3000/districts';

  constructor(private http: HttpClient) {}

  getAllDistricts(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  addDistrict(district: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, district);
  }

  updateDistrict(id: number, district: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, district);
  }

  deleteDistrict(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  toggleDistrictStatus(id: number, newStatus: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/toggleStatus`, { newStatus });
  }
}
