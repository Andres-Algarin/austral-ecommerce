import { Test, TestingModule } from '@nestjs/testing';
import { CartDetailsService } from './cart-details.service';

describe('CartDetailsService', () => {
  let service: CartDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartDetailsService],
    }).compile();

    service = module.get<CartDetailsService>(CartDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
