import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lists-widget1',
  templateUrl: './lists-widget1.component.html',
  //styleUrls: ['./lists-widget1.component.scss']
})
export class ListsWidget1Component implements OnInit {

  // Define the policeDistricts array with sample data
  policeDistricts = [
    { name: 'District Name 1', range: 'Police Range 1', zone: 'Police Zone 1', status: 'Active' },
    { name: 'District Name 2', range: 'Police Range 2', zone: 'Police Zone 2', status: 'Inactive' }
  ];

  constructor() {}

  ngOnInit(): void {}
}
