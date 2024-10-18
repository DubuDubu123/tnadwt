import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChartsComponent } from './charts/charts.component';
import { FeedsComponent } from './feeds/feeds.component';
import { ListsComponent } from './lists/lists.component';
import { MixedComponent } from './mixed/mixed.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { TablesComponent } from './tables/tables.component';
import { WidgetsExamplesComponent } from './widgets-examples.component';
import { PoliceDistrictComponent } from './police-district/police-district.component'; // Ensure this is the correct path
import { LayoutComponent } from 'src/app/_metronic/layout/layout.component'; // <-- Adjust this path to match your project structure
import { OffenceComponent } from './offence/offence.component';
import { OffenceActScStComponent } from './offence-act-scst/offence-act-scst.component';
import { DistrictComponent } from './district/district.component';
import { RevenueDistrictComponent } from './revenue-district/revenue-district.component';
import { CityComponent } from './city/city.component';
import { CasteAndCommunityComponent } from './caste-and-community/caste-and-community.component';
import { FirListComponent } from './fir-list/fir-list.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'lists',
        component: ListsComponent,
      },
      {
        path: 'police-district',
        component: PoliceDistrictComponent,
      },
      {
        path: 'revenue-district',
        component: RevenueDistrictComponent,
      },

       {
        path: 'offence',
        component: OffenceComponent,
      },

      {
  path: 'offence-act-scst',
  component: OffenceActScStComponent,
},{
  path: 'district',
  component: DistrictComponent,
},
{ path: 'city', component: CityComponent },
  { path: 'caste-and-community', component: CasteAndCommunityComponent },{ path: 'fir-list', component: FirListComponent },{
        path: 'add-fir',
        loadComponent: () =>
          import('./add-fir/add-fir.component').then(m => m.AddFirComponent),
      },
      {
        path: 'statistics',
        component: StatisticsComponent,
      },
      {
        path: 'charts',
        component: ChartsComponent,
      },
      {
        path: 'mixed',
        component: MixedComponent,
      },
      {
        path: 'tables',
        component: TablesComponent,
      },
      {
        path: 'feeds',
        component: FeedsComponent,
      },
      { path: '', redirectTo: 'lists', pathMatch: 'full' },
      { path: '**', redirectTo: 'lists', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WidgetsExamplesRoutingModule {}
