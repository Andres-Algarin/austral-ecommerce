import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/*
|--------------------------------------------------------------------------
| Al cambiar de página, vuelve arriba (salvo que se navegue a un #ancla
| o solo cambien los filtros de la misma página).
|--------------------------------------------------------------------------
*/
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

export default ScrollToTop;
