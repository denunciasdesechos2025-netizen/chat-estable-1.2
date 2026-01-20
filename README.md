# Reporte Ciudadano - San Salvador Este

## Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/[TU_USUARIO]/[NOMBRE_REPOSITORIO].git

Este es un sistema de chat interactivo diseñado para facilitar el reporte de baches, recolección de desechos sólidos y otros problemas urbanos en el municipio de San Salvador Este. El sistema integra inteligencia artificial a través de **Venice AI** para asistir a los ciudadanos.

## Características

- **Interfaz de Chat Moderna**: Diseño limpio y profesional optimizado para la experiencia del usuario.
- **Asistente de IA (Venice AI)**: Un asistente inteligente que responde dudas y ayuda a categorizar reportes.
- **Geolocalización**: Posibilidad de compartir la ubicación exacta para reportes más precisos.
- **Categorización Directa**: Flujos rápidos para reportes comunes de recolección de basura y problemas urbanos.
- **Integración con WhatsApp**: Los reportes finalizados se envían directamente a las autoridades vía WhatsApp.

## Instalación y Configuración

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/[TU_USUARIO]/[NOMBRE_REPOSITORIO].git
    ```
2.  **Configurar Venice AI**:
    - Obtén tu clave de API en [Venice AI](https://venice.ai/).
    - Crea un archivo llamado `config.js` en la raíz del proyecto (o usa la plantilla generada).
    - Agrega tu clave de API al archivo:
    ```javascript
    const CONFIG = {
        VENICE_API_KEY: 'TU_API_KEY_AQUI',
        VENICE_API_URL: 'https://api.venice.ai/api/v1/chat/completions',
        AI_MODEL: 'gpt-4o'
    };
    ```
3.  **Ejecutar**:
    - Simplemente abre `index.html` en tu navegador preferido.

## Seguridad

El archivo `config.js` está incluido en el `.gitignore` para evitar que tu clave de API sea expuesta públicamente en GitHub. Asegúrate de nunca subir este archivo por error.

## Créditos

Desarrollado para la Alcaldía de San Salvador Este.
