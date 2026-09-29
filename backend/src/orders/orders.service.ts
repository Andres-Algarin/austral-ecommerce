import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  In,
  Repository,
} from 'typeorm';

import {
  ORDER_STATES,
  Order,
  OrderState,
} from './entities/order.entity';
import { Address } from '../addresses/entities/address.entity';
import { Cart } from '../carts/entities/cart.entity';
import { CartDetail } from '../cart-details/entities/cart-detail.entity';
import { Product } from '../products/entities/product.entity';
import { OrderDetail } from '../order-details/entities/order-detail.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import {
  MailService,
  escapeHtml,
  formatoPesos,
} from '../mail/mail.service';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

/*
 * Cambios de estado permitidos.
 *
 * Cualquier estado anterior a "Enviado" puede cancelarse;
 * al cancelar se devuelve el stock.
 */
const TRANSICIONES: Record<OrderState, OrderState[]> = {
  Pendiente: ['Pagado', 'Cancelado'],
  Pagado: ['Preparando', 'Cancelado'],
  Preparando: ['Enviado', 'Cancelado'],
  Enviado: ['Entregado'],
  Entregado: [],
  Cancelado: [],
};

/*
 * Los valores monetarios se calculan en centavos para
 * evitar errores de redondeo con decimales.
 */
const toCents = (value: number | string) =>
  Math.round(Number(value) * 100);

const fromCents = (cents: number) => cents / 100;

/*
 * Reemplaza el usuario completo (que incluye password_hash)
 * por sus datos de contacto.
 */
const conClientePublico = (pedido: Order) => {
  const { usuario, ...resto } = pedido;

  return {
    ...resto,
    cliente: usuario
      ? {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          telefono: usuario.telefono,
        }
      : null,
  };
};

