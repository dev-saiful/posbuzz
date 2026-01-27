import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { SalesModule } from './sales/sales.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [ConfigModule.forRoot(
    {
      isGlobal: true,
    }
  ), AuthModule, UsersModule, PrismaModule, SalesModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
