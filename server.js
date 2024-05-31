// src/server.js
import app from './index.js';

// Definir un puerto y arrancar el proyecto
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`El servidor está funcionando en el puerto ${port}`);
});
