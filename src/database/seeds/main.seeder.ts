// src/database/seeds/main.seeder.ts
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { Category } from '../../modules/categories/entities/category.entity';
import { Product } from '../../modules/products/entities/product.entity';

export default class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const categoryRepo = dataSource.getRepository(Category);
    const userRepo = dataSource.getRepository(User);

    console.log('--- Iniciando Seeding de Categorías ---');

    const categoriesData = [
      {
        name: 'Smartphones',
        description: 'Últimos modelos de teléfonos inteligentes',
        slug: 'smartphones',
      },
      {
        name: 'Laptops',
        description: 'Computadoras portátiles para trabajo y gaming',
        slug: 'laptops',
      },
      {
        name: 'Fragrances',
        description: 'Perfumes y fragancias exclusivas',
        slug: 'fragrances',
      },
      {
        name: 'Skincare',
        description: 'Cuidado de la piel y belleza',
        slug: 'skincare',
      },

      {
        name: 'Home Decoration',
        description: 'Artículos para decorar tu hogar',
        slug: 'home-decoration',
      },
      {
        name: 'Furniture',
        description: 'Muebles de alta calidad',
        slug: 'furniture',
      },
      {
        name: 'Groceries',
        description: 'Productos de primera necesidad',
        slug: 'groceries',
      },
    ];

    const categories: Category[] = [];

    for (const cat of categoriesData) {
      let category = await categoryRepo.findOneBy({ name: cat.name });

      if (!category) {
        category = categoryRepo.create(cat);
        await categoryRepo.save(category);
        console.log(`✅ Categoría creada: ${cat.name}`);
      } else {
        console.log(`ℹ️ Categoría existente: ${cat.name}`);
      }
      categories.push(category);
    }

    const userFactory = factoryManager.get(User);
    const productFactory = factoryManager.get(Product);

    const currentUsers = await userRepo.count();
    if (currentUsers < 5) {
      console.log('--- Generando Usuarios ---');
      await userFactory.saveMany(10);
    }

    console.log('--- Generando Productos por Categoría ---');
    for (const category of categories) {
      const productCount = await dataSource.getRepository(Product).countBy({
        category: { id: category.id },
      });

      if (productCount < 5) {
        await productFactory.saveMany(8, { category });
        console.log(`📦 8 productos añadidos a: ${category.name}`);
      }
    }

    console.log('--- Seeding completado con éxito 🚀 ---');
  }
}
