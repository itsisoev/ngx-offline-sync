import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductForm } from './components/products/product-form/product-form';

@Component({
  imports: [RouterOutlet, ProductForm],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
