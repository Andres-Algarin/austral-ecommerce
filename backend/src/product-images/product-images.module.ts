import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductImagesController } from './product-images.controller';
import { ProductImagesService } from './product-images.service';
import { ProductImage } from './entities/product-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductImage]),
  ],

  controllers: [
    ProductImagesController,
  ],

  providers: [
    ProductImagesService,
  ],
})
export class ProductImagesModule {}
