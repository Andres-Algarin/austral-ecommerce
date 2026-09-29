import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartDetailsService } from './cart-details.service';
import { CartDetailsController } from './cart-details.controller';

import { CartDetail } from './entities/cart-detail.entity';
import { Cart } from '../carts/entities/cart.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CartDetail,
      Cart,
      Product,
    ]),
  ],
  controllers: [
    CartDetailsController,
  ],
  providers: [
    CartDetailsService,
  ],
})
export class CartDetailsModule {}