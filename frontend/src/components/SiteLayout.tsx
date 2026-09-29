import { Outlet } from "react-router-dom";

import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";

/*
|--------------------------------------------------------------------------
| Estructura común de la tienda: navbar fijo arriba, la página y el footer.
|
| El navbar vive aquí (y no dentro de cada página) para que ningún
| contenedor con "overflow: hidden" de una página rompa el
| "position: sticky" que lo mantiene visible al hacer scroll.
|--------------------------------------------------------------------------
*/
function SiteLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

export default SiteLayout;
