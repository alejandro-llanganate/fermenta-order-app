# 🚀 Render Deployment Guide

## 📋 Prerrequisitos

1. Tener una cuenta en [Render](https://render.com)
2. Tener el proyecto en GitHub
3. Tener una tarjeta de crédito (Render requiere verificación)

## 🚀 Pasos para desplegar en Render

### 1. Crear cuenta en Render
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Regístrate con tu cuenta de GitHub
3. Verifica tu cuenta con tarjeta de crédito

### 2. Conectar con GitHub
1. En Render Dashboard, haz clic en "New +"
2. Selecciona "Web Service"
3. Conecta tu cuenta de GitHub
4. Selecciona el repositorio `fermenta-order-app`

### 3. Configurar el servicio
- **Name**: `fermenta-order-app` (o el nombre que prefieras)
- **Environment**: `Node`
- **Region**: Elige la más cercana a tus usuarios
- **Branch**: `main`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 4. Variables de entorno (opcional)
Si necesitas variables de entorno:
- Ve a tu servicio en Render
- Environment → Environment Variables
- Agrega las variables que necesites

### 5. Deploy
1. Haz clic en "Create Web Service"
2. Render automáticamente hará el build y deploy
3. El proceso tomará 5-10 minutos
4. Una vez completado, Render te dará una URL

## 🔧 Configuración optimizada

### Dockerfile
- ✅ Simple y directo
- ✅ Optimizado para Node.js
- ✅ Incluye Tailwind CSS correctamente
- ✅ Build y start commands claros

### Next.js Config
- ✅ Sin modo standalone (que causaba problemas)
- ✅ Tailwind CSS funcionando correctamente
- ✅ Imágenes optimizadas

## 📊 Monitoreo y Logs

### Ver logs en tiempo real:
1. Ve a tu servicio en Render Dashboard
2. Pestaña "Logs"
3. Puedes ver logs en tiempo real

### Métricas:
- CPU y memoria usage
- Response times
- Error rates

## 🔗 URLs

- **Render URL**: `https://tu-app-name.onrender.com`
- **Custom Domain**: Puedes configurar un dominio personalizado

## 🚨 Troubleshooting

### Problemas comunes:

1. **Build falla**:
   - Verifica que todas las dependencias estén en `package.json`
   - Revisa los logs de build en Render

2. **Tailwind no funciona**:
   - ✅ Ya está solucionado con la nueva configuración
   - El CSS se compila correctamente

3. **Puerto no disponible**:
   - Render maneja automáticamente el puerto
   - No necesitas configurar nada

4. **Variables de entorno**:
   - Configúralas en Render Dashboard → Environment Variables

### Logs útiles:
```bash
# Ver logs en Render Dashboard
# O usar Render CLI
render logs
```

## 💰 Costos

- **Free Tier**: $0/mes (con limitaciones)
- **Paid Plans**: Desde $7/mes
- **Custom Domains**: Gratis

## 🎯 Ventajas de Render

- ✅ Deploy automático desde GitHub
- ✅ SSL automático
- ✅ Custom domains
- ✅ Logs en tiempo real
- ✅ Métricas detalladas
- ✅ Auto-scaling
- ✅ Muy fácil de usar 