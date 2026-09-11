import {
ConflictException,
Injectable,
NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { Multer } from 'multer';

import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
constructor(
@InjectRepository(Category)
private readonly categoriesRepository: Repository<Category>,
) {}

async findAll() {
return this.categoriesRepository.find({
order: {
id_categoria: 'ASC',
},
});
}

async findOne(id: number) {
const category =
await this.categoriesRepository.findOne({
where: {
id_categoria: id,
},
});


if (!category) {
  throw new NotFoundException(
    'Categoría no encontrada',
  );
}

return category;


}

async create(
createCategoryDto: CreateCategoryDto,
imagen?: Multer.File,
) {
const existingCategory =
await this.categoriesRepository.findOne({
where: {
nombre: createCategoryDto.nombre,
},
});


if (existingCategory) {
  throw new ConflictException(
    'Ya existe una categoría con ese nombre',
  );
}

const category =
  this.categoriesRepository.create({
    nombre: createCategoryDto.nombre,
    imagen: imagen
      ? `/uploads/categories/${imagen.filename}`
      : null,
    estado: true,
  });

return this.categoriesRepository.save(
  category,
);


}

async update(
id: number,
updateCategoryDto: UpdateCategoryDto,
imagen?: Multer.File,
) {
const category =
await this.findOne(id);


if (
  updateCategoryDto.nombre &&
  updateCategoryDto.nombre !==
    category.nombre
) {
  const existingCategory =
    await this.categoriesRepository.findOne({
      where: {
        nombre:
          updateCategoryDto.nombre,
      },
    });

  if (existingCategory) {
    throw new ConflictException(
      'Ya existe una categoría con ese nombre',
    );
  }

  category.nombre =
    updateCategoryDto.nombre;
}

if (imagen) {
  category.imagen =
    `/uploads/categories/${imagen.filename}`;
}

if (
  updateCategoryDto.estado !==
  undefined
) {
  category.estado =
    updateCategoryDto.estado;
}

return this.categoriesRepository.save(
  category,
);


}

async remove(id: number) {
const category =
await this.findOne(id);


try {
  await this.categoriesRepository.remove(
    category,
  );

  return {
    message:
      'Categoría eliminada correctamente',
  };
} catch (error) {
  throw new ConflictException(
    'No se puede eliminar la categoría porque tiene productos asociados',
  );
}


}
}
