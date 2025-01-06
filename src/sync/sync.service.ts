import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ContentfulService } from '../contentful/contentful.service';
import { ProductService } from 'src/products/products.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SyncService implements OnApplicationBootstrap {
  constructor(
    private readonly productService: ProductService,
    private readonly contentfulService: ContentfulService,
  ) {}

  @Cron('0 * * * *') // Every hour
  async onApplicationBootstrap() {
    const isFirstSync = !(await this.productService.isInitialSyncCompleted());

    if (isFirstSync) {
      console.log('Performing initial sync...');
      await this.performInitialSync();
    } else {
      console.log('Performing incremental sync...');

      await this.performIncrementalSync();
    }
  }

  async performInitialSync() {
    let url = await this.contentfulService.getInitialSyncUrl();

    while (url) {
      const response = await this.contentfulService.fetchFromContentful(url);

      const { items, nextPageUrl, nextSyncUrl } = response;

      if (items.length === 0) {
        console.log('No more items to sync. Exiting loop.');
        break;
      }

      const products = this.contentfulService.transformResponse(items);

      await this.productService.upsertProducts(products);

      url = nextPageUrl || nextSyncUrl || null;

      if (!nextPageUrl && nextSyncUrl) {
        await this.contentfulService.saveOrUpdateSyncUrl(nextSyncUrl);
      }
    }
  }

  async performIncrementalSync() {
    const nextSyncUrl = await this.contentfulService.getSyncUrl();

    if (!nextSyncUrl) {
      console.warn('No nextSyncUrl found. Triggering an initial sync.');
      return this.performInitialSync();
    }

    let url = nextSyncUrl;

    while (url) {
      const response = await this.contentfulService.fetchFromContentful(url);
      const { items, nextPageUrl, nextSyncUrl } = response;

      if (items.length === 0) {
        console.log('No more items to sync. Exiting loop.');
        break;
      }

      const products = this.contentfulService.transformResponse(
        items.newEntries,
      );
      const deletedEntries = items.deletedEntries;

      await this.productService.upsertProducts(products);
      await this.productService.markProductsAsDeleted(deletedEntries);

      url = nextPageUrl || nextSyncUrl || null;

      if (!nextPageUrl && nextSyncUrl) {
        await this.contentfulService.saveOrUpdateSyncUrl(nextSyncUrl);
      }
    }
  }
}
