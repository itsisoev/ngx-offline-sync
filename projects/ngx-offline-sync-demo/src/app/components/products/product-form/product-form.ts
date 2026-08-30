import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProductService } from '../product-service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);

  readonly productForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    description: ['', Validators.required],
    category: ['', Validators.required],
    image: ['', Validators.required],
  });

  readonly isAutoFilling = signal(false);
  readonly isSending = signal(false);
  readonly autoSendCount = signal(1);

  autoFill(): void {
    this.isAutoFilling.set(true);

    this.productService.getProducts().subscribe({
      next: (products) => {
        if (!products.length) {
          return;
        }

        const product = products[Math.floor(Math.random() * products.length)];

        this.productForm.patchValue({
          title: product.title,
          price: product.price,
          description: product.description,
          category: product.category,
          image: product.image,
        });
      },

      error: (error) => {
        console.error('Failed to load product:', error);
        this.isAutoFilling.set(false);
      },

      complete: () => {
        this.isAutoFilling.set(false);
      },
    });
  }

  setAutoSendCount(count: number): void {
    this.autoSendCount.set(Number(count));
  }

  submit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const product = this.productForm.getRawValue();

    this.productService.createProduct(product).subscribe({
      next: (response) => {

      },

      error: (error) => {

      },
    });
  }

  autoCreate(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const product = this.productForm.getRawValue();
    const count = this.autoSendCount();

    this.isSending.set(true);

    let completedRequests = 0;

    for (let i = 0; i < count; i++) {
      this.productService
        .createProduct({
          ...product,
        })
        .subscribe({
          next: (response) => {
            console.log(`Automatic request ${i + 1}/${count}:`, response);
          },

          error: (error) => {
            console.error(`Automatic request ${i + 1}/${count} failed:`, error);

            completedRequests++;

            if (completedRequests === count) {
              this.isSending.set(false);
            }
          },

          complete: () => {
            completedRequests++;

            if (completedRequests === count) {
              this.isSending.set(false);
            }
          },
        });
    }
  }
}
