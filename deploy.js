import ftp from "basic-ftp"
import path, { dirname } from "path"
import dotenv from "dotenv"
import { fileURLToPath } from "url";

dotenv.config() // Cargar variables de entorno

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function deploy() {
    const client = new ftp.Client()
    client.ftp.verbose = true

    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        })

        const localPath = path.join(__dirname, "dist") // o "dist"
        const remotePath = process.env.FTP_REMOTE_PATH || "/"

        await client.ensureDir(remotePath)
        await client.clearWorkingDir()
        await client.uploadFromDir(localPath)

        console.log("🚀 ¡Despliegue completado!")

    } catch (err) {
        console.error("❌ Error en el despliegue:", err)
    }

    client.close()
}

deploy()
