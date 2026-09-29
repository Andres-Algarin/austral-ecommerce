import PageHero from "../../components/PageHero/PageHero";
import ProductCatalog from "./ProductCatalog";

function Products() {
  return (
    <>
      <main>
        <PageHero
          compact
          eyebrow="TIENDA AUSTRAL"
          title={
            <>
              Nuestros <em>productos</em>
            </>
          }
          description="Shampoos en crema, oleatos, pomadas y jabones elaborados con extractos botánicos."
        />

        <ProductCatalog />
      </main>

    </>
  );
}

export default Products;
