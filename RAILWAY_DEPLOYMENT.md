# 🚂 Railway Deployment Guide

## 📋 Prerrequisitos

1. Tener una cuenta en [Railway](https://railway.app)
2. Tener el proyecto en GitHub
3. Tener Docker instalado (opcional, para testing local)

## 🚀 Pasos para desplegar en Railway

### 1. Conectar con GitHub
1. Ve a [Railway Dashboard](https://railway.app/dashboard)
2. Haz clic en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu cuenta de GitHub
5. Selecciona el repositorio `fermenta-order-app`

### 2. Configurar el proyecto
Railway detectará automáticamente el Dockerfile y configurará el deployment.

### 3. Variables de entorno (opcional)
Si necesitas variables de entorno, puedes agregarlas en:
- Railway Dashboard → Tu proyecto → Variables

### 4. Deploy
1. Railway automáticamente hará el build y deploy
2. El proceso tomará unos minutos
3. Una vez completado, Railway te dará una URL

## 🔧 Configuración del Dockerfile

El Dockerfile está optimizado para:
- ✅ Multi-stage build para reducir el tamaño de la imagen
- ✅ Security best practices (usuario no-root)
- ✅ Next.js standalone output
- ✅ Alpine Linux para menor tamaño

## 🧪 Testing local (opcional)

Para probar localmente antes de desplegar:

```bash
# Build de la imagen
docker build -t fermenta-order-app .

# Ejecutar el contenedor
docker run -p 3000:3000 fermenta-order-app
```

## 📊 Monitoreo

Una vez desplegado, puedes:
- Ver logs en tiempo real en Railway Dashboard
- Configurar alertas
- Monitorear el uso de recursos

## 🔗 URLs

- **Railway URL**: Se genera automáticamente (ej: `https://fermenta-order-app-production.up.railway.app`)
- **Custom Domain**: Puedes configurar un dominio personalizado en Railway Dashboard

## 🚨 Troubleshooting

### Problemas comunes:

1. **Build falla**: Verifica que todas las dependencias estén en `package.json`
2. **Puerto no disponible**: Railway maneja automáticamente el puerto
3. **Variables de entorno**: Asegúrate de configurarlas en Railway Dashboard

### Logs útiles:
```bash
# Ver logs en Railway Dashboard
# O usar Railway CLI
railway logs
``` 