// Estados que cuentan como venta (ya pagados y no cancelados).
const ESTADOS_VENTA: OrderState[] = [
  'Pagado',
  'Preparando',
  'Enviado',
  'Entregado',
];

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,

    private readonly dataSource: DataSource,

    private readonly config: ConfigService,

    private readonly mailService: MailService,
  ) {}

  // ============================================================
  // RESUMEN DEL CHECKOUT (antes de confirmar)
  //
  // Mismo cálculo que el pedido real, pero sin bloquear ni
  // guardar nada. Devuelve los problemas en "errores" en lugar
  // de fallar, para que el frontend pueda mostrarlos.
  // ============================================================

  async checkoutSummary(id_usuario: number) {
    const evaluacion = await this.evaluarCarrito(
      this.dataSource.manager,
      id_usuario,
      false,
    );

    const envioGratisDesde = this.envioGratisDesdeCents();

    return {
      items: evaluacion.lineas.map((linea) => ({
        id_producto: linea.producto.id_producto,
        nombre: linea.producto.nombre,
        imagen_principal: linea.producto.imagen_principal,
        cantidad: linea.cantidad,
        stock: linea.producto.stock,
        precio_unitario: fromCents(linea.precioCents),
        subtotal: fromCents(linea.subtotalCents),
      })),
      subtotal: fromCents(evaluacion.subtotalCents),
      descuento: 0,
      costo_envio: fromCents(evaluacion.costoEnvioCents),
      total: fromCents(
        evaluacion.subtotalCents + evaluacion.costoEnvioCents,
      ),
      envio_gratis_desde:
        envioGratisDesde === null ? null : fromCents(envioGratisDesde),
      falta_para_envio_gratis:
        envioGratisDesde === null
          ? null
          : fromCents(
              Math.max(0, envioGratisDesde - evaluacion.subtotalCents),
            ),
      errores: evaluacion.errores,
      puede_comprar:
        evaluacion.lineas.length > 0 && evaluacion.errores.length === 0,
    };
  }

  // ============================================================
  // CREAR PEDIDO A PARTIR DEL CARRITO
  //
  // Todo ocurre en una transacción: si algo falla, no se crea
  // el pedido, no se descuenta stock y el carrito queda igual.
  // ============================================================

  async create(
    id_usuario: number,
    createOrderDto: CreateOrderDto,
  ) {
    const {
      id_direccion,
      nombre_receptor,
      cedula_receptor,
      telefono_receptor,
    } = createOrderDto;

    const id_pedido = await this.dataSource.transaction(
      async (manager) => {
        const direccion = await this.findUserAddress(
          manager,
          id_direccion,
          id_usuario,
        );

        // Bloquea los productos (SELECT ... FOR UPDATE) para que
        // dos compras simultáneas no vendan el mismo stock.
        const {
          carrito,
          lineas,
          errores,
          subtotalCents,
          costoEnvioCents,
        } = await this.evaluarCarrito(manager, id_usuario, true);

        if (!carrito || lineas.length === 0) {
          throw new BadRequestException(
            'El carrito está vacío.',
          );
        }

        if (errores.length > 0) {
          throw new BadRequestException(errores);
        }

        const descuentoCents = 0;

        // Si no se indica quién recibe, recibe el mismo cliente.
        const cliente = await manager.findOne(User, {
          where: {
            id_usuario,
          },
          select: {
            nombre: true,
            apellido: true,
            cedula: true,
            telefono: true,
          },
        });

        // ----------------------------------------------------------
        // CREAR PEDIDO
        // ----------------------------------------------------------

        const pedido = await manager.save(
          manager.create(Order, {
            id_usuario,
            id_direccion,
            nombre_receptor:
              nombre_receptor?.trim() ||
              (cliente ? `${cliente.nombre} ${cliente.apellido}`.trim() : null),
            cedula_receptor: cedula_receptor?.trim() || cliente?.cedula || null,
            telefono_receptor:
              telefono_receptor?.trim() ||
              direccion.telefono_contacto ||
              cliente?.telefono ||
              null,
            direccion_envio: direccion.direccion,
            ciudad_envio: direccion.ciudad,
            departamento_envio: direccion.departamento,
            estado: 'Pendiente',
            fecha_envio: null,
            subtotal: fromCents(subtotalCents),
            descuento: fromCents(descuentoCents),
            costo_envio: fromCents(costoEnvioCents),
            total: fromCents(
              subtotalCents - descuentoCents + costoEnvioCents,
            ),
          }),
        );

        // ----------------------------------------------------------
        // CREAR DETALLES
        //
        // El precio sale de la base de datos y queda guardado como
        // copia histórica.
        // ----------------------------------------------------------

        await manager.save(
          lineas.map((linea) =>
            manager.create(OrderDetail, {
              id_pedido: pedido.id_pedido,
              id_producto: linea.producto.id_producto,
              cantidad: linea.cantidad,
              precio_unitario: fromCents(linea.precioCents),
              subtotal: fromCents(linea.subtotalCents),
            }),
          ),
        );

        // ----------------------------------------------------------
        // DESCONTAR STOCK
        // ----------------------------------------------------------

        for (const linea of lineas) {
          await manager.decrement(
            Product,
            { id_producto: linea.producto.id_producto },
            'stock',
            linea.cantidad,
          );
        }

        // ----------------------------------------------------------
        // VACIAR CARRITO
        // ----------------------------------------------------------

        await manager.delete(CartDetail, {
          id_carrito: carrito.id_carrito,
        });

        return pedido.id_pedido;
      },
    );

    const pedido = await this.findOne(id_pedido, id_usuario);

    this.notificarPedidoCreado(pedido);

    return pedido;
  }

  // ============================================================
  // PEDIDOS DEL USUARIO
  // ============================================================

  async findAll(id_usuario: number) {
    return await this.ordersRepository.find({
      where: {
        id_usuario,
      },

      relations: {
        detalles: {
          producto: true,
        },
      },

      order: {
        fecha: 'DESC',
      },
    });
  }

  // ============================================================
  // TODOS LOS PEDIDOS (ADMIN)
  // ============================================================

  async findAllAdmin(estado?: OrderState) {
    const pedidos = await this.ordersRepository.find({
      where: estado ? { estado } : {},

      relations: {
        usuario: true,
        detalles: {
          producto: true,
        },
      },

      order: {
        fecha: 'DESC',
      },
    });

    return pedidos.map(conClientePublico);
  }

  // ============================================================
  // UN PEDIDO (ADMIN, con datos básicos del cliente)
  // ============================================================

  async findOneAdmin(id: number) {
    const pedido = await this.ordersRepository.findOne({
      where: {
        id_pedido: id,
      },

      relations: {
        usuario: true,
        direccion_relacionada: true,
        detalles: {
          producto: true,
        },
      },
    });

    if (!pedido) {
      throw new NotFoundException(
        `No existe un pedido con el ID ${id}`,
      );
    }

    return conClientePublico(pedido);
  }

  // ============================================================
  // UN PEDIDO
  //
  // Si no se pasa id_usuario (admin), no se filtra por dueño.
  // ============================================================

  async findOne(
    id: number,
    id_usuario?: number,
  ) {
    const order =
      await this.ordersRepository.findOne({
        where: {
          id_pedido: id,
          ...(id_usuario !== undefined && { id_usuario }),
        },

        relations: {
          direccion_relacionada: true,
          detalles: {
            producto: true,
          },
        },
      });

    if (!order) {
      throw new NotFoundException(
        `No existe un pedido con el ID ${id}`,
      );
    }

    return order;
  }

  // ============================================================
  // ACTUALIZAR DATOS DE ENVÍO (CLIENTE)
  //
  // Solo mientras el pedido siga "Pendiente".
  // ============================================================

  async update(
    id: number,
    id_usuario: number,
    updateOrderDto: UpdateOrderDto,
  ) {
    await this.dataSource.transaction(async (manager) => {
      const order = await this.findOrderForUpdate(
        manager,
        id,
        id_usuario,
      );

      if (order.estado !== 'Pendiente') {
        throw new BadRequestException(
          'Solo se pueden modificar pedidos en estado "Pendiente".',
        );
      }

      if (updateOrderDto.id_direccion !== undefined) {
        const direccion = await this.findUserAddress(
          manager,
          updateOrderDto.id_direccion,
          id_usuario,
        );

        order.id_direccion = direccion.id_direccion;
        order.direccion_envio = direccion.direccion;
        order.ciudad_envio = direccion.ciudad;
        order.departamento_envio = direccion.departamento;
      }

      if (updateOrderDto.nombre_receptor !== undefined) {
        order.nombre_receptor =
          updateOrderDto.nombre_receptor.trim();
      }

      if (updateOrderDto.cedula_receptor !== undefined) {
        order.cedula_receptor =
          updateOrderDto.cedula_receptor.trim();
      }

      if (updateOrderDto.telefono_receptor !== undefined) {
        order.telefono_receptor =
          updateOrderDto.telefono_receptor.trim();
      }

      await manager.save(order);
    });

    return this.findOne(id, id_usuario);
  }

  // ============================================================
  // CANCELAR PEDIDO (CLIENTE)
  //
  // El cliente solo puede cancelar mientras esté "Pendiente".
  // ============================================================

  async cancel(
    id: number,
    id_usuario: number,
  ) {
    await this.dataSource.transaction(async (manager) => {
      const order = await this.findOrderForUpdate(
        manager,
        id,
        id_usuario,
      );

      if (order.estado !== 'Pendiente') {
        throw new BadRequestException(
          'Solo se pueden cancelar pedidos en estado "Pendiente".',
        );
      }

      await this.cancelOrder(manager, order);
    });

    const pedido = await this.findOne(id, id_usuario);

    this.notificarCambioEstado(pedido);

    return pedido;
  }

  // ============================================================
  // CAMBIAR ESTADO / VALORES (ADMIN)
  // ============================================================

  async updateStatus(
    id: number,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const { estado, descuento, costo_envio } =
      updateOrderStatusDto;

    // Se asigna dentro de la transacción.
    const anterior: { estado?: OrderState } = {};

    await this.dataSource.transaction(async (manager) => {
      const order = await this.findOrderForUpdate(
        manager,
        id,
      );

      anterior.estado = order.estado;

      // ----------------------------------------------------------
      // DESCUENTO Y ENVÍO
      // ----------------------------------------------------------

      if (descuento !== undefined || costo_envio !== undefined) {
        if (order.estado !== 'Pendiente') {
          throw new BadRequestException(
            'El descuento y el costo de envío solo se pueden modificar en pedidos "Pendiente".',
          );
        }

        const subtotalCents = toCents(order.subtotal);
        const descuentoCents = toCents(
          descuento ?? order.descuento,
        );
        const costoEnvioCents = toCents(
          costo_envio ?? order.costo_envio,
        );

        const totalCents =
          subtotalCents - descuentoCents + costoEnvioCents;

        if (totalCents < 0) {
          throw new BadRequestException(
            'El descuento no puede ser mayor que el subtotal más el envío.',
          );
        }

        order.descuento = fromCents(descuentoCents);
        order.costo_envio = fromCents(costoEnvioCents);
        order.total = fromCents(totalCents);
      }

      // ----------------------------------------------------------
      // ESTADO
      // ----------------------------------------------------------

      if (estado !== undefined && estado !== order.estado) {
        if (!TRANSICIONES[order.estado].includes(estado)) {
          throw new BadRequestException(
            `No se puede pasar un pedido de "${order.estado}" a "${estado}".`,
          );
        }

        if (estado === 'Cancelado') {
          await this.cancelOrder(manager, order);
          return;
        }

        order.estado = estado;

        if (estado === 'Enviado') {
          order.fecha_envio = new Date();
        }
      }

      await manager.save(order);
    });

    const pedido = await this.findOne(id);

    if (pedido.estado !== anterior.estado) {
      this.notificarCambioEstado(pedido);
    }

    return this.findOneAdmin(id);
  }

  // ============================================================
  // RESUMEN PARA EL PANEL DE ADMINISTRACIÓN
  // ============================================================

  async adminStats() {
    const manager = this.dataSource.manager;

    const hace30Dias = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    );

    const [
      porEstadoRaw,
      ventasTotalesRaw,
      ventas30DiasRaw,
      productosBajoStock,
      totalClientes,
      productosActivos,
    ] = await Promise.all([
      manager
        .createQueryBuilder(Order, 'o')
        .select('o.estado', 'estado')
        .addSelect('COUNT(*)', 'cantidad')
        .groupBy('o.estado')
        .getRawMany<{ estado: OrderState; cantidad: string }>(),

      manager
        .createQueryBuilder(Order, 'o')
        .select('COALESCE(SUM(o.total), 0)', 'monto')
        .addSelect('COUNT(*)', 'cantidad')
        .where('o.estado IN (:...estados)', { estados: ESTADOS_VENTA })
        .getRawOne<{ monto: string; cantidad: string }>(),

      manager
        .createQueryBuilder(Order, 'o')
        .select('COALESCE(SUM(o.total), 0)', 'monto')
        .addSelect('COUNT(*)', 'cantidad')
        .where('o.estado IN (:...estados)', { estados: ESTADOS_VENTA })
        .andWhere('o.fecha >= :desde', { desde: hace30Dias })
        .getRawOne<{ monto: string; cantidad: string }>(),

      manager.find(Product, {
        where: {
          estado: true,
        },
        order: {
          stock: 'ASC',
        },
        take: 10,
        select: {
          id_producto: true,
          nombre: true,
          stock: true,
          imagen_principal: true,
        },
      }),

      manager.count(User, {
        where: {
          rol: 'cliente',
        },
      }),

      manager.count(Product, {
        where: {
          estado: true,
        },
      }),
    ]);

    const pedidosPorEstado = Object.fromEntries(
      ORDER_STATES.map((estado) => [estado, 0]),
    ) as Record<OrderState, number>;

    for (const fila of porEstadoRaw) {
      pedidosPorEstado[fila.estado] = Number(fila.cantidad);
    }

    const umbralBajoStock = 5;

    return {
      ventas_totales: {
        monto: Number(ventasTotalesRaw?.monto ?? 0),
        pedidos: Number(ventasTotalesRaw?.cantidad ?? 0),
      },
      ventas_ultimos_30_dias: {
        monto: Number(ventas30DiasRaw?.monto ?? 0),
        pedidos: Number(ventas30DiasRaw?.cantidad ?? 0),
      },
      pedidos_por_estado: pedidosPorEstado,
      pedidos_pendientes: pedidosPorEstado.Pendiente,
      productos_bajo_stock: productosBajoStock.filter(
        (producto) => producto.stock <= umbralBajoStock,
      ),
      umbral_bajo_stock: umbralBajoStock,
      total_clientes: totalClientes,
      productos_activos: productosActivos,
    };
  }

  // ============================================================
  // HELPERS
  // ============================================================

  /*
   * Lee el carrito y calcula las líneas del pedido.
   *
   * Con bloquear = true (checkout real) bloquea las filas de los
   * productos hasta que termine la transacción.
   */
  private async evaluarCarrito(
    manager: EntityManager,
    id_usuario: number,
    bloquear: boolean,
  ) {
    const carrito = await manager.findOne(Cart, {
      where: {
        id_usuario,
      },
    });

    const itemsCarrito = carrito
      ? await manager.find(CartDetail, {
          where: {
            id_carrito: carrito.id_carrito,
          },
        })
      : [];

    // Agrupar por producto por si hubiera filas repetidas.
    const cantidades = new Map<number, number>();

    for (const item of itemsCarrito) {
      cantidades.set(
        item.id_producto,
        (cantidades.get(item.id_producto) ?? 0) + item.cantidad,
      );
    }

    const productos =
      cantidades.size === 0
        ? []
        : await manager.find(Product, {
            where: {
              id_producto: In([...cantidades.keys()]),
            },
            order: {
              id_producto: 'ASC',
            },
            ...(bloquear && {
              lock: {
                mode: 'pessimistic_write' as const,
              },
            }),
          });

    const categoriasInactivas = new Set(
      productos.length === 0
        ? []
        : (
            await manager.find(Category, {
              where: {
                id_categoria: In(
                  productos.map((producto) => producto.id_categoria),
                ),
                estado: false,
              },
            })
          ).map((categoria) => categoria.id_categoria),
    );

    const productosPorId = new Map(
      productos.map((producto) => [producto.id_producto, producto]),
    );

    const errores: string[] = [];
    const lineas: {
      producto: Product;
      cantidad: number;
      precioCents: number;
      subtotalCents: number;
    }[] = [];

    for (const [id_producto, cantidad] of cantidades) {
      const producto = productosPorId.get(id_producto);

      if (!producto) {
        errores.push(`El producto con ID ${id_producto} ya no existe.`);
        continue;
      }

      if (
        !producto.estado ||
        categoriasInactivas.has(producto.id_categoria)
      ) {
        errores.push(
          `El producto "${producto.nombre}" ya no está disponible.`,
        );
      } else if (producto.stock < cantidad) {
        errores.push(
          `Stock insuficiente para "${producto.nombre}". Stock disponible: ${producto.stock}.`,
        );
      }

      const precioCents = toCents(producto.precio);

      lineas.push({
        producto,
        cantidad,
        precioCents,
        subtotalCents: precioCents * cantidad,
      });
    }

    const subtotalCents = lineas.reduce(
      (total, linea) => total + linea.subtotalCents,
      0,
    );

    return {
      carrito,
      lineas,
      errores,
      subtotalCents,
      costoEnvioCents:
        lineas.length === 0 ? 0 : this.costoEnvioCents(subtotalCents),
    };
  }

  /*
   * Envío: COSTO_ENVIO, o gratis si el subtotal llega a
   * ENVIO_GRATIS_DESDE (ambos en el .env).
   */
  private costoEnvioCents(subtotalCents: number) {
    const gratisDesde = this.envioGratisDesdeCents();

    if (gratisDesde !== null && subtotalCents >= gratisDesde) {
      return 0;
    }

    return toCents(this.config.get<string>('COSTO_ENVIO') || 0);
  }

  private envioGratisDesdeCents() {
    const valor = this.config.get<string>('ENVIO_GRATIS_DESDE');

    return valor ? toCents(valor) : null;
  }

  // ------------------------------------------------------------
  // CORREOS (no bloquean ni hacen fallar la operación)
  // ------------------------------------------------------------

  private notificarPedidoCreado(pedido: Order) {
    void this.enviarCorreoPedido(
      pedido,
      `Recibimos tu pedido #${pedido.id_pedido}`,
      'Gracias por tu compra. Este es el resumen de tu pedido:',
    );
  }

  private notificarCambioEstado(pedido: Order) {
    const mensajes: Partial<Record<OrderState, string>> = {
      Pagado: 'Confirmamos el pago de tu pedido.',
      Preparando: 'Estamos preparando tu pedido.',
      Enviado: 'Tu pedido va en camino.',
      Entregado: 'Tu pedido fue entregado. ¡Esperamos que lo disfrutes!',
      Cancelado:
        'Tu pedido fue cancelado. Si tienes preguntas, contáctanos.',
    };

    const mensaje = mensajes[pedido.estado];

    if (mensaje) {
      void this.enviarCorreoPedido(
        pedido,
        `Pedido #${pedido.id_pedido}: ${pedido.estado}`,
        mensaje,
      );
    }
  }

  private async enviarCorreoPedido(
    pedido: Order,
    asunto: string,
    introduccion: string,
  ) {
    const usuario = await this.dataSource.manager.findOne(User, {
      where: {
        id_usuario: pedido.id_usuario,
      },
      select: {
        correo: true,
        nombre: true,
      },
    });

    if (!usuario) {
      return;
    }

    const filas = pedido.detalles
      .map(
        (detalle) =>
          `<tr><td>${escapeHtml(detalle.producto?.nombre)}</td><td>${detalle.cantidad}</td><td>${formatoPesos(detalle.subtotal)}</td></tr>`,
      )
      .join('');

    this.mailService.sendInBackground({
      para: usuario.correo,
      asunto,
      html: `
        <p>Hola ${escapeHtml(usuario.nombre)},</p>
        <p>${escapeHtml(introduccion)}</p>
        <p><strong>Pedido #${pedido.id_pedido}</strong> · Estado: ${escapeHtml(pedido.estado)}</p>
        <table cellpadding="6">
          <tr><th align="left">Producto</th><th>Cant.</th><th align="left">Subtotal</th></tr>
          ${filas}
        </table>
        <p>Subtotal: ${formatoPesos(pedido.subtotal)}<br>
        Descuento: ${formatoPesos(pedido.descuento)}<br>
        Envío: ${formatoPesos(pedido.costo_envio)}<br>
        <strong>Total: ${formatoPesos(pedido.total)}</strong></p>
        <p><a href="${this.mailService.frontendUrl}/mis-pedidos/${pedido.id_pedido}">Ver mi pedido</a></p>
      `,
    });
  }

  private async findUserAddress(
    manager: EntityManager,
    id_direccion: number,
    id_usuario: number,
  ) {
    const direccion = await manager.findOne(Address, {
      where: {
        id_direccion,
        id_usuario,
      },
    });

    if (!direccion) {
      throw new BadRequestException(
        'La dirección seleccionada no pertenece al usuario.',
      );
    }

    return direccion;
  }

  /*
   * Busca y bloquea el pedido para evitar que dos cambios
   * de estado simultáneos (p. ej. dos cancelaciones)
   * devuelvan el stock dos veces.
   */
  private async findOrderForUpdate(
    manager: EntityManager,
    id: number,
    id_usuario?: number,
  ) {
    const order = await manager.findOne(Order, {
      where: {
        id_pedido: id,
        ...(id_usuario !== undefined && { id_usuario }),
      },
      lock: {
        mode: 'pessimistic_write',
      },
    });

    if (!order) {
      throw new NotFoundException(
        `No existe un pedido con el ID ${id}`,
      );
    }

    return order;
  }

  /*
   * Marca el pedido como cancelado y devuelve el stock
   * de cada producto.
   */
  private async cancelOrder(
    manager: EntityManager,
    order: Order,
  ) {
    const detalles = await manager.find(OrderDetail, {
      where: {
        id_pedido: order.id_pedido,
      },
      order: {
        id_producto: 'ASC',
      },
    });

    for (const detalle of detalles) {
      await manager.increment(
        Product,
        { id_producto: detalle.id_producto },
        'stock',
        detalle.cantidad,
      );
    }

    order.estado = 'Cancelado';

    await manager.save(order);
  }
}
