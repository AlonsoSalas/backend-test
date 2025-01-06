import { Controller, Get, Query } from '@nestjs/common';
import { ProductService } from './products.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({
    summary: 'Get paginated and filtered list of products',
    description:
      'Fetch a list of products with pagination and optional filters by name, price range, etc.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (default is 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of products per page (default is 5)',
    example: 5,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter products by name (optional)',
  })
  @ApiQuery({
    name: 'priceMin',
    required: false,
    type: Number,
    description: 'Filter products by minimum price (optional)',
  })
  @ApiQuery({
    name: 'priceMax',
    required: false,
    type: Number,
    description: 'Filter products by maximum price (optional)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched paginated and filtered products',
    schema: {
      example: {
        data: [
          { id: '123', name: 'Product A', price: 100 },
          { id: '456', name: 'Product B', price: 150 },
        ],
        page: 1,
        limit: 5,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request due to invalid query parameters',
  })
  async getProducts(
    @Query('page') page = 1,
    @Query('limit') limit = 5,
    @Query('name') name?: string,
    @Query('priceMin') priceMin?: number,
    @Query('priceMax') priceMax?: number,
  ) {
    return this.productService.getPaginatedAndFilteredProducts(page, limit, {
      name,
      priceMin,
      priceMax,
    });
  }
}
