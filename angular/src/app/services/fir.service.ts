import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirService {
  private baseUrl = 'http://localhost:3000/api/fir'; // Adjust this to your actual API base URL

  constructor(private http: HttpClient) {}

  // Get user details by user ID
  getUserDetails(userId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/user-details`, { userId });
  }



  // Get police division details by district
  getPoliceDivision(district: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/police-division?district=${district}`);
  }

  // Get offence options
  getOffences(): Observable<any> {
    //console.log("Requesting FIR list from backend");
    return this.http.get(`${this.baseUrl}/offences`);
  }

  // Get offence acts
  getOffenceActs(): Observable<any> {
    return this.http.get(`${this.baseUrl}/offence-acts`);
  }

  getPoliceRevenue(): Observable<any> {
    return this.http.get(`${this.baseUrl}/police-revenue`);
  }

  // Get SC/ST sections
  getCastes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/scst-sections`);
  }

  // getCastesnativedistrict(): Observable<any> {
  //   return this.http.get(`${this.baseUrl}/police-revenue`);
  // }

  // Get FIR by ID
  getFirById(firId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${firId}`);
  }

 // Save Step 1 FIR Data
submitFir(step1Data: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/save`, step1Data);
}


   updateFir(firId: number, firData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${firId}`, firData);
  }

  // Save investigation officer details
  saveInvestigationOfficer(officerData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/save-officer`, officerData);
  }

  updateFirStepTwo(firId: number, stepTwoData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${firId}`, stepTwoData);
  }




}
