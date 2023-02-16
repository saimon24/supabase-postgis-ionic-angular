import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StoreEntry, StoresService } from '../services/stores.service';

@Component({
  selector: 'app-store',
  templateUrl: './store.page.html',
  styleUrls: ['./store.page.scss'],
})
export class StorePage implements OnInit {
  store: StoreEntry = {
    name: '',
    description: '',
    image: undefined,
    lat: undefined,
    long: undefined,
  };

  constructor(
    public modalCtrl: ModalController,
    private storesService: StoresService
  ) {}

  ngOnInit() {}

  imageSelected(ev: any) {
    this.store.image = ev.detail.event.target.files[0];
  }

  async addStore() {
    this.storesService.addStore(this.store);
    this.modalCtrl.dismiss();
  }
}
