# 🤖 LLM Chat Pro

Aplicación de chat con inteligencia artificial usando Next.js 15, OpenAI y diseño dark profesional.

![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-API-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-cyan)

## ✨ Características

- 💬 Chat en tiempo real con streaming
- 🎨 Diseño dark profesional y moderno
- 🔒 Seguridad con rate limiting y validación de inputs
- 📱 Responsive y optimizado para todos los dispositivos
- ⚡ Construido con Next.js 15 y Turbopack
- 🎯 TypeScript para type safety

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/raul259/LLM-chat.git
cd LLM-chat
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
OPENAI_API_KEY=tu_clave_api_de_openai
```

**¿Cómo obtener tu API Key de OpenAI?**

1. Ve a [platform.openai.com](https://platform.openai.com/)
2. Crea una cuenta o inicia sesión
3. Ve a **API Keys** en el menú
4. Click en **Create new secret key**
5. Copia la clave (solo se muestra una vez)
6. Pégala en tu archivo `.env.local`

### 4. Ejecutar en modo desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📦 Despliegue en Vercel

### Opción 1: Desde la interfaz de Vercel (Recomendado)

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub
2. Click en **Add New Project**
3. Importa el repositorio `raul259/LLM-chat`
4. Configura las variables de entorno:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: Tu API key de OpenAI
   - **Environments**: Marca Production, Preview y Development
5. Click en **Deploy**

### Opción 2: Con Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Desplegar
vercel

# Agregar variable de entorno
vercel env add OPENAI_API_KEY

# Producción
vercel --prod
```

## 🔧 Configuración

### Modelos disponibles

Por defecto usa `gpt-4o-mini`. Puedes cambiarlo en `components/llmchat.tsx`:

```typescript
const [model] = React.useState("gpt-4o-mini");
// Otras opciones: "gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"
```

### Rate Limiting

Configurado en `app/api/llm/route.ts`:

```typescript
const MAX_MESSAGE_LENGTH = 2000; // Caracteres por mensaje
const MAX_MESSAGES = 20;         // Mensajes en conversación
// 10 requests por minuto por IP
```

### Personalizar el prompt del sistema

Edita en `components/llmchat.tsx`:

```typescript
const [messages, setMessages] = React.useState<UIMessage[]>([
  {
    id: uid(),
    role: "developer",
    content: "Eres un asistente útil. Responde claro y directo.",
  },
]);
```

## 🏗️ Estructura del proyecto

```
llm/
├── app/
│   ├── api/
│   │   └── llm/
│   │       └── route.ts       # API endpoint para OpenAI
│   ├── globals.css            # Estilos globales
│   ├── layout.tsx             # Layout principal
│   └── page.tsx               # Página principal
├── components/
│   ├── llmchat.tsx            # Componente principal del chat
│   └── ui/                    # Componentes UI (shadcn)
├── lib/
│   ├── openai.ts              # Cliente de OpenAI
│   └── utils.ts               # Utilidades
├── .env.local                 # Variables de entorno (NO COMMITEAR)
├── next.config.ts             # Configuración de Next.js
├── package.json               # Dependencias
└── tsconfig.json              # Configuración TypeScript
```

## 🛡️ Seguridad

### Protecciones implementadas

✅ **Rate Limiting**: 10 requests/minuto por IP  
✅ **Validación de inputs**: Límite de caracteres y mensajes  
✅ **Sanitización**: Renderizado como texto plano, sin HTML  
✅ **Variables de entorno**: API key nunca expuesta al cliente  
✅ **Error handling**: Manejo robusto de errores

### Recomendaciones adicionales para producción

- 🔐 Implementar autenticación (NextAuth, Clerk, Auth0)
- 📊 Monitorear uso y costos en OpenAI Dashboard
- 🚦 Usar Redis/Upstash para rate limiting profesional
- 🔍 Implementar OpenAI Moderation API
- 📝 Logging y analytics (Vercel Analytics, Posthog)

## 🐛 Solución de problemas

### Error: "Missing OPENAI_API_KEY"

**Causa**: La variable de entorno no está configurada.

**Solución**:
1. Verifica que `.env.local` existe y tiene la key
2. En Vercel: Settings → Environment Variables → Agregar `OPENAI_API_KEY`
3. Redeploy después de agregar la variable

### Error: "Failed to collect page data"

**Causa**: Build falla al intentar ejecutar código que requiere la API key.

**Solución**: Ya está solucionado en el código actual. La validación de API key solo ocurre en runtime.

### Error en Vercel: "EISDIR: illegal operation"

**Causa**: Problema con Windows y rutas con espacios.

**Solución**: El modo dev funciona perfectamente. Para build local, mueve el proyecto a una ruta sin espacios.

### Rate limit alcanzado

**Síntoma**: Error 429 "Too many requests"

**Solución**: Espera 1 minuto. El límite actual es 10 requests/minuto por IP.

## 📚 Stack tecnológico

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Componentes UI**: [shadcn/ui](https://ui.shadcn.com/)
- **IA**: [OpenAI API](https://platform.openai.com/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## 📝 Scripts disponibles

```bash
npm run dev      # Modo desarrollo con Turbopack
npm run build    # Build para producción
npm run start    # Iniciar servidor de producción
npm run lint     # Ejecutar ESLint
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

**raul259**  
GitHub: [@raul259](https://github.com/raul259)

## 🙏 Agradecimientos

- [OpenAI](https://openai.com/) por su increíble API
- [Vercel](https://vercel.com/) por el hosting gratuito
- [shadcn](https://ui.shadcn.com/) por los componentes UI

---

⭐ Si te gusta este proyecto, dale una estrella en GitHub!
