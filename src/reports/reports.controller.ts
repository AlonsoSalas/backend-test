import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('deleted-percentage')
  @ApiOperation({
    summary: 'Get the percentage of deleted products',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched the deleted products percentage',
    schema: {
      example: {
        percentage: 25.5,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, token is missing or invalid',
  })
  async getDeletedProductsPercentage(): Promise<{ percentage: number }> {
    const percentage = await this.reportsService.getDeletedProductsPercentage();
    return { percentage };
  }

  @Get('price-percentage')
  @ApiOperation({
    summary:
      'Get the percentage of non-deleted products with or without a price',
  })
  @ApiResponse({
    status: 200,
    description:
      'Successfully fetched the price percentage for non-deleted products',
    schema: {
      example: {
        withPricePercentage: 80,
        withoutPricePercentage: 20,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, token is missing or invalid',
  })
  async getNonDeletedProductsWithOrWithoutPricePercentage(): Promise<{
    withPricePercentage: number;
    withoutPricePercentage: number;
  }> {
    const { withPricePercentage, withoutPricePercentage } =
      await this.reportsService.getNonDeletedProductsWithOrWithoutPricePercentage();
    return { withPricePercentage, withoutPricePercentage };
  }

  @Get('date-range')
  @ApiOperation({
    summary: 'Get products created within a specific date range',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: 'Start date of the range in ISO 8601 format (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    description: 'End date of the range in ISO 8601 format (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched products within the date range',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date format or missing query parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, token is missing or invalid',
  })
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
  @ApiOperation({
    summary: 'Get the top 5 most expensive products',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched the top 5 most expensive products',
    schema: {
      example: [
        { id: '123', name: 'Product A', price: 200 },
        { id: '456', name: 'Product B', price: 150 },
        { id: '789', name: 'Product C', price: 100 },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, token is missing or invalid',
  })
  async getTop5MostExpensiveProducts(): Promise<any> {
    return this.reportsService.getTop5MostExpensiveProducts();
  }
}
