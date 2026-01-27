import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { AuthGuard } from 'src/auth/auth.guard';

interface AuthenticatedRequest extends Request {
  user: { sub: string; email: string };
}

@Controller('sales')
@UseGuards(AuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  async createSale(
    @Req() req: AuthenticatedRequest,
    @Body() createSaleDto: CreateSaleDto,
  ) {
    return this.salesService.createSale(req.user.sub, createSaleDto);
  }

  @Get()
  async getAllSales(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.salesService.getAllSales(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get(':id')
  async getSaleById(@Param('id') id: string) {
    return this.salesService.getSaleById(id);
  }
}
