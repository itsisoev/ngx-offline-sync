import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './product.interface';

@Service()
export class ProductService {
  private readonly http = inject(HttpClient);

  // private readonly url = 'https://fakestoreapi.com/products';

  /*
  * Не существующий API
  */
  private readonly url = 'https://fakestoreapi.com/invalid-endpoint';

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.url);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.url, product);
  }
}
