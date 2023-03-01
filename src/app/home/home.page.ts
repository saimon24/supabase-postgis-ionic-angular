import { Component, ElementRef, ViewChild } from '@angular/core';
import { GoogleMap, Marker } from '@capacitor/google-maps';
import { LatLngBounds } from '@capacitor/google-maps/dist/typings/definitions';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject, debounce, interval } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NearbyPage } from '../nearby/nearby.page';
import { StoreResult, StoresService } from '../services/stores.service';
import { StorePage } from '../store/store.page';
import { Geolocation } from '@capacitor/geolocation';

export interface StoreMarker {
  markerId: string;
  storeId: number;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('map') mapRef!: ElementRef<HTMLElement>;
  map!: GoogleMap;
  mapBounds = new BehaviorSubject<LatLngBounds | null>(null);
  activeMarkers: StoreMarker[] = [];
  selectedMarker: StoreMarker | null = null;
  selectedStore: StoreResult | null = null;

  constructor(
    private storesService: StoresService,
    private modalCtrl: ModalController
  ) {}

  ionViewDidEnter() {
    this.createMap();
  }

  async createMap() {
    this.map = await GoogleMap.create({
      forceCreate: true, // Prevent issues with live reload
      id: 'my-map',
      element: this.mapRef.nativeElement,
      apiKey: environment.mapsKey,
      config: {
        center: {
          lat: 51.8,
          lng: 7.6,
        },
        zoom: 7,
      },
    });
    this.map.enableCurrentLocation(true);

    // Listen to biew changes and emit to our Behavior Subject
    this.map.setOnBoundsChangedListener((ev) => {
      this.mapBounds.next(ev.bounds);
    });

    // React to changes of our subject with a 300ms delay so we don't trigger a reload all the time
    this.mapBounds.pipe(debounce((i) => interval(300))).subscribe((res) => {
      this.updateStoresInView();
    });

    // Get the current user coordinates
    this.loadUserLocation();
  }

  async updateStoresInView() {
    const bounds = await this.map.getMapBounds();

    // Get stores in our bounds using PostGIS
    const stores = await this.storesService.getStoresInView(
      bounds.southwest.lat,
      bounds.southwest.lng,
      bounds.northeast.lat,
      bounds.northeast.lng
    );

    // Update markers for elements
    this.addMarkers(stores);
  }

  async loadUserLocation() {
    // Get location with Capacitor Geolocation plugin
    const coordinates = await Geolocation.getCurrentPosition();

    if (coordinates) {
      // Focus the map on user and zoom in
      this.map.setCamera({
        coordinate: {
          lat: coordinates.coords.latitude,
          lng: coordinates.coords.longitude,
        },
        zoom: 14,
      });
    }
  }

  async addMarkers(stores: StoreResult[]) {
    // Skip if there are no results
    if (stores.length === 0) {
      return;
    }

    // Find marker that are outside of the view
    const toRemove = this.activeMarkers.filter((marker) => {
      const exists = stores.find((item) => item.id === marker.storeId);
      return !exists;
    });

    // Remove markers
    if (toRemove.length) {
      await this.map.removeMarkers(toRemove.map((marker) => marker.markerId));
    }

    // Create new marker array
    const markers: Marker[] = stores.map((store) => {
      return {
        coordinate: {
          lat: store.lat,
          lng: store.long,
        },
        title: store.name,
      };
    });

    // Add markers, store IDs
    const newMarkerIds = await this.map.addMarkers(markers);

    // Crate active markers by combining information
    this.activeMarkers = stores.map((store, index) => {
      return {
        markerId: newMarkerIds[index],
        storeId: store.id,
      };
    });

    this.addMarkerClicks();
  }

  addMarkerClicks() {
    // Handle marker clicks
    this.map.setOnMarkerClickListener(async (marker) => {
      // Find our local object based on the marker ID
      const info = this.activeMarkers.filter(
        (item) => item.markerId === marker.markerId.toString()
      );
      if (info.length) {
        this.selectedMarker = info[0];

        // Load the store information from Supabase Database
        this.selectedStore = await this.storesService.loadStoreInformation(
          info[0].storeId
        );

        // Get the iamge from Supabase Storage
        const img = await this.storesService.getStoreImage(
          this.selectedStore!.id
        );

        if (img) {
          this.selectedStore!.image = img;
        }
      }
    });
  }

  async showNearby() {
    const modal = await this.modalCtrl.create({
      component: NearbyPage,
    });
    modal.present();
  }

  async addStore() {
    const modal = await this.modalCtrl.create({
      component: StorePage,
    });
    modal.present();
  }
}
