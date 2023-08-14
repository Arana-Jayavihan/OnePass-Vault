import express from "express"
import bodyParser from "body-parser"
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from "helmet"
import morgan from "morgan"
import { rateLimit } from "express-rate-limit"
import { middleware } from "sanitize"
import rfs from 'rotating-file-stream'
import path from 'path'
import { fileURLToPath } from "url"
import cookieParser from 'cookie-parser'

//Routes
import authRoutes from "./Routes/authRoutes.js"
import vaultRoutes from "./Routes/vaultRoutes.js"
import keyRoutes from "./Routes/keyRoutes.js"
import loginRoutes from "./Routes/loginRoutes.js"
import webSesionRoutes from "./Routes/webSessionRoutes.js"
import { checkRequest, decryptRequest } from "./middlware/index.js"

dotenv.config()
const app = express()
const filePath = fileURLToPath(import.meta.url);
const dirName = path.dirname(filePath);
const date = new Date()
const day = date.getDate()
const month = date.getMonth()
const year = date.getFullYear()
const fullDate = `${day}-${month}-${year}`
// LOGGER
if (process.env.ENV === "PROD"){
    const logStream = rfs.createStream(`traffic-${fullDate}.log`, {
        interval: '1d',
        path: path.join(dirName, "logs")
    })
    app.use(morgan("combined", { stream: logStream }))
}
app.use(morgan("common"))

//Blocked IP List 
let blockedIPs = []

// CORS

let corsOptions = {}
if (process.env.ENV === "PROD") {
    corsOptions = {
        origin: ["https://onepass-vault-v3.netlify.app"],
        credentials: true,
    }
}
else if (process.env.ENV === "DEV") {
    corsOptions = {
        origin: ["https://onepass-vault-v3.netlify.app", "https://localhost:3000"],
        credentials: true,
    }
}

app.use(cors(corsOptions))
app.use(cookieParser())

// EXPRESS
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.json({ limit: "5mb" }));

// HELMET
app.use(helmet())
app.use(helmet.hsts({ maxAge: 320000000, includeSubDomains: true, preload: true }))
app.use(helmet.contentSecurityPolicy({
    browserSniff: false,
    setAllHeaders: false,
    directives: {
        defaultSrc: ["'none'"],
        childSrc: ["'none'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'none'"],
        styleSrc: ["'none'"],
        imgSrc: ["'none'"],
        fontSrc: ["'none'"],
        connectSrc: ["'none'"],
    }
}));
app.use(helmet.hidePoweredBy())
app.use(helmet.xssFilter())
app.use(helmet.noSniff())
app.use(helmet.frameguard())
app.use(helmet.ieNoOpen())

// RATE LIMITER
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    handler: function (req, res) {
        blockedIPs.push(req.ip)
        console.log(blockedIPs, 'new blocked IP')
        res.status(429).json({
            message: "Too Many Requests"
        })
    },
    skip: function (req, res) {
        if (blockedIPs.includes(req.ip)) {
            return false
        }
        else {
            return true
        }
    }
})
app.use(limiter)

// HEADER INTERCEPTOR
app.use((req, res, next) => {
    // REMOVE
    res.removeHeader('Vary')
    res.removeHeader('X-DNS-Prefetch-Control')
    res.removeHeader('Origin-Agent-Cluster')
    res.removeHeader('Server')
    res.removeHeader('Date')

    // APPEND
    res.append('Access-Control-Allow-Methods', 'GET,POST');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    res.append('Permissions-Policy', 'geolocation=(self, microphone=()')
    res.append('Server', 'CLASSIFIED')
    next();
});

// SANITIZE REQUEST
app.use(middleware)
app.use(checkRequest)
app.use(decryptRequest)

// ROUTES
app.use("/api", authRoutes)
app.use("/api", vaultRoutes)
app.use("/api", keyRoutes)
app.use("/api", loginRoutes)
app.use("/api", webSesionRoutes)


// DEFAULT ROUTE
app.post('/', (req, res) => {
    res.send(
        `
        <html lang="en">
            <head>
                <title>OnePass Server</title>

                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#000000" />
                <link rel="stylesheet" href="/style.css" />
            </head>
            <body>
                <div>
                    <h1>OnePass Server SAYS HELLOOOO</h1>
                </div>
            </body>
        </html>
        `
    )
})

// LISTNER
const PORT = process.env.PORT || 9000

try {
    app.listen(PORT, () => {
        console.log("\n********************************************\n")
        console.log(`Server Running on port : ${PORT}`)
        console.log("\n********************************************\n")
    })
}
catch (error) {
    console.error(error)
}


