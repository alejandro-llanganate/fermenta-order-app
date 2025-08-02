# Mega Donut - Sistema de Gestión de pedidos

Un sistema moderno de Gestión de pedidos diseñado específicamente para **Mega Donut**, construido con Next.js y TypeScript.

## 🚀 Características

- **Interfaz en Español**: Completamente localizada para usuarios hispanohablantes
- **Diseño Responsivo**: Funciona perfectamente en dispositivos móviles y de escritorio
- **Autenticación Segura**: Sistema de login con validación de usuario y cédula
- **Logo Personalizado**: Diseño único para la marca Mega Donut
- **Imagen de Negocio**: Imagen de fondo relacionada con la producción
- **Modal de Contacto**: Sistema integrado para contactar al administrador

## 🛠️ Tecnologías Utilizadas

- **Next.js 14**: Framework de React con App Router
- **TypeScript**: Tipado estático para mayor seguridad
- **Tailwind CSS**: Framework de CSS utilitario
- **Lucide React**: Iconos modernos y ligeros
- **Headless UI**: Componentes de interfaz accesibles
- **Heroicons**: Iconos de alta calidad
- **ESLint**: Linting de código

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd fermenta-order-app
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🎨 Componentes

### Logo Component
El componente `Logo` es reutilizable y acepta diferentes tamaños:
- `sm`: Pequeño (32px)
- `md`: Mediano (48px) - por defecto
- `lg`: Grande (64px)

```tsx
import Logo from '@/components/Logo';

// Uso básico
<Logo />

// Con tamaño personalizado
<Logo size="lg" />

// Sin texto
<Logo showText={false} />
```

### ContactModal Component
Modal para mostrar información de contacto del administrador:

```tsx
import ContactModal from '@/components/ContactModal';

<ContactModal 
  isOpen={isModalOpen} 
  onClose={() => setIsModalOpen(false)} 
/>
```

## 📱 Página de Login

La página de login incluye:

- **Formulario de Autenticación**: Campos para nombre de usuario y número de cédula
- **Validación**: Campos requeridos con validación HTML5
- **Iconos**: Iconos descriptivos para cada campo
- **Toggle de Visibilidad**: Botón para mostrar/ocultar la cédula
- **Diseño Responsivo**: Se adapta a diferentes tamaños de pantalla
- **Modal de Contacto**: Información del administrador con enlaces directos

### Campos del Formulario

1. **Nombre de Usuario**: Campo de texto con icono de usuario
2. **Número de Cédula**: Campo de contraseña con icono de tarjeta de crédito
   - Incluye botón para mostrar/ocultar el contenido
   - Validación de campo requerido

### Información de Contacto

- **Email**: alejandro.llanganate@owasp.org
- **WhatsApp**: +593 98 335 2024

## 🎯 Funcionalidades Planificadas

- [ ] Dashboard principal
- [ ] Gestión de productos
- [ ] Sistema de pedidos
- [ ] Reportes y estadísticas
- [ ] Gestión de usuarios
- [ ] Integración con sistemas de pago

## 📄 Scripts Disponibles

- `npm run dev`: Ejecuta el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run start`: Ejecuta la aplicación en modo producción
- `npm run lint`: Ejecuta ESLint para verificar el código

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

**Mega Donut** - Sistema de Gestión para Mega Donut

- **Email**: alejandro.llanganate@owasp.org
- **WhatsApp**: +593 98 335 2024

Link del proyecto: [https://github.com/tu-usuario/fermenta-order-app](https://github.com/tu-usuario/fermenta-order-app)
