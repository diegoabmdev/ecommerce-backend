// src/database/run-seed.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { dataSourceOptions } from '../config/data-source';
import MainSeeder from './seeds/main.seeder';
import UserFactory from './factories/user.factory';
import ProductFactory from './factories/product.factory';

const options: DataSourceOptions & SeederOptions = {
  ...dataSourceOptions,
  factories: [UserFactory, ProductFactory],
  seeds: [MainSeeder],
};

const dataSource = new DataSource(options);

dataSource
  .initialize()
  .then(async () => {
    console.log('Iniciando Seeding... 🌱');
    await runSeeders(dataSource);
    console.log('Seeding completado con éxito 🚀');
    process.exit();
  })
  .catch((error) => {
    console.error('Error durante el Seeding:', error);
    process.exit(1);
  });
