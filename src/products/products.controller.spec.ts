import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './products.controller';
import { ProductService } from './products.service';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            getPaginatedAndFilteredProducts: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  describe('getProducts', () => {
    it('should return paginated and filtered products', async () => {
      const mockResponse = {
        items: [
          {
            id: 1,
            contentfulId: '6dbjWqNd9SqccegcqYq224',
            name: 'Whisk Beater',
            sku: 'B0081F2CCK',
            brandId: '651CQ8rLoIYCeY6G0QG22q',
            categories: ['7LAnCobuuWYSqks6wAwY2a'],
            price: 22,
            stock: 89,
            images: ['10TkaLheGeQG6qQGqWYqUI'],
            description:
              'A creative little whisk that comes in 8 different colors. Handy and easy to clean after use. A great gift idea.',
            slug: 'whisk-beater',
            tags: ['kitchen', 'accessories', 'whisk', 'scandinavia', 'design'],
            website: 'http://www.amazon.com/dp/B0081F2CCK/',
            isDeleted: false,
            createdAt: new Date('2024-01-01T00:00:00Z'),
            updatedAt: new Date('2024-01-02T00:00:00Z'),
          },
        ],
        total: 1,
        currentPage: 1,
        totalPages: 1,
      };

      jest
        .spyOn(service, 'getPaginatedAndFilteredProducts')
        .mockResolvedValue(mockResponse);

      const result = await controller.getProducts(1, 5, 'Product', 50, 200);

      expect(result).toEqual(mockResponse);
      expect(service.getPaginatedAndFilteredProducts).toHaveBeenCalledWith(
        1,
        5,
        {
          name: 'Product',
          priceMin: 50,
          priceMax: 200,
        },
      );
    });
  });
});
