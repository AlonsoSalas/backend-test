import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BadRequestException } from '@nestjs/common';
import { Product } from '../products/entities/products.entity';

describe('ReportsController', () => {
  let controller: ReportsController;
  let reportsService: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: {
            getDeletedProductsPercentage: jest.fn(),
            getNonDeletedProductsWithOrWithoutPricePercentage: jest.fn(),
            getProductsInDateRange: jest.fn(),
            getTop5MostExpensiveProducts: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ReportsController>(ReportsController);
    reportsService = module.get<ReportsService>(ReportsService);
  });

  describe('getDeletedProductsPercentage', () => {
    it('should return the deleted products percentage', async () => {
      jest
        .spyOn(reportsService, 'getDeletedProductsPercentage')
        .mockResolvedValue(25.5);

      const result = await controller.getDeletedProductsPercentage();
      expect(result).toEqual({ percentage: 25.5 });
    });
  });

  describe('getNonDeletedProductsWithOrWithoutPricePercentage', () => {
    it('should return the percentage of non-deleted products with and without price', async () => {
      jest
        .spyOn(
          reportsService,
          'getNonDeletedProductsWithOrWithoutPricePercentage',
        )
        .mockResolvedValue({
          withPricePercentage: 80,
          withoutPricePercentage: 20,
        });

      const result =
        await controller.getNonDeletedProductsWithOrWithoutPricePercentage();
      expect(result).toEqual({
        withPricePercentage: 80,
        withoutPricePercentage: 20,
      });
    });
  });

  describe('getProductsInDateRange', () => {
    it('should return products within the specified date range', async () => {
      const mockProducts = [
        { id: '1', name: 'Product A', createdAt: new Date('2023-01-01') },
        { id: '2', name: 'Product B', createdAt: new Date('2023-01-02') },
      ] as unknown as Product[];
      jest
        .spyOn(reportsService, 'getProductsInDateRange')
        .mockResolvedValue(mockProducts);

      const result = await controller.getProductsInDateRange(
        '2023-01-01',
        '2023-01-31',
      );
      expect(result).toEqual(mockProducts);
    });

    it('should throw BadRequestException if startDate or endDate is missing', async () => {
      await expect(
        controller.getProductsInDateRange(undefined, '2023-01-31'),
      ).rejects.toThrow(
        new BadRequestException(
          'startDate and endDate query parameters are required.',
        ),
      );
    });

    it('should throw BadRequestException if startDate or endDate is invalid', async () => {
      await expect(
        controller.getProductsInDateRange('invalid-date', '2023-01-31'),
      ).rejects.toThrow(
        new BadRequestException(
          'Invalid date format. Use ISO 8601 format (YYYY-MM-DD).',
        ),
      );
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
        .spyOn(reportsService, 'getTop5MostExpensiveProducts')
        .mockResolvedValue(mockProducts);

      const result = await controller.getTop5MostExpensiveProducts();
      expect(result).toEqual(mockProducts);
    });
  });
});
