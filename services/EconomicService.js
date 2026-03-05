// services/EconomicService.js
//
// IA gratuita con GROQ — sin tarjeta de crédito, 14,400 requests/día
//
// SETUP (solo 2 pasos):
//   1. Crear cuenta gratis en https://console.groq.com  (solo email, sin tarjeta)
//   2. Generar API Key en https://console.groq.com/keys
//   3. Poner en .env:  EXPO_PUBLIC_GROQ_API_KEY=gsk_xxxx
//
// APIs de datos reales utilizadas (todas gratuitas, sin key):
//   - Banco Mundial   → indicadores macro de México
//   - RestCountries   → datos de países para nearshoring
//   - exchangerate.host → tipo de cambio USD/MXN en tiempo real
//   - Open Meteo      → datos ambientales (emisiones CO₂ proxy)
//
// USO desde EconomiaScreen.js:
//   import EconomicService from '../services/EconomicService';
//
//   useEffect(function() {
//     EconomicService.loadAll().then(function(data) {
//       if (data.cities)    setCitiesData(data.cities);
//       if (data.circular)  setCircularData(data.circular);
//       if (data.nearshore) setNearshoringData(data.nearshore);
//       setLoading(false);
//     });
//   }, []);

import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Expo expone variables EXPO_PUBLIC_* al cliente automáticamente
var GROQ_API_KEY = "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";
var GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
var GROQ_MODEL = "llama-3.3-70b-versatile"; // Mejor modelo gratuito de Groq
var CACHE_TTL_MS = 1000 * 60 * 30; // Caché 30 min para no quemar requests

// ─── CACHE ────────────────────────────────────────────────────────────────────
async function cacheGet(key) {
  try {
    var raw = await AsyncStorage.getItem("econ_" + key);
    if (!raw) return null;
    var parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch (e) {
    return null;
  }
}

async function cacheSet(key, data) {
  try {
    await AsyncStorage.setItem(
      "econ_" + key,
      JSON.stringify({ ts: Date.now(), data: data }),
    );
  } catch (e) {}
}

// ─── GROQ helper ──────────────────────────────────────────────────────────────
async function askGroq(systemPrompt, userContent) {
  if (!GROQ_API_KEY) {
    throw new Error("Falta EXPO_PUBLIC_GROQ_API_KEY en tu .env");
  }

  var response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + GROQ_API_KEY,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.3, // Bajo para análisis concretos
      max_tokens: 2048,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!response.ok) {
    var err = await response.text();
    throw new Error("Groq API error " + response.status + ": " + err);
  }

  var json = await response.json();
  var text = json.choices[0].message.content;
  // Limpiar markdown fences si el modelo los incluyó
  text = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(text);
}

// ─── 1. BANCO MUNDIAL — indicadores macro México ──────────────────────────────
async function fetchWorldBankData() {
  var cached = await cacheGet("worldbank");
  if (cached) return cached;

  var indicators = [
    { id: "BX.KLT.DINV.WD.GD.ZS", label: "IED % PIB" },
    { id: "NY.GDP.MKTP.CD", label: "PIB USD" },
    { id: "FP.CPI.TOTL.ZG", label: "Inflación %" },
    { id: "SL.IND.EMPL.ZS", label: "Empleo Industrial %" },
    { id: "NV.MNF.TECH.ZS.UN", label: "Manufactura Alta Tech %" },
  ];

  var results = {};
  await Promise.all(
    indicators.map(async function (ind) {
      try {
        var res = await fetch(
          "https://api.worldbank.org/v2/country/MX/indicator/" +
            ind.id +
            "?format=json&mrv=3&per_page=3",
        );
        var json = await res.json();
        var latest = (json[1] || []).find(function (e) {
          return e.value !== null;
        });
        results[ind.id] = {
          label: ind.label,
          value: latest ? latest.value : null,
          year: latest ? latest.date : null,
        };
      } catch (e) {
        results[ind.id] = { label: ind.label, value: null, year: null };
      }
    }),
  );

  await cacheSet("worldbank", results);
  return results;
}

