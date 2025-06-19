// Cambia esto manualmente: 'nedb.js' o 'loki.js'
// import * as db from './nedb.js';
import * as db from './loki.js';

// const RUN_ONCE = true;          // true = solo una prueba
const RUN_ONCE = false;         // false = varias iteraciones para promedio
const ITERATIONS = 30;          // para promedio si RUN_ONCE = false
const TOTAL_LOGS = 35000;
const SEARCH_TERM = 'CRITICAL_FAIL_SIGNAL';

function generateLog(id) {
    const services = ['api-gateway', 'auth-service', 'db-service', 'payment'];
    const levels = ['info', 'debug', 'warn', 'error'];

    return {
        _id: `log${id}`,
        timestamp: Date.now(),
        message: (id === 123 || id === 6007)
            ? `🔥 ${SEARCH_TERM} on service XYZ [log ${id}]`
            : `Random log message ${Math.random().toString(36).substring(2)}`,
        labels: {
            service: services[Math.floor(Math.random() * services.length)],
            level: levels[Math.floor(Math.random() * levels.length)],
        },
    };
}

async function runSingleTest(verbose = false) {
    await db.reset();

    const logs = Array.from({ length: TOTAL_LOGS }, (_, i) => generateLog(i));

    const t0 = performance.now();
    for (const log of logs) {
        await db.insert(log);
    }
    const t1 = performance.now();

    const t2 = performance.now();
    const results = await db.find(SEARCH_TERM);
    const t3 = performance.now();

    const insertTime = t1 - t0;
    const searchTime = t3 - t2;

    if (verbose) {
        const all = await db.getAll();
        console.log('\n📥 2 primeros logs de la DB:');
        all.slice(0, 2).forEach(log => console.log(log));
        console.log('\n📥 2 últimos logs de la DB:');
        all.slice(-2).forEach(log => console.log(log));

        console.log(`\n🔎 Resultados encontrados: ${results.length}`);
        results.forEach(r => console.log(r));

        console.log(`\n⏱️ Tiempo de inserción: ${insertTime.toFixed(2)} ms`);
        console.log(`⏱️ Tiempo de búsqueda: ${searchTime.toFixed(2)} ms`);
    }

    return { insertTime, searchTime };
}

async function runBenchmark() {
    if (RUN_ONCE) {
        await runSingleTest(true);
        return;
    }

    const insertTimes = [];
    const searchTimes = [];

    for (let i = 0; i < ITERATIONS; i++) {
        console.log(`🔁 Iteración ${i + 1}/${ITERATIONS}`);
        const { insertTime, searchTime } = await runSingleTest(false);
        insertTimes.push(insertTime);
        searchTimes.push(searchTime);
    }

    const avgInsert = insertTimes.reduce((a, b) => a + b, 0) / ITERATIONS;
    const avgSearch = searchTimes.reduce((a, b) => a + b, 0) / ITERATIONS;

    console.log('\n📊 Resultados Finales');
    console.log(`Insert Times (ms): [${insertTimes.map(t => t.toFixed(2)).join(', ')}]`);
    console.log(`Search Times (ms): [${searchTimes.map(t => t.toFixed(2)).join(', ')}]`);
    console.log(`⏱️ Media Inserción: ${avgInsert.toFixed(2)} ms`);
    console.log(`⏱️ Media Búsqueda: ${avgSearch.toFixed(2)} ms`);
}

runBenchmark();
