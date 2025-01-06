import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/products.entity';
import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { ProductDTO } from './dto/products.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async isInitialSyncCompleted(): Promise<boolean> {
    const count = await this.productRepository.count();
    return count > 0;
  }

  async getPaginatedAndFilteredProducts(
    page: number,
    limit: number,
    filters: {
      name?: string;
      priceMin?: number;
      priceMax?: number;
    },
  ) {
    const query = this.productRepository.createQueryBuilder('product');

    if (filters.name)
      query.andWhere('product.name ILIKE :name', { name: `%${filters.name}%` });
    if (filters.priceMin !== undefined)
      query.andWhere('product.price >= :priceMin', {
        priceMin: filters.priceMin,
      });
    if (filters.priceMax !== undefined)
      query.andWhere('product.price <= :priceMax', {
        priceMax: filters.priceMax,
      });

    query.skip((page - 1) * limit).take(limit);

    const [items, total] = await query.getManyAndCount();
    return {
      items,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async upsertProducts(products: ProductDTO[]) {
    for (const product of products) {
      const existingProduct = await this.productRepository.findOne({
        where: { contentfulId: product.contentfulId },
      });

      if (existingProduct) {
        await this.productRepository.update(existingProduct.id, product);
      } else {
        await this.productRepository.save(product);
      }
    }
  }

  async markProductsAsDeleted(deletedIds: string[]) {
    if (deletedIds.length) {
      await this.productRepository.update(
        { contentfulId: In(deletedIds) },
        { isDeleted: true },
      );
    }
  }

  async getDeletedPercentage() {
    const total = await this.productRepository.count();
    const deleted = await this.productRepository.count({
      where: { isDeleted: true },
    });
    return { deletedPercentage: (deleted / total) * 100 };
  }

  async getCustomPercentage({
    startDate,
    endDate,
  }: {
    startDate: string;
    endDate: string;
  }) {
    const query = this.productRepository
      .createQueryBuilder('product')
      .where('product.deleted = :deleted', { deleted: false });

    if (startDate)
      query.andWhere('product.createdAt >= :startDate', { startDate });
    if (endDate) query.andWhere('product.createdAt <= :endDate', { endDate });

    const total = await this.productRepository.count();
    const filtered = await query.getCount();
    return { filteredPercentage: (filtered / total) * 100 };
  }
}
