import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  user: any = {};

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData() {
    this.user = {
      id: sessionStorage.getItem('userId'),
      name: sessionStorage.getItem('userName'),
      role: sessionStorage.getItem('userRole'),
      email: sessionStorage.getItem('userEmail'),
    };
  }

  logout() {
    sessionStorage.clear(); // Clear all session data on logout

  }
}
