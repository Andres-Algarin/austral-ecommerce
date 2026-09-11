import {
Body,
Controller,
Delete,
Get,
Param,
ParseIntPipe,
Patch,
Post,
UploadedFile,
UseGuards,
UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Multer } from 'multer';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles';

@Controller('categories')
export class CategoriesController {
constructor(
private readonly categoriesService: CategoriesService,
) {}

@Get()
findAll() {
return this.categoriesService.findAll();
}

@Get(':id')
findOne(
@Param('id', ParseIntPipe) id: number,
) {
return this.categoriesService.findOne(id);
}

@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@UseInterceptors(
FileInterceptor('imagen', {
storage: diskStorage({
destination: './uploads/categories',
filename: (
req,
file,
callback,
) => {
const uniqueSuffix =
Date.now() +
'-' +
Math.round(
Math.random() * 1e9,
);


      const extension =
        extname(file.originalname);

      callback(
        null,
        `categoria-${uniqueSuffix}${extension}`,
      );
    },
  }),
  fileFilter: (
    req,
    file,
    callback,
  ) => {
    if (
      !file.mimetype.startsWith(
        'image/',
      )
    ) {
      return callback(
        new Error(
          'Solo se permiten archivos de imagen',
        ),
        false,
      );
    }

    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}),


)
create(
@Body() createCategoryDto: CreateCategoryDto,
@UploadedFile() imagen?: Multer.File,
) {
return this.categoriesService.create(
createCategoryDto,
imagen,
);
}

@Patch(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@UseInterceptors(
FileInterceptor('imagen', {
storage: diskStorage({
destination: './uploads/categories',
filename: (
req,
file,
callback,
) => {
const uniqueSuffix =
Date.now() +
'-' +
Math.round(
Math.random() * 1e9,
);


      const extension =
        extname(file.originalname);

      callback(
        null,
        `categoria-${uniqueSuffix}${extension}`,
      );
    },
  }),
  fileFilter: (
    req,
    file,
    callback,
  ) => {
    if (
      !file.mimetype.startsWith(
        'image/',
      )
    ) {
      return callback(
        new Error(
          'Solo se permiten archivos de imagen',
        ),
        false,
      );
    }

    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}),


)
update(
@Param('id', ParseIntPipe) id: number,
@Body() updateCategoryDto: UpdateCategoryDto,
@UploadedFile() imagen?: Multer.File,
) {
return this.categoriesService.update(
id,
updateCategoryDto,
imagen,
);
}

@Delete(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
remove(
@Param('id', ParseIntPipe) id: number,
) {
return this.categoriesService.remove(id);
}
}
