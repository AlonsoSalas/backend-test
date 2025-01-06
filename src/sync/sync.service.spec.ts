import { Test, TestingModule } from '@nestjs/testing';
import { SyncService } from './sync.service';
import { ProductService } from '../products/products.service';
import { ContentfulService } from '../contentful/contentful.service';
import { ProductDTO } from '../products/dto/products.dto';

describe('performSync', () => {
  let service: SyncService;
  let productService: ProductService;
  let contentfulService: ContentfulService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        {
          provide: ProductService,
          useValue: {
            upsertProducts: jest.fn(),
            markProductsAsDeleted: jest.fn(),
          },
        },
        {
          provide: ContentfulService,
          useValue: {
            getInitialSyncUrl: jest.fn(),
            getSyncUrl: jest.fn(),
            fetchFromContentful: jest.fn(),
            transformResponse: jest.fn(),
            saveOrUpdateSyncUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
    productService = module.get<ProductService>(ProductService);
    contentfulService = module.get<ContentfulService>(ContentfulService);
  });

  describe('performSync', () => {
    it('should process a small dataset of four products during sync', async () => {
      const mockUrl = 'http://example.com/sync';
      const mockResponse = {
        items: [
          {
            id: '1',
            type: 'Product',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '2',
            type: 'Product',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '3',
            type: 'Product',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '4',
            type: 'Product',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        nextPageUrl: null,
        nextSyncUrl: null,
      };

      jest
        .spyOn(contentfulService, 'getInitialSyncUrl')
        .mockResolvedValue(mockUrl);
      jest
        .spyOn(contentfulService, 'fetchFromContentful')
        .mockResolvedValue(mockResponse);
      jest
        .spyOn(contentfulService, 'transformResponse')
        .mockReturnValue(mockResponse.items as unknown as ProductDTO[]);

      await (service as any).performSync(true);

      expect(contentfulService.getInitialSyncUrl).toHaveBeenCalled();
      expect(contentfulService.fetchFromContentful).toHaveBeenCalledWith(
        mockUrl,
      );
      expect(contentfulService.transformResponse).toHaveBeenCalledWith(
        mockResponse.items,
      );
      expect(productService.upsertProducts).toHaveBeenCalledWith(
        mockResponse.items,
      );
      expect(contentfulService.saveOrUpdateSyncUrl).not.toHaveBeenCalled();
    });

    it('should call getSyncUrl when isInitial is false', async () => {
      const mockUrl = 'http://example.com/sync';
      const mockResponse = {
        items: [],
        nextPageUrl: null,
        nextSyncUrl: null,
      };

      jest.spyOn(contentfulService, 'getSyncUrl').mockResolvedValue(mockUrl);
      jest
        .spyOn(contentfulService, 'fetchFromContentful')
        .mockResolvedValue(mockResponse);

      await (service as any).performSync(false);

      expect(contentfulService.getSyncUrl).toHaveBeenCalled();
      expect(contentfulService.fetchFromContentful).toHaveBeenCalledWith(
        mockUrl,
      );
    });
  });
});
