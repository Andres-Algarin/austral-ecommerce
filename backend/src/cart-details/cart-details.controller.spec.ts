import { Test, TestingModule } from '@nestjs/testing';
import { CartDetailsController } from './cart-details.controller';
import { CartDetailsService } from './cart-details.service';

describe('CartDetailsController', () => {
  let controller: CartDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartDetailsController],
      providers: [CartDetailsService],
    }).compile();

    controller = module.get<CartDetailsController>(CartDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
