// 1. Importamos las dependencias básicas de OpenTelemetry
import { trace, diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';

// 🔹 Configure OpenTelemetry diagnostics for better debugging
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// 🔹 Automatically instrument HTTP requests
registerInstrumentations({
  instrumentations: [new HttpInstrumentation()],
});

// 🔹 Configure and start the NodeSDK with ConsoleSpanExporter
const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(), // Export spans to the console
  spanProcessor: new SimpleSpanProcessor(new ConsoleSpanExporter()), // Optional: Add a processor for console export
});
sdk.start();

// 4. Obtenemos un Tracer (desde la API global, que usa el provider que registramos)
const tracer = trace.getTracer('http-server-example');

// 5. Creamos un servidor HTTP y usamos el Tracer para instrumentar las peticiones
import { createServer } from 'http';

const server = createServer((req, res) => {
  // 🔹 Creamos un Span para representar esta petición HTTP
  const span = tracer.startSpan(`HTTP ${req.method} ${req.url}`);

  // (Opcional) Añadimos atributos o eventos al Span
  span.setAttribute('http.method', req.method);
  span.setAttribute('http.url', req.url);

  // Add custom attributes
  span.setAttribute('custom.attribute', 'customValue');
  span.setAttribute('user.id', '12345');

  // Simulamos algo de lógica
  res.end('Hello from OpenTelemetry!');
  
  // 🔹 Cerramos el Span cuando terminamos
  span.end();
});
server.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
