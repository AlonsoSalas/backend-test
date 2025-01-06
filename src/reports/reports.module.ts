import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/products.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ReportsController],
  providers: [JwtService, ReportsService],
})
export class ReportsModule {}
