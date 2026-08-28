import { Component } from '@angular/core';
import { ProductForm } from './components/products/product-form/product-form';

@Component({
  imports: [ProductForm],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
