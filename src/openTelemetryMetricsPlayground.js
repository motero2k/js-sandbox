import express from 'express';
import { DiagConsoleLogger, DiagLogLevel, diag, metrics } from '@opentelemetry/api';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

// Optional: Set up logging for internal diagnostics (useful for debugging)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// Custom Console Metric Exporter to log metrics to the console
class ConsoleMetricExporter {
  export(metricsData, resultCallback) {
    try {
      console.log('Metrics exported:', JSON.stringify(metricsData, null, 2));
      resultCallback({ code: 0 }); // Ensure the resultCallback is called with a valid object
    } catch (error) {
      console.error('Error exporting metrics:', error);
      resultCallback({ code: 1 }); // Handle errors gracefully
    }
  }
}

// Declare global variables for interval, meter, and counters
let interval;
let meter;
let requestCounter; // Declare requestCounter globally
let upDownCounter; // Declare upDownCounter globally

// Function to stop metrics export
function stopMetrics() {
  console.log('STOPPING METRICS');
  clearInterval(interval);
  metrics.getMeterProvider().shutdown()
    .then(() => metrics.disable());
}

// Function to start metrics export
function startMetrics() {
  console.log('STARTING METRICS');

  // Create a MeterProvider with a custom exporter
  const meterProvider = new MeterProvider({
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new ConsoleMetricExporter(), // Use the custom console exporter
        exportIntervalMillis: 1000, // Export every second
      }),
    ],
  });

  // Set the global meter provider
  metrics.setGlobalMeterProvider(meterProvider);

  // Create a meter from the provider
  meter = meterProvider.getMeter('example-exporter-collector');

  // Initialize metrics instruments (e.g., counters)
  requestCounter = meter.createCounter('requests', {
    description: 'Counts the number of requests',
  });

  upDownCounter = meter.createUpDownCounter('test_up_down_counter', {
    description: 'Counts a value that can increase or decrease',
  });

  // Remove interval logic
}

// Initialize Express app
const app = express();
const PORT = 8080;

// Start metrics by default
startMetrics();

// Start and stop metrics on some events (you can call these functions based on your application logic)
app.get('/start-metrics', (req, res) => {
  startMetrics();
  res.send('Metrics collection started.');
});

app.get('/stop-metrics', (req, res) => {
  stopMetrics();
  res.send('Metrics collection stopped.');
});

// Define an endpoint to simulate API requests (this will trigger the requestCounter)
app.get('/rolldice', (req, res) => {
  const attributes = { endpoint: '/rolldice' };
  requestCounter.add(1, attributes); // Increment request counter for `/rolldice`
  res.send(Math.floor(Math.random() * 6) + 1); // Simulating a dice roll
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
