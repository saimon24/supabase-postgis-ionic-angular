import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SupabaseClient, User, createClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

export interface StoreEntry {
  lat?: number;
  long?: number;
  name: string;
  description: string;
  image?: File;
}
export interface StoreResult {
  id: number;
  lat: number;
  long: number;
  name: string;
  description: string;
  image?: SafeUrl;
  dist_meters?: number;
}
@Injectable({
  providedIn: 'root',
})
export class StoresService {
  private supabase: SupabaseClient;

  constructor(private sanitizer: DomSanitizer) {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  // Get all places with calculated distance
  async getNearbyStores(lat: number, long: number) {
    const { data, error } = await this.supabase.rpc('nearby_stores', {
      lat,
      long,
    });
    return data;
  }

  async addStore(info: StoreEntry) {
    // Add a new database entry using the POINT() syntax for the coordinates
    const { data } = await this.supabase
      .from('stores')
      .insert({
        name: info.name,
        description: info.description,
        location: `POINT(${info.long} ${info.lat})`,
      })
      .select()
      .single();

    if (data && info.image) {
      // Upload the image to Supabase
      const foo = await this.supabase.storage
        .from('stores')
        .upload(`/images/${data.id}.png`, info.image);
    }
  }

  async getStoreImage(id: number) {
    // Get image for a store and transform it automatically!
    return this.supabase.storage
      .from('stores')
      .getPublicUrl(`images/${id}.png`, {
        transform: {
          width: 300,
          resize: 'contain',
        },
      }).data.publicUrl;
  }

  // Get all places in a box of coordinates
  async getStoresInView(
    min_lat: number,
    min_long: number,
    max_lat: number,
    max_long: number
  ) {
    const { data } = await this.supabase.rpc('stores_in_view', {
      min_lat,
      min_long,
      max_lat,
      max_long,
    });
    return data;
  }

  // Load data from Supabase database
  async loadStoreInformation(id: number) {
    const { data } = await this.supabase
      .from('stores')
      .select('*')
      .match({ id })
      .single();
    return data;
  }
}
