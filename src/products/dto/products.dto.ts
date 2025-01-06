import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsUrl,
  IsISO8601,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

export class ProductDTO {
  @IsString()
  @IsNotEmpty()
  contentfulId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  brandId?: string;

  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsISO8601()
  @IsNotEmpty()
  createdAt: string;

  @IsISO8601()
  @IsNotEmpty()
  updatedAt: string;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}
