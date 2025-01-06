import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  contentfulId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  sku?: string;

  @Column({ nullable: true })
  brandId?: string;

  @Column('text', { array: true, default: [] })
  categories: string[];

  @Column('decimal', { nullable: true })
  price?: number;

  @Column({ type: 'integer', nullable: true })
  stock?: number;

  @Column('text', { array: true, default: [] })
  images: string[];

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  slug?: string;

  @Column('text', { array: true, default: [] })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  website?: string;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
