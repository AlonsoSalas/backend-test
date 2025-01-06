import { Controller, Get, Query } from '@nestjs/common';
import { ProductService } from './products.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getProducts(
    @Query('page') page = 1,
    @Query('limit') limit = 5,
    @Query('name') name?: string,
    @Query('category') category?: string,
    @Query('priceMin') priceMin?: number,
    @Query('priceMax') priceMax?: number,
  ) {
    return this.productService.getPaginatedAndFilteredProducts(page, limit, {
      name,
      category,
      priceMin,
      priceMax,
    });
  }
}
