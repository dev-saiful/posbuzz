import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async createSale(userId: string, saleData: CreateSaleDto) {
    return await this.prisma.$transaction(
      async (pri: Prisma.TransactionClient) => {
        let totalAmount = 0;
        const validatedItems = await Promise.all(
          saleData.items.map(async (item) => {
            const product = await pri.product.findUnique({
              where: { id: item.productId },
            });
            if (!product) {
              throw new NotFoundException(
                `Product with ID ${item.productId} not found`,
              );
            }
            if (product.stockQuantity < item.quantity) {
              throw new BadRequestException(
                `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`,
              );
            }

            totalAmount += Number(product.price) * item.quantity;
            return {
              productId: product.id,
              quantity: item.quantity,
              price: product.price,
            };
          }),
        );

        const sale = await pri.sale.create({
          data: {
            userId,
            totalAmount,
          },
        });
        await pri.saleItem.createMany({
          data: validatedItems.map((item) => ({
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        });

        for (const item of validatedItems) {
          await pri.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          });
        }

        return pri.sale.findUnique({
          where: { id: sale.id },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                  },
                },
              },
            },
          },
        });
      },
    );
  }

  async getAllSales(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.sale.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.sale.count(),
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

  async getSaleById(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }
}
