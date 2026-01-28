import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(createProductDto: CreateProductDto) {
    // Check for duplicate SKU
    const existing = await this.prisma.product.findUnique({
      where: { sku: createProductDto.sku },
    });
    if (existing) {
      throw new ConflictException(
        `Product with SKU ${createProductDto.sku} already exists`,
      );
    }

    return await this.prisma.product.create({
      data: createProductDto,
    });
  }

  async getAllProducts(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    await this.getProductById(id); // Verify exists first

    // Check for duplicate SKU if updating SKU
    if (updateProductDto.sku) {
      const existing = await this.prisma.product.findUnique({
        where: { sku: updateProductDto.sku },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Product with SKU ${updateProductDto.sku} already exists`,
        );
      }
    }

    return await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async deleteProduct(id: string) {
    await this.getProductById(id); // Verify exists first
    try {
      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new ConflictException(
          'Cannot delete product. It is referenced in existing sales.',
        );
      }
      throw error;
    }
  }
}
