import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private baseUrl = 'http://localhost:3000'; // Update base URL as per server configuration

  constructor(private http: HttpClient) {}

  getAllCities(): Observable<any> {
    return this.http.get(`${this.baseUrl}/cities`);
  }

  addCity(city: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/cities`, city);
  }

  updateCity(cityId: number, city: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/cities/${cityId}`, city);
  }

  deleteCity(cityId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cities/${cityId}`);
  }

  toggleCityStatus(cityId: number, newStatus: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/cities/${cityId}/status`, { newStatus });
  }

  // New method to get all districts for city dropdown
  getAllDistricts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/districts`);
  }
}
