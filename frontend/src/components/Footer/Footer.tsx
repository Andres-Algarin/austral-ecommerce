import { Link } from "react-router-dom";
import {
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import "./Footer.css";

function Footer() {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand-column">
            <Link
              to="/"
              className="footer-logo-link"
            >
              <img
                src="/Logo-cropped.png"
                alt="Austral"
                className="footer-logo"
              />
            </Link>

            <p className="footer-slogan">
              Cosmética natural formulada bajo principios
              de sostenibilidad y ciencia, inspirada en la
              sabiduría de la tierra.
            </p>

          <div className="footer-socials">
            <a
              href="https://www.instagram.com/austral_cosmetica_natural?stkn=cmhxbWt5b3VkN3Y0"
              className="footer-social"
              aria-label="Instagram de Austral"
              target="_blank"
              rel="noopener noreferrer"
            >
              IG
            </a>
          </div>
          </div>

          <div className="footer-column">
            <span className="footer-column-title">
              EXPERIENCIA AUSTRAL
            </span>

            <nav className="footer-links">
              <Link to="/valor-de-nuestros-ingredientes">
                El valor de nuestros ingredientes
              </Link>

              <Link to="/preguntas-frecuentes">
                Preguntas frecuentes
              </Link>

              <Link to="/quienes-somos">
                Quiénes somos
              </Link>
            </nav>
          </div>

          <div className="footer-column">
            <span className="footer-column-title">
              LEGAL
            </span>

            <nav className="footer-links">
              <Link to="/privacidad">
                Política de privacidad y Habeas Data
              </Link>

              <Link to="/terminos">
                Términos y condiciones
              </Link>

              <Link to="/envios-cambios">
                Política de envíos y cambios
              </Link>
            </nav>
          </div>

          <div className="footer-column footer-contact-column">
            <span className="footer-column-title">
              CONTACTO Y APOYO
            </span>

            <div className="footer-contact-list">
              <a
                href="tel:+573233529434"
                className="footer-contact-item"
              >
                <Phone size={17} />
                <span>+57 323 352 9434</span>
              </a>

              <a
                href="mailto:australcosmeticanatural@gmail.com"
                className="footer-contact-item"
              >
                <Mail size={17} />
                <span>
                  australcosmeticanatural@gmail.com
                </span>
              </a>

              <div className="footer-contact-item">
                <MapPin size={17} />
                <span>
                  El Peñol, Antioquia,
                  <br />
                  Colombia
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-support">
          <div className="footer-support-item">
            <span className="footer-support-label">
              MEDIOS DE PAGO
            </span>

            <div className="footer-payment-badge">
              Wompi
            </div>
          </div>

          <div className="footer-support-item">
            <span className="footer-support-label">
              NUESTRO COMPROMISO
            </span>

            <div className="footer-green-badge">
              Negocios Verdes
            </div>
          </div>

          <div className="footer-support-item">
            <span className="footer-support-label">
              ENCUÉNTRANOS
            </span>

            <span className="footer-location">
              El Peñol · Antioquia
            </span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {anioActual} Austral. Todos los derechos
            reservados.
          </span>

          <span>
            Hecho con cuidado en El Peñol, Antioquia.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;