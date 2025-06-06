
import { products } from '@/data/products';
import ProductCard from '@/components/products/ProductCard';
import CartSidebar from '@/components/cart/CartSidebar';

export default function HomePage() {
  const pizzaProducts = products.filter(p => p.category === 'Pizzas');
  const sideProducts = products.filter(p => p.category === 'Sides');
  const drinkProducts = products.filter(p => p.category === 'Drinks');
  const dessertProducts = products.filter(p => p.category === 'Desserts');

  const renderProductSection = (title: string, items: typeof products) => (
    items.length > 0 && (
      <section className="mb-12">
        <h2 className="text-4xl font-headline mb-8 text-center text-primary">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    )
  );

  return (
    <div className="relative">
      <div className="py-8">
        <h1 className="text-5xl font-headline mb-12 text-center text-primary drop-shadow-sm">
          Welcome to PizzaPlace!
        </h1>
        <p className="text-xl font-body text-center mb-12 text-foreground/80 max-w-2xl mx-auto">
          Indulge in our delicious, freshly made pizzas, savory sides, refreshing drinks, and delightful desserts. Order now for an unforgettable taste experience!
        </p>

        {renderProductSection("Our Famous Pizzas", pizzaProducts)}
        {renderProductSection("Scrumptious Sides", sideProducts)}
        {renderProductSection("Cool Drinks", drinkProducts)}
        {renderProductSection("Sweet Desserts", dessertProducts)}
      </div>
      <CartSidebar />
    </div>
  );
}
