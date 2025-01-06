import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ContentfulService } from '../contentful/contentful.service';
import { ProductService } from '../products/products.service';
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
      Logger.log('Performing initial sync...');
      await this.performSync(true);
    } else {
      Logger.log('Performing incremental sync...');
      await this.performSync(false);
    }
  }

  private async performSync(isInitial: boolean) {
    let url = isInitial
      ? await this.contentfulService.getInitialSyncUrl()
      : await this.contentfulService.getSyncUrl();

    if (!url && !isInitial) {
      console.warn('No nextSyncUrl found. Triggering an initial sync.');
      return this.performSync(true);
    }

    while (url) {
      const response = await this.contentfulService.fetchFromContentful(url);
      const { items, nextPageUrl, nextSyncUrl } = response;

      if (items.length === 0) {
        Logger.log('No more items to sync. Exiting loop.');
        break;
      }

      const products = this.contentfulService.transformResponse(
        items.newEntries || items,
      );
      const deletedEntries =
        items
          .filter((item) => item.type === 'DeletedEntry')
          .map(({ id }) => ({
            id,
          })) || [];

      await this.productService.upsertProducts(products);

      if (deletedEntries.length > 0) {
        await this.productService.markProductsAsDeleted(deletedEntries);
      }

      url = nextPageUrl || nextSyncUrl || null;

      if (!nextPageUrl && nextSyncUrl) {
        await this.contentfulService.saveOrUpdateSyncUrl(nextSyncUrl);
      }
    }
  }
}
