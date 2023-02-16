import { TestBed } from '@angular/core/testing';

import { StoresService } from './stores.service';

describe('StoresService', () => {
  let service: StoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
