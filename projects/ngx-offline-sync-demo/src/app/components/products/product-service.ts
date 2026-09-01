import { inject, Service } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './product.interface';

import { OFFLINE_SYNC_PRIORITY, QueuePriority } from 'ngx-offline-sync';

@Service()
export class ProductService {
  private readonly http = inject(HttpClient);

  // private readonly url = 'http://localhost:3000/products';
  private readonly url = 'https://fakestoreapi.com/products';

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.url);
  }

  createProduct(
    product: Product,
    priority: QueuePriority = QueuePriority.NORMAL,
  ): Observable<Product> {
    return this.http.post<Product>(this.url, product, {
      context: new HttpContext().set(OFFLINE_SYNC_PRIORITY, priority),
    });
  }
}
