import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncState } from '../sync/entities/sync-state.entity';
import axios from 'axios';
import { ProductDTO } from 'src/products/dto/products.dto';

@Injectable()
export class ContentfulService {
  private readonly spaceId = process.env.CONTENTFUL_SPACE_ID;
  private readonly accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  private readonly contentType = process.env.CONTENTFUL_CONTENT_TYPE;
  private readonly baseUrl = `https://cdn.contentful.com/spaces/${this.spaceId}/sync`;

  constructor(
    @InjectRepository(SyncState)
    private readonly syncStateRepository: Repository<SyncState>,
  ) {}

  async getSyncUrl(): Promise<string | null> {
    const [state] = await this.syncStateRepository.find();
    return state ? state.nextSyncUrl : null;
  }

  async saveOrUpdateSyncUrl(nextSyncUrl: string): Promise<void> {
    const [existingSyncState] = await this.syncStateRepository.find();

    if (existingSyncState) {
      existingSyncState.nextSyncUrl = nextSyncUrl;
      await this.syncStateRepository.save(existingSyncState);
    } else {
      const newSyncState = this.syncStateRepository.create({
        nextSyncUrl,
      });
      await this.syncStateRepository.save(newSyncState);
    }
  }

  transformResponse(items: any[]): ProductDTO[] {
    return items.map((item) => {
      return {
        contentfulId: item.sys.id,
        name: item.fields.productName?.['en-US'],
        sku: item.fields.sku?.['en-US'] || null,
        brandId: item.fields.brand?.['en-US'].sys.id || null,
        categories:
          item.fields.categories?.['en-US'].map((cat) => cat.sys.id) || [],
        price: item.fields.price?.['en-US'] || null,
        stock: item.fields.quantity?.['en-US'] || null,
        images: item.fields.image?.['en-US'].map((img) => img.sys.id) || [],
        description: item.fields.productDescription?.['en-US'] || null,
        slug: item.fields.slug?.['en-US'] || null,
        tags: item.fields.tags?.['en-US'] || [],
        website: item.fields.website?.['en-US'] || null,
        createdAt: new Date(item.sys.createdAt).toISOString(),
        updatedAt: new Date(item.sys.updatedAt).toISOString(),
      };
    });
  }

  async fetchFromContentful(url: string): Promise<any> {
    const response = await axios.get(url, {
      params: {
        access_token: this.accessToken,
      },
    });

    return response.data;
  }

  async getInitialSyncUrl(): Promise<string> {
    return `${this.baseUrl}?access_token=${this.accessToken}&initial=true&type=Entry&content_type=${this.contentType}`;
  }
}