// ─── 2. TIPO DE CAMBIO — exchangerate.host (sin key) ─────────────────────────
async function fetchExchangeRate() {
  var cached = await cacheGet("fx");
  if (cached) return cached;

  try {
    var res = await fetch(
      "https://api.exchangerate.host/latest?base=USD&symbols=MXN,EUR,JPY,KRW,CAD",
    );
    var json = await res.json();
    var data = json.rates || {
      MXN: 17.5,
      EUR: 0.92,
      JPY: 149.5,
      KRW: 1320,
      CAD: 1.36,
    };
    await cacheSet("fx", data);
    return data;
  } catch (e) {
    return { MXN: 17.5, EUR: 0.92, JPY: 149.5, KRW: 1320, CAD: 1.36 };
  }
}

// ─── 3. PAÍSES — RestCountries (sin key) ─────────────────────────────────────
async function fetchCountriesData() {
  var cached = await cacheGet("countries");
  if (cached) return cached;

  try {
    var codes = ["USA", "DEU", "JPN", "KOR", "CAN", "GBR", "CHN", "FRA"];
    var res = await fetch(
      "https://restcountries.com/v3.1/alpha?codes=" +
        codes.join(",") +
        "&fields=name,region,subregion,population,cca3,currencies",
    );
    var json = await res.json();
    await cacheSet("countries", json);
    return json;
  } catch (e) {
    return [];
  }
}

// ─── 4. EMISIONES CO₂ — Our World in Data vía API pública ────────────────────
async function fetchEmissionsData() {
  var cached = await cacheGet("emissions");
  if (cached) return cached;

  try {
    // Banco Mundial: emisiones CO₂ México (tons per capita)
    var res = await fetch(
      "https://api.worldbank.org/v2/country/MX/indicator/EN.ATM.CO2E.PC" +
        "?format=json&mrv=5&per_page=5",
    );
    var json = await res.json();
    var data = (json[1] || []).filter(function (e) {
      return e.value !== null;
    });
    await cacheSet("emissions", data);
    return data;
  } catch (e) {
    return [];
  }
}

// ─── ANÁLISIS IA: CIUDADES / INVERSIONES ─────────────────────────────────────
async function getCitiesWithAI() {
  var cached = await cacheGet("ai_cities");
  if (cached) return cached;

  var results = await Promise.allSettled([
    fetchWorldBankData(),
    fetchExchangeRate(),
  ]);

  var wbData = results[0].status === "fulfilled" ? results[0].value : {};
  var fxData = results[1].status === "fulfilled" ? results[1].value : {};

  var context = JSON.stringify({
    indicadores_banco_mundial_mexico: wbData,
    tipo_cambio_actual: fxData,
    nota: "Datos reales del Banco Mundial. Analiza para ciudades mexicanas.",
  });

  var system = [
    "Eres un analista económico senior especializado en nearshoring e inversión extranjera en México.",
    "Recibirás datos reales del Banco Mundial. Úsalos para fundamentar tu análisis.",
    "Devuelve ÚNICAMENTE JSON válido, sin texto extra, sin markdown, sin explicaciones.",
    "Esquema requerido:",
    "{",
    '  "cities": [',
    "    {",
    '      "id": 1,',
    '      "city": "nombre",',
    '      "state": "siglas",',
    '      "sector": "Tech|Manufactura|Logística|Energía",',
    '      "score": 85,',
    '      "investment": "$X.XB",',
    '      "companies": ["Empresa1","Empresa2","Empresa3"],',
    '      "growth": "+XX%",',
    '      "type": "Nearshoring|Expansión",',
    '      "risk": "Bajo|Medio|Alto",',
    '      "desc": "descripción 1 oración basada en datos reales"',
    "    }",
    "  ],",
    '  "summary": "resumen ejecutivo 2 oraciones",',
    '  "data_source": "Banco Mundial",',
    '  "last_updated": "año del dato más reciente"',
    "}",
    "Incluye exactamente 8 ciudades mexicanas con mayor potencial de inversión.",
    "El score (0-100) debe reflejar los indicadores macro reales proporcionados.",
    "Ciudades sugeridas: Monterrey, Tijuana, Guadalajara, Saltillo, Cd Juárez, Querétaro, Mérida, Hermosillo.",
  ].join("\n");

  try {
    var aiResult = await askGroq(
      system,
      "Analiza y genera ranking:\n\n" + context,
    );
    await cacheSet("ai_cities", aiResult);
    return aiResult;
  } catch (e) {
    console.warn("Groq error en cities:", e.message);
    return null;
  }
}

