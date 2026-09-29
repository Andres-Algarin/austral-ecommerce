import { useEffect, useRef, useState } from "react";
import "./HeroCarousel.css";

type HeroCarouselProps = {
  images: { src: string; alt: string }[];
  intervalMs?: number;
};

function HeroCarousel({ images, intervalMs = 4500 }: HeroCarouselProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused || images.length <= 1) {
      return;
    }

    timerRef.current = setInterval(() => {
      setActive((current) => (current + 1) % images.length);
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [paused, images.length, intervalMs]);

  const goTo = (index: number) => {
    setActive(index);
  };

  const goPrev = () => {
    setActive((current) => (current - 1 + images.length) % images.length);
  };

  const goNext = () => {
    setActive((current) => (current + 1) % images.length);
  };

  return (
    <div
      className="hero-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="hero-carousel-track">
        {images.map((image, index) => (
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            className={
              "hero-carousel-image" +
              (index === active ? " hero-carousel-image--active" : "")
            }
          />
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="hero-carousel-arrow hero-carousel-arrow--prev"
            onClick={goPrev}
            aria-label="Imagen anterior"
          >
            ‹
          </button>

          <button
            type="button"
            className="hero-carousel-arrow hero-carousel-arrow--next"
            onClick={goNext}
            aria-label="Siguiente imagen"
          >
            ›
          </button>

          <div className="hero-carousel-dots">
            {images.map((image, index) => (
              <button
                key={image.src}
                type="button"
                className={
                  "hero-carousel-dot" +
                  (index === active ? " hero-carousel-dot--active" : "")
                }
                onClick={() => goTo(index)}
                aria-label={`Ir a la imagen ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default HeroCarousel;
