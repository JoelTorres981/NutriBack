# Backend Nutri

Backend Node.js para la aplicación de Nutrición.

## Despliegue en Render

Este proyecto está configurado para desplegarse fácilmente en [Render](https://render.com).

### Pasos para desplegar:

1.  Crea una cuenta en Render.
2.  En el dashboard de Render, selecciona **"New +"** y luego **"Blueprint"**.
3.  Conecta tu repositorio de GitHub/GitLab.
4.  Render detectará automáticamente el archivo `render.yaml`.
5.  Haz clic en **"Apply"**.
6.  Render te pedirá que ingreses los valores para las variables de entorno (Environment Variables) que están marcadas como `sync: false` en el archivo `render.yaml`. Asegúrate de tener a mano tus credenciales de:
    *   MongoDB
    *   JWT Secret
    *   Cloudinary
    *   Email (Nodemailer)
    *   Stripe
    *   Gemini AI

### Variables de Entorno Requeridas

*   `PORT`: (Opcional, Render lo asigna automáticamente, por defecto usará 10000)
*   `MONGODB_URI`: Tu cadena de conexión a MongoDB Atlas.
*   `JWT_SECRET`: Clave secreta para firmar los tokens JWT.
*   `CLOUDINARY_CLOUD_NAME`: Nombre de tu cloud en Cloudinary.
*   `CLOUDINARY_API_KEY`: API Key de Cloudinary.
*   `CLOUDINARY_API_SECRET`: API Secret de Cloudinary.
*   `EMAIL_USER`: Correo para enviar notificaciones.
*   `EMAIL_PASS`: Contraseña o App Password del correo.
*   `STRIPE_SECRET_KEY`: Clave secreta de Stripe.
*   `GEMINI_API_KEY`: API Key para Google Gemini.

## Ejecución Local

1.  Instalar dependencias:
    ```bash
    npm install
    ```
2.  Crear un archivo `.env` basado en `.env.example` (si existe) o con las variables mencionadas arriba.
3.  Iniciar el servidor:
    ```bash
    npm run dev
    ```