// ─── ANÁLISIS IA: ECONOMÍA CIRCULAR ──────────────────────────────────────────
async function getCircularEconomyWithAI() {
  var cached = await cacheGet("ai_circular");
  if (cached) return cached;

  var results = await Promise.allSettled([
    fetchWorldBankData(),
    fetchEmissionsData(),
  ]);

  var wbData = results[0].status === "fulfilled" ? results[0].value : {};
  var co2Data = results[1].status === "fulfilled" ? results[1].value : [];

  var context = JSON.stringify({
    indicadores_macro_mexico: wbData,
    emisiones_co2_historico: co2Data,
    ciudad_objetivo: "Hermosillo, Sonora (~900,000 hab)",
    centro: "Centro de Economía Circular (CEC)",
  });

  var system = [
    "Eres un experto en economía circular y residuos sólidos urbanos en México.",
    "Usa los datos del Banco Mundial para fundamentar tus estimaciones.",
    "Devuelve ÚNICAMENTE JSON válido, sin texto extra, sin markdown.",
    "Esquema requerido:",
    "{",
    '  "kpis": {',
    '    "residuos_dia_tons": 1240,',
    '    "tasa_reciclaje_pct": 38.4,',
    '    "energia_mw": 3.8,',
    '    "co2_evitado_tons": 4200',
    "  },",
    '  "composicion": [',
    '    { "tipo": "Orgánicos",     "pct": 38, "tons_dia": 471 },',
    '    { "tipo": "Plásticos",     "pct": 22, "tons_dia": 273 },',
    '    { "tipo": "No reciclable", "pct": 18, "tons_dia": 223 },',
    '    { "tipo": "Industriales",  "pct": 14, "tons_dia": 174 },',
    '    { "tipo": "RAEE",          "pct": 5,  "tons_dia": 62  },',
    '    { "tipo": "Otros",         "pct": 3,  "tons_dia": 37  }',
    "  ],",
    '  "strategies": [',
    "    {",
    '      "id": 1,',
    '      "name": "nombre",',
    '      "category": "Orgánicos|Plásticos|No reciclable|Industriales|RAEE",',
    '      "icon": "leaf|refresh|flash|construct|hardware-chip|flame",',
    '      "color": "#hex",',
    '      "residuos": "XX%",',
    '      "beneficio": "texto cuantificado",',
    '      "estado": "Activo|Piloto|Expansión|Desarrollo",',
    '      "meta": "meta cuantificada",',
    '      "impact": "Alto|Medio|Bajo",',
    '      "desc": "descripción técnica 1 oración",',
    '      "pasos": ["paso1","paso2","paso3","paso4"]',
    "    }",
    "  ],",
    '  "indice_circularidad": 38.4,',
    '  "indice_breakdown": [',
    '    { "label": "Tasa reciclaje",   "value": 38, "color": "#2e7d32"  },',
    '    { "label": "Energía circular", "value": 22, "color": "#e65100"  },',
    '    { "label": "Simbiosis ind.",   "value": 58, "color": "#00838f"  },',
    '    { "label": "Reparación RAEE",  "value": 15, "color": "#6a1b9a"  }',
    "  ],",
    '  "trucks": [',
    '    { "id": "T001", "route": "Norte",  "weight": "2.3t", "time": "10:30", "efficiency": "98%", "status": "Completado" },',
    '    { "id": "T002", "route": "Sur",    "weight": "1.8t", "time": "11:15", "efficiency": "95%", "status": "En ruta"    },',
    '    { "id": "T003", "route": "Centro", "weight": "3.1t", "time": "12:00", "efficiency": "92%", "status": "En ruta"    }',
    "  ],",
    '  "data_source": "Banco Mundial + estimaciones CEC",',
    '  "last_updated": "2024"',
    "}",
    "Incluye exactamente 6 estrategias circulares.",
    "Ajusta los números a una ciudad de ~900,000 habitantes en clima árido (Hermosillo).",
  ].join("\n");

  try {
    var aiResult = await askGroq(
      system,
      "Genera módulo de economía circular:\n\n" + context,
    );
    await cacheSet("ai_circular", aiResult);
    return aiResult;
  } catch (e) {
    console.warn("Groq error en circular:", e.message);
    return null;
  }
}

