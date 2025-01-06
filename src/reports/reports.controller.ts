import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
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
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any> {
    const products = await this.reportsService.getProductsInDateRange(
      startDate,
      endDate,
    );
    return products;
  }

  @Get('top-5-most-expensive')
  async getTop5MostExpensiveProducts(): Promise<any> {
    return this.reportsService.getTop5MostExpensiveProducts();
  }
}
