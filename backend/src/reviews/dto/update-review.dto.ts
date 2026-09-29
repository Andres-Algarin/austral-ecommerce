import { OmitType, PartialType } from '@nestjs/mapped-types';

import { CreateReviewDto } from './create-review.dto';

// El producto de una reseña no se puede cambiar.
export class UpdateReviewDto extends PartialType(
  OmitType(CreateReviewDto, ['id_producto'] as const),
) {}
