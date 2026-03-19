// src/app.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getLandingPage(): string {
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diego Abanto | API Portfolio</title>
    <style>
        body {
            font-family: 'Inter', system-ui, sans-serif;
            background-color: #0d1117;
            color: #e6edf3;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .card {
            background-color: #161b22;
            padding: 2.5rem;
            border-radius: 16px;
            border: 1px solid #30363d;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
            max-width: 400px;
        }
        h1 { color: #58a6ff; font-size: 2rem; margin-bottom: 0.5rem; }
        p { color: #8b949e; margin-bottom: 2rem; line-height: 1.5; }
        .btn {
            background-color: #238636;
            color: #ffffff;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            display: inline-block;
            transition: transform 0.2s, background 0.2s;
        }
        .btn:hover {
            background-color: #2ea043;
            transform: translateY(-2px);
        }
        .status {
            margin-top: 2rem;
            font-size: 0.85rem;
            color: #7d8590;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .dot { height: 8px; width: 8px; background-color: #3fb950; border-radius: 50%; }
    </style>
</head>
<body>
    <div class="card">
        <h1>E-commerce API</h1>
        <p>Infraestructura Backend escalable desarrollada con NestJS y PostgreSQL.</p>
        <a href="/api/v1/docs" class="btn">Explorar Documentación</a>
        <div class="status">
            <span class="dot"></span> Sistema Operativo - Portafolio Diego Abanto
        </div>
    </div>
</body>
</html>`;
  }
}
