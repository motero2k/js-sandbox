// Status: WORKING
import express, { Router } from 'express';
import cookieParser from 'cookie-parser';

const telemetryRoutes = Router();
telemetryRoutes.get('/telemetry', (req, res) => {
    res.send('Telemetry data');
});

const authMiddleware = (req, res, next) => {
    console.log('Auth middleware checked');
    next();
};

const authRoutes = Router();
authRoutes.get('/login', (req, res) => {
    console.log('Login route called');
    res.send('Login page');
});

const app = express();

// Configuración
let authMiddlewareEnabled = false; // Cambiar este valor para activar/desactivar el middleware de autenticación

app.get('/toggle', (req, res) => {
    authMiddlewareEnabled = !authMiddlewareEnabled;
    res.send(`Auth middleware ${authMiddlewareEnabled ? 'enabled' : 'disabled'}`);
});
app.get('/status', (req, res) => {
    res.send(authMiddlewareEnabled);
});

// Routers y middlewares
const middlewares = [
    cookieParser(),
    authRoutes,
    authMiddleware, // Aquí activamos el middleware de autenticación
];

// let getAuthMiddleware = () => {
//     return authMiddlewareEnabled;
// }
app.use(conditionalMiddelwaresWrapper(()=> authMiddlewareEnabled, middlewares)); // Usamos el router condicional en la app
app.use(telemetryRoutes);
// Inicia el servidor
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

function conditionalMiddelwaresWrapper(conditionCallback, middlewares) {
    return middlewares.map(middleware => {
        return function (req, res, next) {
            if (conditionCallback()) {
                if (typeof middleware === 'function') {
                    // look for handle property, if it exists, it's a router. If not call middleware
                    if (middleware.handle) {
                        middleware.handle(req, res, next);
                    } else {
                        middleware(req, res, next);
                    }
                }
            } else {
                next();
            }
        };
    }
    );
}
