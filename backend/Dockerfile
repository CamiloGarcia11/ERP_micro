# ==========================================
# Microservicio Backend ERP - Multi-stage Build
# ==========================================

# Etapa 1: Compilación de TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci || npm install

# Copiar código fuente y configuración
COPY tsconfig.json ./
COPY src ./src

# Compilar TypeScript a JavaScript
RUN npm run build

# Etapa 2: Entorno de ejecución de producción
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Instalar únicamente dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copiar artefactos compilados desde el builder
COPY --from=builder /app/dist ./dist

# Usar usuario sin privilegios por seguridad
USER node

# Exponer puerto del microservicio
EXPOSE 4000

# Healthcheck interno del contenedor
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

# Comando de inicio
CMD ["node", "dist/index.js"]
