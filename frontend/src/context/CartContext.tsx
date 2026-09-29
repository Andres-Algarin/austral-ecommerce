import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";

import { useAuth } from "./AuthContext";
import {
  addToCart,
  getCartItems,
  removeCartItem,
  updateCartItem,
  type ItemCarrito,
} from "../services/Cart";

/*
|--------------------------------------------------------------------------
| CARRITO
|--------------------------------------------------------------------------
| El carrito vive en el backend y requiere sesión. Este contexto
| mantiene una copia para mostrar el contador del navbar y la página
| del carrito sin pedirlo en cada componente.
*/

interface CartContextType {
  items: ItemCarrito[];
  cantidadTotal: number;
  cargando: boolean;
  recargar: () => Promise<void>;
  agregar: (id_producto: number, cantidad: number) => Promise<void>;
  actualizar: (id_detalle: number, cantidad: number) => Promise<void>;
  eliminar: (id_detalle: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();

  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [cargando, setCargando] = useState(false);

  const recargar = useCallback(async () => {
    if (!usuario) {
      setItems([]);
      return;
    }

    setCargando(true);

    try {
      setItems(await getCartItems());
    } catch {
      setItems([]);
    } finally {
      setCargando(false);
    }
  }, [usuario]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const agregar = async (id_producto: number, cantidad: number) => {
    await addToCart(id_producto, cantidad);
    await recargar();
  };

  const actualizar = async (id_detalle: number, cantidad: number) => {
    const actualizado = await updateCartItem(id_detalle, cantidad);

    setItems((actuales) =>
      actuales.map((item) =>
        item.id_detalle_carrito === id_detalle ? actualizado : item
      )
    );
  };

  const eliminar = async (id_detalle: number) => {
    await removeCartItem(id_detalle);

    setItems((actuales) =>
      actuales.filter((item) => item.id_detalle_carrito !== id_detalle)
    );
  };

  const cantidadTotal = items.reduce(
    (total, item) => total + item.cantidad,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        cantidadTotal,
        cargando,
        recargar,
        agregar,
        actualizar,
        eliminar,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe utilizarse dentro de CartProvider");
  }

  return context;
}
