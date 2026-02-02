import sendMail from "../config/nodemailer.js"


const sendMailToRegister = (userMail, token) => {

    return sendMail(
        userMail,
        "Bienvenido a NUTRIAPP ",
        `
            <h1>Confirma tu cuenta</h1>
            <p>Hola, haz clic en el siguiente enlace para confirmar tu cuenta:</p>
            <a href="${process.env.URL_FRONTEND}/confirm/${token}">
            Confirmar cuenta
            </a>
            <hr>
            <footer>El equipo de NUTRIAPP te da la más cordial bienvenida.</footer>
        `
    )
}

const sendMailToRecoveryPassword = (userMail, token) => {

    return sendMail(
        userMail,
        "Recupera tu contraseña",
        `
            <h1>NUTRIAPP</h1>
            <p>Has solicitado restablecer tu contraseña.</p>
            <a href="${process.env.URL_FRONTEND}/recuperarpassword/${token}">
            Clic para restablecer tu contraseña
            </a>
            <hr>
            <footer>El equipo de NUTRIAPP te da la más cordial bienvenida.</footer>
        `
    )
}

const sendMailToNewAdmin = (userMail, password) => {
    return sendMail(
        userMail,
        "Bienvenido al equipo de Administración - NUTRIAPP",
        `
            <h1>Tus credenciales de acceso</h1>
            <p>Hola, has sido dado de alta como Administrador en el sistema.</p>
            <p>Tus credenciales de acceso son:</p>
            <ul>
                <li><strong>Correo:</strong> ${userMail}</li>
                <li><strong>Contraseña:</strong> ${password}</li>
            </ul>   
            <a href="${process.env.URL_FRONTEND}/login">Iniciar Sesión</a>
            <hr>
            <footer>El equipo de NUTRIAPP</footer>
        `
    )
}

export {
    sendMailToRegister,
    sendMailToRecoveryPassword,
    sendMailToNewAdmin
}