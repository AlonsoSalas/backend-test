import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('deleted-percentage')
  async getDeletedProductsPercentage(): Promise<{ percentage: number }> {
    const percentage = await this.reportsService.getDeletedProductsPercentage();
    return { percentage };
  }

  @Get('price-percentage')
  async getNonDeletedProductsWithOrWithoutPricePercentage(): Promise<{
    withPricePercentage: number;
    withoutPricePercentage: number;
  }> {
    const { withPricePercentage, withoutPricePercentage } =
      await this.reportsService.getNonDeletedProductsWithOrWithoutPricePercentage();
    return { withPricePercentage, withoutPricePercentage };
  }

  @Get('date-range')
  async getProductsInDateRange(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    if (!startDate || !endDate) {
      throw new BadRequestException(
        'startDate and endDate query parameters are required.',
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException(
        'Invalid date format. Use ISO 8601 format (YYYY-MM-DD).',
      );
    }

    return this.reportsService.getProductsInDateRange(startDate, endDate);
  }

  @Get('top-5-most-expensive')
  async getTop5MostExpensiveProducts(): Promise<any> {
    return this.reportsService.getTop5MostExpensiveProducts();
  }
}
