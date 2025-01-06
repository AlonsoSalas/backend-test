import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { Product } from '../products/entities/products.entity';

describe('ReportsService', () => {
  let service: ReportsService;
  let productRepository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
  });

  describe('getDeletedProductsPercentage', () => {
    it('should return the correct percentage of deleted products', async () => {
      jest.spyOn(productRepository, 'count').mockResolvedValueOnce(100); // total products
      jest.spyOn(productRepository, 'count').mockResolvedValueOnce(20); // deleted products

      const result = await service.getDeletedProductsPercentage();
      expect(result).toBe(20);
    });

    it('should return 0 if there are no products', async () => {
      jest.spyOn(productRepository, 'count').mockResolvedValue(0);

      const result = await service.getDeletedProductsPercentage();
      expect(result).toBe(0);
    });
  });

  describe('getNonDeletedProductsWithOrWithoutPricePercentage', () => {
    it('should return the correct percentages for products with and without price', async () => {
      jest.spyOn(productRepository, 'count').mockResolvedValueOnce(100); // total non-deleted products
      jest.spyOn(productRepository, 'count').mockResolvedValueOnce(60); // with price

      const result =
        await service.getNonDeletedProductsWithOrWithoutPricePercentage();
      expect(result).toEqual({
        withPricePercentage: 60,
        withoutPricePercentage: 40,
      });
    });

    it('should return 0 percentages if there are no non-deleted products', async () => {
      jest.spyOn(productRepository, 'count').mockResolvedValue(0);

      const result =
        await service.getNonDeletedProductsWithOrWithoutPricePercentage();
      expect(result).toEqual({
        withPricePercentage: 0,
        withoutPricePercentage: 0,
      });
    });
  });

  describe('getProductsInDateRange', () => {
    it('should return products within the given date range', async () => {
      const mockProducts = [
        { id: '1', name: 'Product A', createdAt: new Date('2023-01-01') },
        { id: '2', name: 'Product B', createdAt: new Date('2023-01-02') },
      ] as unknown as Product[];

      jest.spyOn(productRepository, 'find').mockResolvedValue(mockProducts);

      const result = await service.getProductsInDateRange(
        '2023-01-01',
        '2023-01-31',
      );
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getTop5MostExpensiveProducts', () => {
    it('should return the top 5 most expensive products', async () => {
      const mockProducts = [
        { id: '1', name: 'Product A', price: 500 },
        { id: '2', name: 'Product B', price: 400 },
        { id: '3', name: 'Product C', price: 300 },
        { id: '4', name: 'Product D', price: 200 },
        { id: '5', name: 'Product E', price: 100 },
      ];

      jest
        .spyOn(productRepository, 'createQueryBuilder')
        .mockImplementation(() => {
          return {
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue(mockProducts),
          } as any;
        });

      const result = await service.getTop5MostExpensiveProducts();
      expect(result).toEqual(mockProducts);
    });
  });
});
