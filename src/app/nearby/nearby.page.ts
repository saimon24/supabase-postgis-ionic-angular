import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { StoresService, StoreResult } from '../services/stores.service';
import { LoadingController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-nearby',
  templateUrl: './nearby.page.html',
  styleUrls: ['./nearby.page.scss'],
})
export class NearbyPage implements OnInit {
  stores: StoreResult[] = [];

  constructor(
    private storesService: StoresService,
    public modalCtrl: ModalController,
    private loadingCtrl: LoadingController
  ) {}

  async ngOnInit() {
    // Show loading while getting data from Supabase
    const loading = await this.loadingCtrl.create({
      message: 'Loading nearby places...',
    });
    loading.present();

    const coordinates = await Geolocation.getCurrentPosition();

    if (coordinates) {
      // Get nearby places sorted by distance using PostGIS
      this.stores = await this.storesService.getNearbyStores(
        coordinates.coords.latitude,
        coordinates.coords.longitude
      );
      loading.dismiss();
    }
  }
}
