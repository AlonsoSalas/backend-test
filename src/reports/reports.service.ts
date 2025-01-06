import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, Not, Repository } from 'typeorm';
import { Product } from '../products/entities/products.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getDeletedProductsPercentage(): Promise<number> {
    const totalProducts = await this.productRepository.count();
    const deletedProducts = await this.productRepository.count({
      where: { isDeleted: true },
    });

    if (totalProducts === 0) return 0;
    return (deletedProducts / totalProducts) * 100;
  }

  async getNonDeletedProductsWithOrWithoutPricePercentage(): Promise<{
    withPricePercentage: number;
    withoutPricePercentage: number;
  }> {
    const totalNonDeletedProducts = await this.productRepository.count({
      where: { isDeleted: false },
    });

    if (totalNonDeletedProducts === 0) {
      return {
        withPricePercentage: 0,
        withoutPricePercentage: 0,
      };
    }

    const withPrice = await this.productRepository.count({
      where: { isDeleted: false, price: Not(IsNull()) },
    });

    const withoutPrice = totalNonDeletedProducts - withPrice;

    return {
      withPricePercentage: (withPrice / totalNonDeletedProducts) * 100,
      withoutPricePercentage: (withoutPrice / totalNonDeletedProducts) * 100,
    };
  }

  async getProductsInDateRange(
    startDate: string,
    endDate: string,
  ): Promise<Product[]> {
    return this.productRepository.find({
      where: {
        createdAt: Between(new Date(startDate), new Date(endDate)),
      },
    });
  }

  async getTop5MostExpensiveProducts(): Promise<any[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .select(['product.id', 'product.name', 'product.price'])
      .where('product.price IS NOT NULL')
      .orderBy('product.price', 'DESC')
      .limit(5)
      .getMany();
  }
}
