import { Test, TestingModule } from '@nestjs/testing';
import { ContentfulService } from './contentful.service';
import { SyncState } from '../sync/entities/sync-state.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

jest.mock('axios');

describe('ContentfulService', () => {
  let contentfulService: ContentfulService;
  let syncStateRepository: Repository<SyncState>;
  const mockSyncState = { nextSyncUrl: 'mock-sync-token' };

  beforeAll(() => {
    process.env.CONTENTFUL_SPACE_ID = 'mock-space-id';
    process.env.CONTENTFUL_ACCESS_TOKEN = 'mock-access-token';
    process.env.CONTENTFUL_CONTENT_TYPE = 'mock-content-type';
  });

  afterAll(() => {
    delete process.env.CONTENTFUL_SPACE_ID;
    delete process.env.CONTENTFUL_ACCESS_TOKEN;
    delete process.env.CONTENTFUL_CONTENT_TYPE;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentfulService,
        {
          provide: getRepositoryToken(SyncState),
          useValue: {
            find: jest.fn().mockResolvedValue([mockSyncState]),
            save: jest.fn().mockResolvedValue(mockSyncState),
            create: jest.fn().mockReturnValue(mockSyncState),
          },
        },
      ],
    }).compile();

    contentfulService = module.get<ContentfulService>(ContentfulService);
    syncStateRepository = module.get<Repository<SyncState>>(
      getRepositoryToken(SyncState),
    );
  });

  it('should be defined', () => {
    expect(contentfulService).toBeDefined();
  });

  describe('getSyncUrl', () => {
    it('should return the next sync URL if it exists', async () => {
      const syncUrl = await contentfulService.getSyncUrl();
      expect(syncUrl).toBe('mock-sync-token');
    });

    it('should return null if no sync state is found', async () => {
      syncStateRepository.find = jest.fn().mockResolvedValue([]);
      const syncUrl = await contentfulService.getSyncUrl();
      expect(syncUrl).toBeNull();
    });
  });

  describe('transformResponse', () => {
    it('should transform the response items into ProductDTOs', () => {
      const mockItems = [
        {
          sys: {
            id: '1',
            createdAt: '2025-01-06T00:00:00Z',
            updatedAt: '2025-01-06T01:00:00Z',
          },
          fields: {
            productName: { 'en-US': 'Test Product' },
            sku: { 'en-US': 'SKU123' },
            price: { 'en-US': 100 },
            quantity: { 'en-US': 10 },
            image: { 'en-US': [{ sys: { id: 'image-id' } }] },
            productDescription: { 'en-US': 'Description' },
            slug: { 'en-US': 'test-product' },
            tags: { 'en-US': ['tag1', 'tag2'] },
            website: { 'en-US': 'https://example.com' },
          },
        },
      ];

      const result = contentfulService.transformResponse(mockItems);
      expect(result).toEqual([
        {
          contentfulId: '1',
          name: 'Test Product',
          sku: 'SKU123',
          brandId: null,
          categories: [],
          price: 100,
          stock: 10,
          images: ['image-id'],
          description: 'Description',
          slug: 'test-product',
          tags: ['tag1', 'tag2'],
          website: 'https://example.com',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);
    });
  });

  describe('fetchFromContentful', () => {
    it('should fetch data from Contentful API', async () => {
      const mockData = {
        items: [
          { sys: { id: '1' }, fields: { productName: { 'en-US': 'Test' } } },
        ],
      };
      axios.get = jest.fn().mockResolvedValue({ data: mockData });

      const result = await contentfulService.fetchFromContentful('mock-url');
      expect(result).toEqual(mockData);
    });
  });

  describe('getInitialSyncUrl', () => {
    it('should return the initial sync URL', async () => {
      const url = await contentfulService.getInitialSyncUrl();
      expect(url).toBe(
        `${contentfulService['baseUrl']}?access_token=${process.env.CONTENTFUL_ACCESS_TOKEN}&initial=true&type=Entry&content_type=${process.env.CONTENTFUL_CONTENT_TYPE}`,
      );
    });
  });

  describe('saveOrUpdateSyncUrl', () => {
    it('should save the next sync URL when no existing sync state is found', async () => {
      syncStateRepository.find = jest.fn().mockResolvedValue([]);

      await contentfulService.saveOrUpdateSyncUrl('new-sync-token');

      expect(syncStateRepository.create).toHaveBeenCalledWith({
        nextSyncUrl: 'new-sync-token',
      });
      expect(syncStateRepository.save).toHaveBeenCalledWith(mockSyncState);
    });

    it('should update the next sync URL when an existing sync state is found', async () => {
      syncStateRepository.find = jest.fn().mockResolvedValue([mockSyncState]);

      await contentfulService.saveOrUpdateSyncUrl('updated-sync-token');

      expect(syncStateRepository.save).toHaveBeenCalledWith({
        nextSyncUrl: 'updated-sync-token',
      });
    });
  });
});
