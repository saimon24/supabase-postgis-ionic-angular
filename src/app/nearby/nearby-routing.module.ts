import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NearbyPage } from './nearby.page';

const routes: Routes = [
  {
    path: '',
    component: NearbyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NearbyPageRoutingModule {}
