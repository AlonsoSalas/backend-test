import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/products.entity';
import { In, Repository } from 'typeorm';
import { ProductDTO } from './dto/products.dto';

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
  });

  describe('isInitialSyncCompleted', () => {
    it('should return true if products exist', async () => {
      jest.spyOn(productRepository, 'count').mockResolvedValue(1);

      const result = await productService.isInitialSyncCompleted();
      expect(result).toBe(true);
    });

    it('should return false if no products exist', async () => {
      jest.spyOn(productRepository, 'count').mockResolvedValue(0);

      const result = await productService.isInitialSyncCompleted();
      expect(result).toBe(false);
    });
  });

  describe('getPaginatedAndFilteredProducts', () => {
    it('should return paginated and filtered products', async () => {
      const products = [
        { id: 1, name: 'Product 1', price: 100 },
        { id: 2, name: 'Product 2', price: 150 },
      ];
      const filters = { name: 'Product', priceMin: 50, priceMax: 200 };

      jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue({
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([products, 2]),
      } as any);

      const result = await productService.getPaginatedAndFilteredProducts(
        1,
        10,
        filters,
      );
      expect(result.items).toEqual(products);
      expect(result.total).toBe(2);
      expect(result.currentPage).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('upsertProducts', () => {
    it('should insert a new product if it does not exist', async () => {
      const productDTO: ProductDTO = {
        contentfulId: '1',
        name: 'Product 1',
        categories: [],
        images: [],
        tags: [],
        createdAt: '',
        updatedAt: '',
      };
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(productRepository, 'save')
        .mockResolvedValue(productDTO as any);

      await productService.upsertProducts([productDTO]);
      expect(productRepository.save).toHaveBeenCalledWith(productDTO);
    });

    it('should update an existing product if it exists', async () => {
      const productDTO: ProductDTO = {
        contentfulId: '1',
        name: 'Product 1',
        categories: [],
        images: [],
        tags: [],
        createdAt: '',
        updatedAt: '',
      };
      const existingProduct = { id: 1, contentfulId: '1', name: 'Old Product' };
      jest
        .spyOn(productRepository, 'findOne')
        .mockResolvedValue(existingProduct as any);
      jest.spyOn(productRepository, 'update').mockResolvedValue(undefined);

      await productService.upsertProducts([productDTO]);
      expect(productRepository.update).toHaveBeenCalledWith(
        existingProduct.id,
        productDTO,
      );
    });
  });

  describe('markProductsAsDeleted', () => {
    it('should mark products as deleted', async () => {
      const deletedIds = ['1', '2'];
      jest.spyOn(productRepository, 'update').mockResolvedValue(undefined);

      await productService.markProductsAsDeleted(deletedIds);
      expect(productRepository.update).toHaveBeenCalledWith(
        { contentfulId: In(deletedIds) },
        { isDeleted: true },
      );
    });
  });

  describe('getDeletedPercentage', () => {
    it('should return the percentage of deleted products', async () => {
      jest.spyOn(productRepository, 'count').mockResolvedValueOnce(100);
      jest.spyOn(productRepository, 'count').mockResolvedValueOnce(20);

      const result = await productService.getDeletedPercentage();

      expect(result.deletedPercentage).toBe(20);
    });
  });

  describe('getCustomPercentage', () => {
    it('should return the filtered percentage based on custom date range', async () => {
      jest.spyOn(productRepository, 'count').mockResolvedValue(100);
      jest.spyOn(productRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(50),
      } as any);

      const result = await productService.getCustomPercentage({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });
      expect(result.filteredPercentage).toBe(50);
    });
  });
});
