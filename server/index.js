import express from "express"
import bodyParser from "body-parser"
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from "helmet"
import morgan from "morgan"
import { fileURLToPath } from "url"
import path from "path"
import { rateLimit } from "express-rate-limit"
import { middleware } from "sanitize"
import vd from 'validator'
import methodOverride from 'method-override'

//Routes
import contractRoutes from "./Routes/contractRoutes.js"
import authRoutes from "./Routes/authRoutes.js"

const filePath = fileURLToPath(import.meta.url);
const dirName = path.dirname(filePath);

dotenv.config()
const app = express()

// CORS
const corsOptions = {
    origin: ["https://localhost:3000", "https://dapass-v1.netlify.app"]
}
app.use(cors(corsOptions))

// EXPRESS
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.json({ limit: "5mb" }));
app.use(express.static(path.join(dirName, "public")));

// HELMET
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }))
app.use(helmet.hsts({ maxAge: 320000000, includeSubDomains: true, preload: true }))
app.use(helmet.contentSecurityPolicy({
    browserSniff: false,
    setAllHeaders: false,
    directives: {
        defaultSrc: ["'self'"],
        childSrc: ["'none'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
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
    max: 100
})
app.use(limiter)

// LOGGER
app.use(morgan("common"))

// METHOD OVERRIDE
app.use(methodOverride('X-HTTP-Method-Override'))

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
    res.append('Access-Control-Allow-Credentials', 'true');
    res.append('Permissions-Policy', 'geolocation=(self, microphone=()')
    res.append('Server', 'CLASSIFIED')
    next();
});

// SANITIZE REQUEST
app.use(middleware)
app.use((req, res, next) => {
    try {
        const body = req.body
        const headers = req.headers
        const params = req.params
        const query = req.query

        if (Object.keys(body).length > 0 && body.constructor === Object) {
            let sanitizedBody = {}
            for (let key in body) {
                const value = vd.escape(req.bodyString(`${key}`))
                sanitizedBody[`${key}`] = value
            }
            sanitizedBody['sanitized'] = true
            req.body = sanitizedBody
        }
        if (Object.keys(headers).length > 0 && headers.constructor === Object) {
            let sanitizedHeaders = {}
            for (let key in headers) {
                const value = req.headerString(`${key}`)
                sanitizedHeaders[`${key}`] = value
            }
            req.headers = sanitizedHeaders
        }
        if (Object.keys(params).length > 0 && params.constructor === Object) {
            let sanitizedParams = {}
            for (let key in params) {
                const value = vd.escape(req.paramString(`${key}`))
                sanitizedParams[`${key}`] = value
            }
            req.params = sanitizedParams
        }
        if (Object.keys(query).length > 0 && query.constructor === Object) {
            let sanitizedQueries = {}
            for (let key in query) {
                const value = vd.escape(req.queryString(`${key}`))
                sanitizedQueries[`${key}`] = value
            }
            req.query = sanitizedQueries
        }
        next()
    }
    catch (error) {
        console.log(error)
    }
})

// ROUTES
app.use("/api", contractRoutes)
app.use("/api", authRoutes)

// DEFAULT ROUTE
app.get('/', (req, res) => {
    res.send(
        `
        <html lang="en">
            <head>
                <title>DAPass Server</title>

                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#000000" />
                <link rel="stylesheet" href="/style.css" />
            </head>
            <body>
                <div>
                    <h1>DAPass Server SAYS HELLOOOO</h1>
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


