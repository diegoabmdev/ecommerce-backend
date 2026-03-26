import { setSeederFactory } from 'typeorm-extension';
import { Product } from '../../modules/products/entities/product.entity';

export default setSeederFactory(Product, (faker) => {
  const product = new Product();

  product.title = faker.commerce.productName();
  product.description = faker.commerce.productDescription();
  product.brand = faker.company.name();
  product.sku = faker.string.alphanumeric(8).toUpperCase();

  // Precios y Descuentos
  product.price = parseFloat(faker.commerce.price({ min: 10, max: 2000 }));
  product.discountPercentage = faker.number.float({
    min: 0,
    max: 25,
    fractionDigits: 2,
  });

  // Stock y Disponibilidad
  product.stock = faker.number.int({ min: 0, max: 100 });
  product.availabilityStatus = product.stock > 10 ? 'In Stock' : 'Low Stock';

  // Imágenes
  product.images = [
    faker.image.urlLoremFlickr({ category: 'products' }),
    faker.image.urlLoremFlickr({ category: 'technics' }),
    faker.image.urlLoremFlickr({ category: 'business' }),
  ];

  // Datos Físicos
  product.weight = faker.number.float({ min: 0.1, max: 10, fractionDigits: 2 });
  product.dimensions = {
    width: faker.number.float({ min: 1, max: 50, fractionDigits: 2 }),
    height: faker.number.float({ min: 1, max: 50, fractionDigits: 2 }),
    depth: faker.number.float({ min: 1, max: 50, fractionDigits: 2 }),
  };

  // Información Logística
  product.warrantyInformation = faker.helpers.arrayElement([
    '1 month warranty',
    '6 months warranty',
    '1 year warranty',
    '2 years warranty',
  ]);
  product.shippingInformation = faker.helpers.arrayElement([
    'Ships in 1-2 days',
    'Ships in 3-5 days',
    'Ships overnight',
  ]);
  product.returnPolicy = '30 days return policy';
  product.minimumOrderQuantity = faker.number.int({ min: 1, max: 5 });

  // Otros
  product.tags = [
    faker.commerce.productAdjective().toLowerCase(),
    faker.commerce.department().toLowerCase(),
  ];
  product.isActive = true;
  product.ratingAverage = faker.number.float({
    min: 1,
    max: 5,
    fractionDigits: 1,
  });
  product.reviewCount = faker.number.int({ min: 0, max: 200 });

  product.specifications = {
    material: faker.commerce.productMaterial(),
    color: faker.color.human(),
  };

  return product;
});
