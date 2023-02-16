import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NearbyPageRoutingModule } from './nearby-routing.module';

import { NearbyPage } from './nearby.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NearbyPageRoutingModule
  ],
  declarations: [NearbyPage]
})
export class NearbyPageModule {}
