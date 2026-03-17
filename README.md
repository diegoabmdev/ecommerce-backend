# Ecommerce Backend - NestJS 🚀

Backend robusto para una plataforma de E-commerce desarrollado con **NestJS**, enfocado en escalabilidad, buenas prácticas de desarrollo (**SOLID**, **Clean Code**) y una arquitectura profesional.

## 🛠️ Tecnologías Principales

- **Framework:** NestJS (Node.js)
- **Lenguaje:** TypeScript
- **Base de Datos:** PostgreSQL con TypeORM
- **Autenticación:** Passport.js & JWT
- **Pagos:** Mercado Pago SDK
- **Documentación:** Swagger & Scalar
- **Infraestructura:** Docker & Docker Compose

## ✨ Características

- 🔐 **Auth:** Flujo completo de autenticación y protección de rutas.
- 📦 **Productos:** Gestión de catálogo y stock.
- 🛒 **Órdenes:** Sistema de pedidos con integración de pasarela de pagos.
- 💳 **Pagos:** Webhook integrado para confirmación de pagos en tiempo real.
- 📧 **Notificaciones:** Envío de correos mediante Nodemailer.
- ☁️ **Media:** Gestión de imágenes con Cloudinary.

## 🚀 Instalación y Uso Local

### Requisitos previos

- Docker y Docker Compose instalados.

### 1. Clonar Repositorio

```bash
   git clone [https://github.com/tu-usuario/ecommerce-backend.git](https://github.com/tu-usuario/ecommerce-backend.git)
   cd ecommerce-backend
```

### 2. Instalación Rápida Docker
**Si tienes Docker, puedes levantar todo el entorno (DB + API) con un solo comando:**

```bash
    npm run docker:up
```

### 3. Testing
**El proyecto cuenta con una suite de pruebas unitarias:**

```bash
    npm run test
````

## 📖 Documentación de la API
Una vez ejecutándose, puedes acceder a la documentación interactiva en:

- **Swagger UI:** http://localhost:3000/api/v1/docs

- **Scalar (Minimalist):** http://localhost:3000/api/v1/reference

#### < Desarrollado por Diego Abanto Mendoza - Full-Stack Developer />
