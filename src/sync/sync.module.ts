import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { ProductsModule } from '../products/products.module';
import { ContentfulModule } from '../contentful/contentful.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/products.entity';
import { ContentfulService } from 'src/contentful/contentful.service';
import { ProductService } from 'src/products/products.service';
import { SyncState } from 'src/sync/entities/sync-state.entity';

@Module({
  imports: [
    ProductsModule,
    ContentfulModule,
    TypeOrmModule.forFeature([Product]),
    TypeOrmModule.forFeature([SyncState]),
  ],
  providers: [SyncService, ProductService, ContentfulService],
  exports: [SyncService],
})
export class SyncModule {}
