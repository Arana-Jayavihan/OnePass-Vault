module.exports = {
    webpack: {
        headers: {
            'X-Frame-Options': 'Deny',
            'X-XSS-Protection': '0',
            'X-Content-Type-Options': 'nosniff',
            'Content-Security-Policy': "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'",
            'Referrer-Policy': 'no-referrer',
            'Feature-Policy': "geolocation 'none'; midi 'none'; sync-xhr 'none'; microphone 'none'; camera 'none'; magnetometer 'none'; gyroscope 'none'; speaker 'none'; fullscreen 'self'; payment 'none'",
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Access-Control-Allow-Methods': 'GET,POST',
            'Permissions-Policy': 'geolocation=(self, microphone=()',
            'Server': 'CLASSIFIED'
        }
    }
}