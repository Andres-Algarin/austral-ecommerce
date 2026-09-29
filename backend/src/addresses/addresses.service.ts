import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Address } from './entities/address.entity';
import { Order } from '../orders/entities/order.entity';

import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressesRepository: Repository<Address>,
  ) {}

  async create(
    id_usuario: number,
    createAddressDto: CreateAddressDto,
  ) {
    /*
     * Si la nueva dirección será predeterminada,
     * quitamos la anterior como predeterminada.
     */
    if (createAddressDto.predeterminada === true) {
      await this.addressesRepository.update(
        {
          id_usuario,
          predeterminada: true,
        },
        {
          predeterminada: false,
        },
      );
    }

    /*
     * Si el usuario no tiene ninguna dirección,
     * la primera será automáticamente predeterminada.
     */
    const cantidadDirecciones =
      await this.addressesRepository.count({
        where: {
          id_usuario,
        },
      });

    const predeterminada =
      cantidadDirecciones === 0
        ? true
        : createAddressDto.predeterminada ?? false;

    const address =
      this.addressesRepository.create({
        ...createAddressDto,
        id_usuario,
        predeterminada,
      });

    return await this.addressesRepository.save(address);
  }

  async findAll(id_usuario: number) {
    return await this.addressesRepository.find({
      where: {
        id_usuario,
      },
      order: {
        predeterminada: 'DESC',
        id_direccion: 'DESC',
      },
    });
  }

  async findOne(
    id: number,
    id_usuario: number,
  ) {
    const address =
      await this.addressesRepository.findOne({
        where: {
          id_direccion: id,
          id_usuario,
        },
      });

    if (!address) {
      throw new NotFoundException(
        `No existe una dirección con el ID ${id}`,
      );
    }

    return address;
  }

  async update(
    id: number,
    id_usuario: number,
    updateAddressDto: UpdateAddressDto,
  ) {
    const address = await this.findOne(
      id,
      id_usuario,
    );

    /*
     * Si se marca como predeterminada,
     * quitamos esa condición de las demás.
     */
    if (updateAddressDto.predeterminada === true) {
      await this.addressesRepository.update(
        {
          id_usuario,
          predeterminada: true,
        },
        {
          predeterminada: false,
        },
      );
    }

    Object.assign(
      address,
      updateAddressDto,
    );

    return await this.addressesRepository.save(
      address,
    );
  }

  async remove(
    id: number,
    id_usuario: number,
  ) {
    const address = await this.findOne(
      id,
      id_usuario,
    );

    /*
     * Los pedidos guardan una referencia a la dirección
     * (FK con RESTRICT), así que no se puede borrar si
     * ya se usó en alguno.
     */
    const pedidosConDireccion =
      await this.addressesRepository.manager.count(Order, {
        where: {
          id_direccion: id,
        },
      });

    if (pedidosConDireccion > 0) {
      throw new BadRequestException(
        'No se puede eliminar la dirección porque está asociada a uno o más pedidos.',
      );
    }

    const eraPredeterminada =
      address.predeterminada;

    await this.addressesRepository.remove(
      address,
    );

    /*
     * Si eliminamos la dirección predeterminada,
     * intentamos establecer otra como predeterminada.
     */
    if (eraPredeterminada) {
      const siguiente =
        await this.addressesRepository.findOne({
          where: {
            id_usuario,
          },
          order: {
            id_direccion: 'DESC',
          },
        });

      if (siguiente) {
        siguiente.predeterminada = true;

        await this.addressesRepository.save(
          siguiente,
        );
      }
    }

    return {
      message:
        'Dirección eliminada correctamente',
    };
  }
}

