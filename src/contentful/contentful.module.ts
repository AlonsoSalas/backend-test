import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentfulService } from './contentful.service';
import { SyncState } from '../sync/entities/sync-state.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SyncState])],
  providers: [ContentfulService],
  exports: [ContentfulService],
})
export class ContentfulModule {}