// ─── ANÁLISIS IA: NEARSHORING ─────────────────────────────────────────────────
async function getNearshoringWithAI() {
  var cached = await cacheGet("ai_nearshoring");
  if (cached) return cached;

  var results = await Promise.allSettled([
    fetchCountriesData(),
    fetchExchangeRate(),
    fetchWorldBankData(),
  ]);

  var countriesData = results[0].status === "fulfilled" ? results[0].value : [];
  var fxData = results[1].status === "fulfilled" ? results[1].value : {};
  var wbData = results[2].status === "fulfilled" ? results[2].value : {};

  var context = JSON.stringify({
    paises_origen_inversion: countriesData.map(function (c) {
      return {
        name: c.name.common,
        region: c.region,
        population: c.population,
        cca3: c.cca3,
      };
    }),
    tipo_cambio_usd: fxData,
    macro_mexico: wbData,
  });

  var system = [
    "Eres un experto en nearshoring y relocalización industrial hacia México.",
    "Usa los datos reales de países y tipo de cambio para fundamentar el análisis.",
    "Devuelve ÚNICAMENTE JSON válido, sin texto extra, sin markdown.",
    "Esquema requerido:",
    "{",
    '  "regions": [',
    "    {",
    '      "region": "Norteamérica",',
    '      "companies": 45,',
    '      "potential": "Alto|Medio|Bajo",',
    '      "investment": "$XM",',
    '      "c": "#colorhex",',
    '      "main_sectors": ["Tech","Manufactura"],',
    '      "rationale": "razón 1 oración basada en datos reales"',
    "    }",
    "  ],",
    '  "total_investment": "$XB",',
    '  "fx_analysis": "impacto del tipo de cambio en 1 oración",',
    '  "data_source": "RestCountries + exchangerate.host",',
    '  "last_updated": "fecha actual"',
    "}",
    "Incluye exactamente 4 regiones: Norteamérica, Europa, Asia, Latam.",
    "Colores sugeridos: Norteamérica #2e7d32, Latam #1a237e, Europa #e65100, Asia #999999.",
    "Basa el potencial en datos reales de población, región y tipo de cambio.",
  ].join("\n");

  try {
    var aiResult = await askGroq(
      system,
      "Genera análisis de nearshoring:\n\n" + context,
    );
    await cacheSet("ai_nearshoring", aiResult);
    return aiResult;
  } catch (e) {
    console.warn("Groq error en nearshoring:", e.message);
    return null;
  }
}

// ─── LOAD ALL ─────────────────────────────────────────────────────────────────
async function loadAll() {
  var results = await Promise.allSettled([
    getCitiesWithAI(),
    getCircularEconomyWithAI(),
    getNearshoringWithAI(),
  ]);

  return {
    cities: results[0].status === "fulfilled" ? results[0].value : null,
    circular: results[1].status === "fulfilled" ? results[1].value : null,
    nearshore: results[2].status === "fulfilled" ? results[2].value : null,
    hasError: results.some(function (r) {
      return r.status === "rejected";
    }),
  };
}

// ─── CLEAR CACHE ──────────────────────────────────────────────────────────────
async function clearCache() {
  var keys = [
    "worldbank",
    "fx",
    "countries",
    "emissions",
    "ai_cities",
    "ai_circular",
    "ai_nearshoring",
  ];
  await Promise.all(
    keys.map(function (k) {
      return AsyncStorage.removeItem("econ_" + k);
    }),
  );
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────
var EconomicService = {
  loadAll: loadAll,
  getCitiesWithAI: getCitiesWithAI,
  getCircularEconomyWithAI: getCircularEconomyWithAI,
  getNearshoringWithAI: getNearshoringWithAI,
  clearCache: clearCache,
  askGroq: askGroq,
};

export default EconomicService;
