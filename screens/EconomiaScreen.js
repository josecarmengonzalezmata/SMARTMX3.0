// screens/EconomiaScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EconomicService from "../services/EconomicService";

const { width, height } = Dimensions.get("window");

// ─── Paleta ───────────────────────────────────────────────────────────────────
const BLUE = "#1a237e";
const GREEN = "#2e7d32";
const ORANGE = "#e65100";
const WHITE = "#ffffff";
const BG = "#f5f5f5";

const SECTOR_CLR = {
  Tech: BLUE,
  Manufactura: ORANGE,
  Logística: "#7b1fa2",
  Energía: GREEN,
};
const RISK_CLR = { Bajo: GREEN, Medio: "#f57c00", Alto: "#c62828" };
const CAT_CLR = {
  Orgánicos: GREEN,
  Plásticos: BLUE,
  "No reciclable": ORANGE,
  Industriales: "#00838f",
  RAEE: "#6a1b9a",
};
const ESTADO_CLR = {
  Activo: GREEN,
  Piloto: "#f57c00",
  Expansión: BLUE,
  Desarrollo: "#6a1b9a",
};

// Camiones fallback (cuando la API no devuelve datos)
const TRUCKS_FALLBACK = [
  {
    id: "T001",
    route: "Norte",
    weight: "2.3t",
    time: "10:30",
    efficiency: "98%",
    status: "Completado",
  },
  {
    id: "T002",
    route: "Sur",
    weight: "1.8t",
    time: "11:15",
    efficiency: "95%",
    status: "En ruta",
  },
  {
    id: "T003",
    route: "Centro",
    weight: "3.1t",
    time: "12:00",
    efficiency: "92%",
    status: "En ruta",
  },
];

// Logs de trazabilidad (siempre estáticos, representan el flujo del sistema)
const TRACEABILITY_LOGS = [
  {
    event: "Lectura bascula capturada",
    payload: "T001 | 2.3t | error 0.2%",
    time: "10:30:14",
  },
  {
    event: "Ruta GPS validada",
    payload: "Corredor Norte / punto 14",
    time: "10:30:22",
  },
  {
    event: "Token de lote generado",
    payload: "HASH: CEC-T001-2026-03-05-1030",
    time: "10:30:23",
  },
  {
    event: "Registro enviado al panel municipal",
    payload: "Estado: sincronizado",
    time: "10:30:25",
  },
];

function scoreClr(s) {
  if (s >= 90) return ORANGE;
  if (s >= 80) return BLUE;
  return GREEN;
}

// ─── LOADER PERSONALIZADO ─────────────────────────────────────────────────────
function SmartLoader({ message }) {
  var bars = [
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
  ];
  var dotOpacity = useRef(new Animated.Value(0)).current;

  useEffect(function () {
    var delays = [0, 150, 300, 150, 0];
    bars.forEach(function (bar, i) {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delays[i]),
          Animated.timing(bar, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.delay(400),
        ]),
      ).start();
    });
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(dotOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  var barColors = [BLUE + "aa", BLUE + "cc", BLUE, BLUE + "cc", BLUE + "aa"];

  return (
    <View style={ld.container}>
      <View style={ld.bgTop} />
      <View style={ld.iconWrap}>
        <View style={ld.iconCircle}>
          <Ionicons name="trending-up" size={36} color={WHITE} />
        </View>
      </View>
      <View style={ld.barsRow}>
        {bars.map(function (bar, i) {
          var barHeight = 18 + i * 8;
          if (i > 2) barHeight = 18 + (4 - i) * 8;
          return (
            <Animated.View
              key={i}
              style={[
                ld.bar,
                {
                  height: barHeight,
                  backgroundColor: barColors[i],
                  opacity: bar,
                  transform: [{ scaleY: bar }],
                },
              ]}
            />
          );
        })}
      </View>
      <Text style={ld.title}>SMART MX</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
        <Text style={ld.subtitle}>{message || "Cargando datos reales"}</Text>
        <Animated.Text style={[ld.subtitle, { opacity: dotOpacity }]}>
          ...
        </Animated.Text>
      </View>
      <View style={ld.chipsRow}>
        {["Banco Mundial", "Groq IA", "Tiempo real"].map(function (chip) {
          return (
            <View key={chip} style={ld.chip}>
              <View style={ld.chipDot} />
              <Text style={ld.chipTx}>{chip}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

var ld = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  bgTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.45,
    backgroundColor: BLUE,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  iconWrap: { marginBottom: 28 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    marginBottom: 20,
    height: 50,
  },
  bar: { width: 10, borderRadius: 5 },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: WHITE,
    letterSpacing: 2,
    marginBottom: 6,
  },
  subtitle: { fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: "600" },
  chipsRow: { flexDirection: "row", gap: 8, marginTop: 32 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  chipDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#69f0ae" },
  chipTx: { fontSize: 10, color: WHITE, fontWeight: "600" },
});

// ─── ERROR SCREEN ─────────────────────────────────────────────────────────────
function ErrorScreen({ message, onRetry }) {
  return (
    <View style={er.container}>
      <View style={er.card}>
        <View style={er.iconWrap}>
          <Ionicons name="cloud-offline-outline" size={40} color={ORANGE} />
        </View>
        <Text style={er.title}>Sin conexión</Text>
        <Text style={er.msg}>
          {message ||
            "No se pudieron cargar los datos. Verifica tu conexión y la API key de Groq."}
        </Text>
        <TouchableOpacity style={er.btn} onPress={onRetry}>
          <Ionicons name="refresh" size={16} color={WHITE} />
          <Text style={er.btnTx}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

var er = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: ORANGE + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: "900", color: "#111", marginBottom: 8 },
  msg: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: ORANGE,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnTx: { fontSize: 13, fontWeight: "800", color: WHITE },
});

// ─── LiveDot — punto parpadeante autónomo, nunca se detiene ──────────────────
function LiveDot() {
  var anim = useRef(new Animated.Value(1)).current;
  var loop = useRef(null);
  useEffect(function () {
    loop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.15,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.current.start();
    return function () {
      if (loop.current) loop.current.stop();
    };
  }, []);
  return (
    <Animated.View
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#69f0ae",
        opacity: anim,
      }}
    />
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle, color }) {
  var clr = color || BLUE;
  return (
    <View style={[sh.wrap, { borderLeftColor: clr }]}>
      <View style={[sh.iconBox, { backgroundColor: clr + "20" }]}>
        <Ionicons name={icon} size={20} color={clr} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[sh.title, { color: clr }]}>{title}</Text>
        {subtitle ? <Text style={sh.sub}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

var sh = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    borderLeftWidth: 3,
    paddingLeft: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 15, fontWeight: "800", letterSpacing: 0.2 },
  sub: { fontSize: 10, color: "#888", marginTop: 1 },
});

// ─── CitySheet ────────────────────────────────────────────────────────────────
function CitySheet({ city, onClose }) {
  if (!city) return null;
  var col = scoreClr(city.score);
  var sc = SECTOR_CLR[city.sector] || BLUE;
  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={bss.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={bss.sheet}>
          <View style={bss.handle} />
          <View style={bss.head}>
            <View style={{ flex: 1 }}>
              <Text style={bss.sheetTitle}>{city.city}</Text>
              <Text style={bss.stateSub}>
                {city.state} · {city.type}
              </Text>
              <View
                style={[
                  bss.pill,
                  { backgroundColor: sc + "20", borderColor: sc + "60" },
                ]}
              >
                <Text style={[bss.pillTx, { color: sc }]}>{city.sector}</Text>
              </View>
            </View>
            <View style={[bss.scoreBig, { backgroundColor: col }]}>
              <Text style={bss.scoreTx}>{city.score}</Text>
              <Text style={bss.scoreLabel}>SCORE IA</Text>
            </View>
          </View>
          <Text style={bss.desc}>{city.desc}</Text>
          <View style={bss.statsRow}>
            <View style={bss.stat}>
              <Text style={bss.statL}>Inversión</Text>
              <Text style={[bss.statV, { color: BLUE }]}>
                {city.investment}
              </Text>
            </View>
            <View style={bss.stat}>
              <Text style={bss.statL}>Crecimiento</Text>
              <Text style={[bss.statV, { color: GREEN }]}>{city.growth}</Text>
            </View>
            <View style={bss.stat}>
              <Text style={bss.statL}>Riesgo</Text>
              <Text
                style={[bss.statV, { color: RISK_CLR[city.risk] || "#888" }]}
              >
                {city.risk}
              </Text>
            </View>
          </View>
          <Text style={bss.secTitle}>EMPRESAS EN EXPANSIÓN</Text>
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            {(city.companies || []).map(function (co) {
              return (
                <View key={co} style={bss.tag}>
                  <Text style={bss.tagTx}>{co}</Text>
                </View>
              );
            })}
          </View>
          <Text style={bss.secTitle}>ANÁLISIS IA</Text>
          {[
            "Alta probabilidad de expansión en los próximos 18 meses",
            (city.growth || "") +
              " crecimiento en flujo de inversión vs año anterior",
            "Calificada para programas federales de Nearshoring",
          ].map(function (t, i) {
            return (
              <View key={i} style={bss.insightRow}>
                <View style={[bss.dot, { backgroundColor: BLUE }]} />
                <Text style={bss.insightTx}>{t}</Text>
              </View>
            );
          })}
          <TouchableOpacity
            style={[bss.cta, { backgroundColor: BLUE }]}
            onPress={onClose}
          >
            <Text style={bss.ctaTx}>Ver reporte completo</Text>
            <Ionicons name="arrow-forward" size={16} color={WHITE} />
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── StrategySheet ────────────────────────────────────────────────────────────
function StrategySheet({ strategy, onClose }) {
  if (!strategy) return null;
  var col = strategy.color || GREEN;
  var estadoColor = ESTADO_CLR[strategy.estado] || GREEN;
  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={bss.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={bss.sheet}>
          <View style={bss.handle} />
          <View style={bss.head}>
            <View style={[bss.stratIconBox, { backgroundColor: col + "20" }]}>
              <Ionicons name={strategy.icon || "leaf"} size={28} color={col} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={bss.sheetTitle}>{strategy.name}</Text>
              <View
                style={[
                  bss.pill,
                  {
                    backgroundColor: estadoColor + "20",
                    borderColor: estadoColor + "60",
                  },
                ]}
              >
                <View
                  style={[
                    bss.dot,
                    { backgroundColor: estadoColor, marginTop: 0 },
                  ]}
                />
                <Text style={[bss.pillTx, { color: estadoColor }]}>
                  {strategy.estado}
                </Text>
              </View>
            </View>
          </View>
          <Text style={bss.desc}>{strategy.desc}</Text>
          <View style={bss.statsRow}>
            <View style={bss.stat}>
              <Text style={bss.statL}>Residuos</Text>
              <Text style={[bss.statV, { color: col }]}>
                {strategy.residuos}
              </Text>
            </View>
            <View style={bss.stat}>
              <Text style={bss.statL}>Beneficio</Text>
              <Text style={[bss.statV, { color: GREEN }]}>
                {strategy.beneficio}
              </Text>
            </View>
            <View style={bss.stat}>
              <Text style={bss.statL}>Meta</Text>
              <Text style={[bss.statV, { color: BLUE }]}>{strategy.meta}</Text>
            </View>
          </View>
          <View
            style={[
              bss.impactRow,
              { borderColor: col + "50", backgroundColor: col + "12" },
            ]}
          >
            <Ionicons name="flash" size={16} color={col} />
            <Text style={[bss.impactTx, { color: col }]}>
              Impacto:{" "}
              <Text style={{ fontWeight: "900" }}>{strategy.impact}</Text>
            </Text>
          </View>
          <Text style={[bss.secTitle, { marginTop: 14 }]}>
            PASOS DE IMPLEMENTACIÓN
          </Text>
          {(strategy.pasos || []).map(function (p, i) {
            return (
              <View key={i} style={bss.stepRow}>
                <View style={[bss.stepNum, { backgroundColor: col }]}>
                  <Text style={bss.stepNumTx}>{i + 1}</Text>
                </View>
                <Text style={bss.insightTx}>{p}</Text>
              </View>
            );
          })}
          <TouchableOpacity
            style={[bss.cta, { backgroundColor: col }]}
            onPress={onClose}
          >
            <Text style={bss.ctaTx}>Ver plan de implementación</Text>
            <Ionicons name="arrow-forward" size={16} color={WHITE} />
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

var bss = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    maxHeight: "88%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginBottom: 16,
  },
  head: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111",
    lineHeight: 24,
  },
  stateSub: { fontSize: 10, color: "#888", marginTop: 3, fontWeight: "600" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    marginTop: 7,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 16,
    borderWidth: 1,
  },
  pillTx: { fontSize: 10, fontWeight: "700" },
  scoreBig: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreTx: { fontSize: 22, fontWeight: "900", color: WHITE },
  scoreLabel: {
    fontSize: 7,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "700",
    letterSpacing: 1,
  },
  desc: { fontSize: 12, color: "#555", lineHeight: 19, marginBottom: 14 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  stat: {
    flex: 1,
    backgroundColor: BG,
    borderRadius: 12,
    padding: 11,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  statL: {
    fontSize: 8,
    color: "#999",
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  statV: { fontSize: 13, fontWeight: "900" },
  secTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: "#aaa",
    letterSpacing: 2,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: "#e8f5e9",
    borderWidth: 1,
    borderColor: "#a5d6a7",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 16,
  },
  tagTx: { fontSize: 10, fontWeight: "700", color: GREEN },
  insightRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 9,
    padding: 9,
  },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 4, flexShrink: 0 },
  insightTx: { flex: 1, fontSize: 11, color: "#333", lineHeight: 17 },
  cta: {
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  ctaTx: { fontSize: 13, fontWeight: "800", color: WHITE },
  stratIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  impactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  impactTx: { fontSize: 12 },
  stepRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 9,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNumTx: { fontSize: 11, fontWeight: "900", color: WHITE },
});

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function EconomiaScreen() {
  var activeTabState = useState("inv");
  var activeTab = activeTabState[0];
  var setActiveTab = activeTabState[1];

  var invFilterState = useState("Todos");
  var invFilter = invFilterState[0];
  var setInvFilter = invFilterState[1];

  var ecFilterState = useState("Todas");
  var ecFilter = ecFilterState[0];
  var setEcFilter = ecFilterState[1];

  var selCityState = useState(null);
  var selCity = selCityState[0];
  var setSelCity = selCityState[1];

  var selStratState = useState(null);
  var selStrategy = selStratState[0];
  var setSelStrategy = selStratState[1];

  var citiesState = useState(null);
  var cities = citiesState[0];
  var setCities = citiesState[1];

  var circularState = useState(null);
  var circular = circularState[0];
  var setCircular = circularState[1];

  var nearshoreState = useState(null);
  var nearshore = nearshoreState[0];
  var setNearshore = nearshoreState[1];

  var summaryState = useState(null);
  var summary = summaryState[0];
  var setSummary = summaryState[1];

  var loadingState = useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  var loadMsgState = useState("Conectando con APIs");
  var loadMsg = loadMsgState[0];
  var setLoadMsg = loadMsgState[1];

  var errorState = useState(null);
  var error = errorState[0];
  var setError = errorState[1];

  // ── Carga de datos
  function loadData() {
    setLoading(true);
    setError(null);

    var msgs = [
      "Conectando con APIs",
      "Descargando datos del Banco Mundial",
      "Analizando con Groq IA",
      "Generando análisis...",
    ];
    var idx = 0;
    var interval = setInterval(function () {
      idx = idx + 1;
      if (idx < msgs.length) setLoadMsg(msgs[idx]);
    }, 1800);

    EconomicService.loadAll()
      .then(function (data) {
        clearInterval(interval);
        if (data.cities && data.cities.cities) setCities(data.cities.cities);
        else if (data.cities) setCities(data.cities);
        if (data.circular) setCircular(data.circular);
        if (data.nearshore && data.nearshore.regions)
          setNearshore(data.nearshore.regions);
        else if (data.nearshore) setNearshore(data.nearshore);
        if (data.cities && data.cities.summary) setSummary(data.cities.summary);
        if (!data.cities && !data.circular) {
          setError(
            "No se pudieron obtener datos. Verifica tu API key de Groq en el archivo .env",
          );
        }
        setLoading(false);
      })
      .catch(function (err) {
        clearInterval(interval);
        setError(err.message || "Error de conexión");
        setLoading(false);
      });
  }

  useEffect(function () {
    loadData();
  }, []);

  // ── Derivados
  var sectoresInv = ["Todos"];
  if (cities) {
    cities.forEach(function (c) {
      if (c.sector && sectoresInv.indexOf(c.sector) === -1)
        sectoresInv.push(c.sector);
    });
  }

  var catsEc = ["Todas"];
  if (circular && circular.strategies) {
    circular.strategies.forEach(function (s) {
      if (s.category && catsEc.indexOf(s.category) === -1)
        catsEc.push(s.category);
    });
  }

  var filteredCities = !cities
    ? []
    : invFilter === "Todos"
      ? cities
      : cities.filter(function (c) {
          return c.sector === invFilter;
        });

  var filteredStrats =
    !circular || !circular.strategies
      ? []
      : ecFilter === "Todas"
        ? circular.strategies
        : circular.strategies.filter(function (s) {
            return s.category === ecFilter;
          });

  var kpis =
    circular && circular.kpis
      ? [
          {
            icon: "trash",
            v: String(circular.kpis.residuos_dia_tons),
            u: "ton/día",
            l: "Residuos generados",
            c: ORANGE,
          },
          {
            icon: "refresh",
            v: String(circular.kpis.tasa_reciclaje_pct),
            u: "%",
            l: "Tasa de reciclaje",
            c: GREEN,
          },
          {
            icon: "flash",
            v: String(circular.kpis.energia_mw),
            u: "MW",
            l: "Energía circular",
            c: BLUE,
          },
          {
            icon: "leaf",
            v: String(circular.kpis.co2_evitado_tons),
            u: "ton CO₂",
            l: "Emisiones evitadas",
            c: "#00838f",
          },
        ]
      : [];

  // Usar camiones de la API o fallback estático
  var trucks =
    circular && circular.trucks && circular.trucks.length > 0
      ? circular.trucks
      : TRUCKS_FALLBACK;

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* ── LOADER ── */}
      {loading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
        >
          <SmartLoader message={loadMsg} />
        </View>
      )}

      {/* ── ERROR ── */}
      {!loading && error && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
        >
          <ErrorScreen message={error} onRetry={loadData} />
        </View>
      )}

      {/* ── HEADER ── */}
      <View style={s.header}>
        <Ionicons name="trending-up" size={40} color={WHITE} />
        <Text style={s.headerTitle}>Inversiones y Nearshoring</Text>
        <Text style={s.headerSubtitle}>IA + Economía Circular</Text>
      </View>

      {/* ── TABS ── */}
      <View style={s.tabRow}>
        <TouchableOpacity
          style={[s.tab, activeTab === "inv" && { borderBottomColor: BLUE }]}
          onPress={function () {
            setActiveTab("inv");
          }}
        >
          <Ionicons
            name="globe"
            size={15}
            color={activeTab === "inv" ? BLUE : "#999"}
          />
          <Text
            style={[
              s.tabTx,
              activeTab === "inv" && { color: BLUE, fontWeight: "800" },
            ]}
          >
            Inversiones y Nearshoring
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, activeTab === "eco" && { borderBottomColor: GREEN }]}
          onPress={function () {
            setActiveTab("eco");
          }}
        >
          <Ionicons
            name="leaf"
            size={15}
            color={activeTab === "eco" ? GREEN : "#999"}
          />
          <Text
            style={[
              s.tabTx,
              activeTab === "eco" && { color: GREEN, fontWeight: "800" },
            ]}
          >
            Economía Circular
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── CONTENT ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      >
        {/* ══ TAB 1: INVERSIONES ══ */}
        {activeTab === "inv" && (
          <View>
            {/* Pregunta 6 */}
            <View style={s.questionTagRow}>
              <View
                style={[
                  s.questionTag,
                  { backgroundColor: BLUE + "20", borderColor: BLUE + "50" },
                ]}
              >
                <Text style={[s.questionTagText, { color: BLUE }]}>
                  Pregunta 6
                </Text>
              </View>
            </View>

            <View style={[s.descBanner, { borderLeftColor: BLUE }]}>
              <Ionicons name="globe-outline" size={22} color={BLUE} />
              <View style={{ flex: 1 }}>
                <Text style={[s.descTitle, { color: BLUE }]}>
                  Inversiones y Nearshoring
                </Text>
                <Text style={s.descTx}>
                  Módulo de inteligencia artificial que analiza flujos de
                  inversión global, detecta empresas en expansión y predice
                  oportunidades de Nearshoring en ciudades mexicanas con datos
                  reales del Banco Mundial.
                </Text>
              </View>
            </View>

            <View style={s.aiCard}>
              <View style={s.aiHeader}>
                <Ionicons name="hardware-chip" size={16} color={WHITE} />
                <Text style={s.aiTitle}>Análisis Predictivo IA · Groq</Text>
                <View style={s.aiLive}>
                  <LiveDot />
                  <Text style={s.aiLiveTx}>EN VIVO</Text>
                </View>
              </View>
              <View style={s.aiStats}>
                {[
                  { v: "Llama 3.3", l: "Modelo IA" },
                  { v: "14.4K", l: "Req/día gratis" },
                  { v: "BM+INEGI", l: "Fuentes datos" },
                ].map(function (a) {
                  return (
                    <View key={a.l} style={s.aiStat}>
                      <Text style={s.aiStatV}>{a.v}</Text>
                      <Text style={s.aiStatL}>{a.l}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, marginBottom: 14 }}
            >
              {sectoresInv.map(function (f) {
                var active = invFilter === f;
                var col = SECTOR_CLR[f] || BLUE;
                return (
                  <TouchableOpacity
                    key={f}
                    onPress={function () {
                      setInvFilter(f);
                    }}
                    style={[
                      s.chip,
                      active && { backgroundColor: col, borderColor: col },
                    ]}
                  >
                    {f !== "Todos" && (
                      <View
                        style={[
                          s.chipDot,
                          { backgroundColor: active ? WHITE : col },
                        ]}
                      />
                    )}
                    <Text style={[s.chipTx, active && { color: WHITE }]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <SectionHeader
              icon="location"
              title="Ciudades con Mayor Potencial"
              subtitle="Datos reales · Toca para ver análisis completo"
              color={BLUE}
            />

            {filteredCities.map(function (c) {
              var col = scoreClr(c.score);
              var sc = SECTOR_CLR[c.sector] || BLUE;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={function () {
                    setSelCity(c);
                  }}
                  style={s.cityCard}
                  activeOpacity={0.75}
                >
                  <View style={{ flex: 1 }}>
                    <View style={s.cityHead}>
                      <Text style={s.cityName}>{c.city}</Text>
                      <Text style={s.cityState}>{c.state}</Text>
                    </View>
                    <View style={s.cityMid}>
                      <View style={[s.sectorDot, { backgroundColor: sc }]} />
                      <Text style={s.citySector}>{c.sector}</Text>
                      <View
                        style={[
                          s.riskBadge,
                          {
                            backgroundColor:
                              (RISK_CLR[c.risk] || "#888") + "25",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            s.riskTx,
                            { color: RISK_CLR[c.risk] || "#888" },
                          ]}
                        >
                          {c.risk}
                        </Text>
                      </View>
                    </View>
                    <View style={s.cityFoot}>
                      <Text style={[s.cityInv, { color: BLUE }]}>
                        {c.investment}
                      </Text>
                      <Text style={[s.cityGrowth, { color: GREEN }]}>
                        {c.growth}
                      </Text>
                      <Text style={s.cityType}>{c.type}</Text>
                    </View>
                  </View>
                  <View style={[s.scoreBadge, { backgroundColor: col }]}>
                    <Text style={s.scoreTx}>{c.score}</Text>
                    <Text style={s.scoreLabel}>IA</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <SectionHeader
              icon="globe"
              title="Oportunidades de Nearshoring"
              subtitle="Regiones con mayor potencial · datos reales"
              color={ORANGE}
            />
            <View style={s.gridRow}>
              {(nearshore || []).map(function (n, i) {
                var nc = n.c || [GREEN, BLUE, ORANGE, "#999"][i] || "#888";
                return (
                  <View key={i} style={s.nearCard}>
                    <View style={[s.nearBadge, { backgroundColor: nc }]}>
                      <Text style={s.nearPotential}>{n.potential}</Text>
                    </View>
                    <Text style={s.nearRegion}>{n.region}</Text>
                    <Text style={s.nearCompanies}>{n.companies} empresas</Text>
                    <Text style={[s.nearInv, { color: nc }]}>
                      {n.investment}
                    </Text>
                    {n.rationale ? (
                      <Text style={s.nearRationale}>{n.rationale}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ══ TAB 2: ECONOMÍA CIRCULAR ══ */}
        {activeTab === "eco" && (
          <View>
            {/* Pregunta 7 y 8 */}
            <View style={s.questionTagRow}>
              <View
                style={[
                  s.questionTag,
                  { backgroundColor: GREEN + "20", borderColor: GREEN + "50" },
                ]}
              >
                <Text style={[s.questionTagText, { color: GREEN }]}>
                  Pregunta 7
                </Text>
              </View>
              <View
                style={[
                  s.questionTag,
                  {
                    backgroundColor: ORANGE + "20",
                    borderColor: ORANGE + "50",
                  },
                ]}
              >
                <Text style={[s.questionTagText, { color: ORANGE }]}>
                  Pregunta 8
                </Text>
              </View>
            </View>

            <View style={[s.descBanner, { borderLeftColor: GREEN }]}>
              <Ionicons name="leaf-outline" size={22} color={GREEN} />
              <View style={{ flex: 1 }}>
                <Text style={[s.descTitle, { color: GREEN }]}>
                  Economía Circular
                </Text>
                <Text style={s.descTx}>
                  Módulo de gestión integral de residuos sólidos urbanos del
                  Centro de Economía Circular (CEC) de Hermosillo. Monitorea
                  composición y trazabilidad con datos reales del Banco Mundial
                  analizados por IA.
                </Text>
              </View>
            </View>

            {/* KPIs */}
            {kpis.length > 0 && (
              <View style={s.kpiGrid}>
                {kpis.map(function (k) {
                  return (
                    <View key={k.l} style={s.kpiCard}>
                      <Ionicons name={k.icon} size={20} color={k.c} />
                      <Text style={[s.kpiCardVal, { color: k.c }]}>
                        {k.v}
                        <Text style={s.kpiCardUnit}> {k.u}</Text>
                      </Text>
                      <Text style={s.kpiCardLabel}>{k.l}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Composición */}
            {circular && circular.composicion && (
              <>
                <SectionHeader
                  icon="pie-chart"
                  title="Composición de Residuos"
                  subtitle="Distribución por tipo · CEC Hermosillo"
                  color={GREEN}
                />
                <View style={s.mixCard}>
                  {circular.composicion.map(function (d) {
                    var dc = CAT_CLR[d.tipo] || "#aaa";
                    return (
                      <View key={d.tipo} style={s.mixRow}>
                        <View style={[s.mixDot, { backgroundColor: dc }]} />
                        <Text style={s.mixLabel}>{d.tipo}</Text>
                        <View style={s.mixBarBg}>
                          <View
                            style={[
                              s.mixBarFill,
                              { width: d.pct + "%", backgroundColor: dc },
                            ]}
                          />
                        </View>
                        <Text style={[s.mixPct, { color: dc }]}>{d.pct}%</Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}

            {/* Estrategias */}
            {filteredStrats.length > 0 && (
              <>
                <SectionHeader
                  icon="construct"
                  title="Estrategias Circulares"
                  subtitle="Toca una estrategia para ver plan de implementación"
                  color={GREEN}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, marginBottom: 14 }}
                >
                  {catsEc.map(function (cat) {
                    var active = ecFilter === cat;
                    var catCol = CAT_CLR[cat] || BLUE;
                    return (
                      <TouchableOpacity
                        key={cat}
                        onPress={function () {
                          setEcFilter(cat);
                        }}
                        style={[
                          s.chip,
                          active && {
                            backgroundColor: catCol,
                            borderColor: catCol,
                          },
                        ]}
                      >
                        <Text style={[s.chipTx, active && { color: WHITE }]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                {filteredStrats.map(function (st) {
                  var stCol = st.color || CAT_CLR[st.category] || GREEN;
                  var estadoColor = ESTADO_CLR[st.estado] || GREEN;
                  return (
                    <TouchableOpacity
                      key={st.id}
                      onPress={function () {
                        setSelStrategy(st);
                      }}
                      style={[s.stratCard, { borderLeftColor: stCol }]}
                      activeOpacity={0.75}
                    >
                      <View style={s.stratHead}>
                        <View
                          style={[
                            s.stratIcon,
                            { backgroundColor: stCol + "20" },
                          ]}
                        >
                          <Ionicons
                            name={st.icon || "leaf"}
                            size={24}
                            color={stCol}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <Text style={s.stratName}>{st.name}</Text>
                            <View
                              style={[
                                s.estadoBadge,
                                { backgroundColor: estadoColor + "20" },
                              ]}
                            >
                              <View
                                style={[
                                  s.dot,
                                  { backgroundColor: estadoColor },
                                ]}
                              />
                              <Text
                                style={[s.estadoTx, { color: estadoColor }]}
                              >
                                {st.estado}
                              </Text>
                            </View>
                          </View>
                          <Text style={s.stratDesc} numberOfLines={2}>
                            {st.desc}
                          </Text>
                        </View>
                      </View>
                      <View style={s.stratFoot}>
                        <View style={s.stratStat}>
                          <Text style={s.stratStatL}>Residuos</Text>
                          <Text style={[s.stratStatV, { color: stCol }]}>
                            {st.residuos}
                          </Text>
                        </View>
                        <View style={s.divider} />
                        <View style={s.stratStat}>
                          <Text style={s.stratStatL}>Beneficio</Text>
                          <Text style={[s.stratStatV, { color: GREEN }]}>
                            {st.beneficio}
                          </Text>
                        </View>
                        <View style={s.divider} />
                        <View style={s.stratStat}>
                          <Text style={s.stratStatL}>Impacto</Text>
                          <Text style={[s.stratStatV, { color: ORANGE }]}>
                            {st.impact}
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#ccc"
                          style={{ marginLeft: 4 }}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {/* Pesaje de residuos — camiones (API o fallback) */}
            <SectionHeader
              icon="scale"
              title="Pesaje de Residuos"
              subtitle="Trazabilidad en tiempo real"
              color={ORANGE}
            />
            <View style={s.truckList}>
              {trucks.map(function (truck) {
                var statusColor = truck.status === "Completado" ? GREEN : BLUE;
                return (
                  <View key={truck.id} style={s.truckCard}>
                    <View style={s.truckHeader}>
                      <View
                        style={[
                          s.truckIconBox,
                          { backgroundColor: ORANGE + "18" },
                        ]}
                      >
                        <Ionicons name="trash" size={18} color={ORANGE} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text style={s.truckId}>Camión {truck.id}</Text>
                          <View
                            style={[
                              s.effBadge,
                              { backgroundColor: GREEN + "18" },
                            ]}
                          >
                            <Text style={[s.effTx, { color: GREEN }]}>
                              {truck.efficiency}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={[
                            s.statusPill,
                            { backgroundColor: statusColor + "18" },
                          ]}
                        >
                          <View
                            style={[s.dot, { backgroundColor: statusColor }]}
                          />
                          <Text style={[s.statusTx, { color: statusColor }]}>
                            {truck.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={s.truckDetails}>
                      <View style={s.truckDetail}>
                        <Ionicons name="map" size={12} color="#aaa" />
                        <Text style={s.truckDetailTx}>
                          Ruta:{" "}
                          <Text style={{ color: "#333", fontWeight: "700" }}>
                            {truck.route}
                          </Text>
                        </Text>
                      </View>
                      <View style={s.truckDetail}>
                        <Ionicons name="scale" size={12} color="#aaa" />
                        <Text style={s.truckDetailTx}>
                          Peso:{" "}
                          <Text style={{ color: ORANGE, fontWeight: "700" }}>
                            {truck.weight}
                          </Text>
                        </Text>
                      </View>
                      <View style={s.truckDetail}>
                        <Ionicons name="time" size={12} color="#aaa" />
                        <Text style={s.truckDetailTx}>
                          Hora:{" "}
                          <Text style={{ color: "#333", fontWeight: "700" }}>
                            {truck.time}
                          </Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Flujo de trazabilidad en tiempo real */}
            <View style={s.traceabilityCard}>
              <View style={s.traceabilityHeader}>
                <Ionicons name="git-network" size={18} color={ORANGE} />
                <Text style={s.traceabilityTitle}>
                  Flujo de trazabilidad en tiempo real
                </Text>
              </View>
              {TRACEABILITY_LOGS.map(function (log, i) {
                return (
                  <View key={i} style={s.traceabilityRow}>
                    <View style={s.traceabilityTimeBox}>
                      <Text style={s.traceabilityTime}>{log.time}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.traceabilityEvent}>{log.event}</Text>
                      <Text style={s.traceabilityPayload}>{log.payload}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Índice de circularidad */}
            {circular && (
              <>
                <SectionHeader
                  icon="analytics"
                  title="Índice de Circularidad"
                  subtitle="Hermosillo · calculado por IA"
                  color={BLUE}
                />
                <View style={s.indexCard}>
                  <View style={s.indexLeft}>
                    <Text style={s.indexScore}>
                      {circular.indice_circularidad || "—"}
                    </Text>
                    <Text style={s.indexUnit}>/ 100 pts</Text>
                    <View
                      style={[
                        s.indexPill,
                        {
                          backgroundColor: ORANGE + "20",
                          borderColor: ORANGE + "60",
                        },
                      ]}
                    >
                      <Text style={[s.indexPillTx, { color: ORANGE }]}>
                        En desarrollo
                      </Text>
                    </View>
                  </View>
                  <View style={s.indexDivider} />
                  <View style={{ flex: 2, gap: 9 }}>
                    {(circular.indice_breakdown || []).map(function (b) {
                      return (
                        <View key={b.label}>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              marginBottom: 3,
                            }}
                          >
                            <Text style={s.barLabel}>{b.label}</Text>
                            <Text
                              style={[
                                s.barLabel,
                                { color: b.color, fontWeight: "700" },
                              ]}
                            >
                              {b.value}%
                            </Text>
                          </View>
                          <View style={s.barBg}>
                            <View
                              style={[
                                s.barFill,
                                {
                                  width: b.value + "%",
                                  backgroundColor: b.color,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
                <Text style={s.dataSource}>
                  {circular.data_source || "Banco Mundial"} ·{" "}
                  {circular.last_updated || "2024"}
                </Text>
              </>
            )}
          </View>
        )}
      </ScrollView>

      <CitySheet
        city={selCity}
        onClose={function () {
          setSelCity(null);
        }}
      />
      <StrategySheet
        strategy={selStrategy}
        onClose={function () {
          setSelStrategy(null);
        }}
      />
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  header: {
    backgroundColor: BLUE,
    padding: 30,
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: WHITE,
    marginTop: 10,
  },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  headerSummary: {
    fontSize: 10,
    color: "rgba(255,255,255,0.55)",
    marginTop: 8,
    textAlign: "center",
    fontStyle: "italic",
    paddingHorizontal: 10,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderBottomWidth: 2.5,
    borderBottomColor: "transparent",
  },
  tabTx: { fontSize: 11, color: "#999", fontWeight: "600" },
  questionTagRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  questionTag: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  questionTagText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.3 },
  descBanner: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  descTitle: { fontSize: 14, fontWeight: "800", marginBottom: 5 },
  descTx: { fontSize: 12, color: "#555", lineHeight: 18 },
  aiCard: {
    backgroundColor: BLUE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  aiTitle: { fontSize: 13, fontWeight: "800", color: WHITE, flex: 1 },
  aiLive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  aiLiveTx: { fontSize: 8, fontWeight: "900", color: WHITE, letterSpacing: 1 },
  aiStats: { flexDirection: "row", justifyContent: "space-around" },
  aiStat: { alignItems: "center", gap: 2 },
  aiStatV: { fontSize: 16, fontWeight: "900", color: WHITE },
  aiStatL: { fontSize: 9, color: "rgba(255,255,255,0.7)", fontWeight: "600" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#ddd",
    backgroundColor: WHITE,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipTx: { fontSize: 11, fontWeight: "700", color: "#888" },
  cityCard: {
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cityHead: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 5,
  },
  cityName: { fontSize: 15, fontWeight: "800", color: "#111" },
  cityState: { fontSize: 11, color: "#aaa", fontWeight: "600" },
  cityMid: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 7,
  },
  sectorDot: { width: 7, height: 7, borderRadius: 4 },
  citySector: { fontSize: 11, color: "#666", flex: 1, fontWeight: "600" },
  riskBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  riskTx: { fontSize: 9, fontWeight: "700" },
  cityFoot: { flexDirection: "row", alignItems: "center", gap: 10 },
  cityInv: { fontSize: 14, fontWeight: "900" },
  cityGrowth: { fontSize: 12, fontWeight: "700" },
  cityType: { fontSize: 10, color: "#aaa", fontWeight: "600" },
  scoreBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreTx: { fontSize: 18, fontWeight: "900", color: WHITE },
  scoreLabel: {
    fontSize: 7,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "800",
    letterSpacing: 1,
  },
  gridRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 6 },
  nearCard: {
    width: (width - 48) / 2,
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  nearBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  nearPotential: { fontSize: 9, fontWeight: "800", color: WHITE },
  nearRegion: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111",
    marginBottom: 2,
  },
  nearCompanies: { fontSize: 11, color: "#888", marginBottom: 4 },
  nearInv: { fontSize: 14, fontWeight: "900", marginBottom: 4 },
  nearRationale: { fontSize: 9, color: "#aaa", lineHeight: 13 },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    width: (width - 48) / 2,
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 14,
    alignItems: "flex-start",
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  kpiCardVal: { fontSize: 20, fontWeight: "900" },
  kpiCardUnit: { fontSize: 12, fontWeight: "600" },
  kpiCardLabel: { fontSize: 10, color: "#888", fontWeight: "600" },
  mixCard: {
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 9,
  },
  mixRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  mixDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  mixLabel: { fontSize: 11, color: "#333", fontWeight: "600", width: 95 },
  mixBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  mixBarFill: { height: 8, borderRadius: 4 },
  mixPct: { fontSize: 11, fontWeight: "800", width: 32, textAlign: "right" },
  stratCard: {
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  stratHead: { flexDirection: "row", gap: 12, marginBottom: 12 },
  stratIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stratName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111",
    flex: 1,
    marginBottom: 3,
  },
  stratDesc: { fontSize: 11, color: "#666", lineHeight: 16 },
  estadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  estadoTx: { fontSize: 9, fontWeight: "700" },
  stratFoot: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  stratStat: { flex: 1, alignItems: "center" },
  stratStatL: {
    fontSize: 8,
    color: "#aaa",
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  stratStatV: { fontSize: 12, fontWeight: "900" },
  divider: { width: 1, height: 28, backgroundColor: "#ebebeb" },
  dot: { width: 5, height: 5, borderRadius: 3 },
  truckList: { gap: 10, marginBottom: 16 },
  truckCard: {
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  truckHeader: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 10,
  },
  truckIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  truckId: { fontSize: 14, fontWeight: "800", color: "#111" },
  effBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  effTx: { fontSize: 10, fontWeight: "800" },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusTx: { fontSize: 9, fontWeight: "700" },
  truckDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: BG,
    borderRadius: 10,
    padding: 10,
  },
  truckDetail: { flexDirection: "row", alignItems: "center", gap: 4 },
  truckDetailTx: { fontSize: 11, color: "#aaa" },
  traceabilityCard: {
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  traceabilityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  traceabilityTitle: { fontSize: 13, fontWeight: "800", color: "#333" },
  traceabilityRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 9,
    backgroundColor: BG,
    borderRadius: 10,
    padding: 9,
  },
  traceabilityTimeBox: {
    backgroundColor: ORANGE + "20",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  traceabilityTime: { fontSize: 10, color: ORANGE, fontWeight: "800" },
  traceabilityEvent: { fontSize: 11, color: "#333", fontWeight: "700" },
  traceabilityPayload: { fontSize: 10, color: "#777", marginTop: 2 },
  indexCard: {
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  indexLeft: { alignItems: "center", flex: 1 },
  indexScore: { fontSize: 38, fontWeight: "900", color: BLUE, lineHeight: 42 },
  indexUnit: { fontSize: 10, color: "#aaa", fontWeight: "600", marginTop: 2 },
  indexPill: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  indexPillTx: { fontSize: 10, fontWeight: "700" },
  indexDivider: {
    width: 1,
    backgroundColor: "#ebebeb",
    marginHorizontal: 12,
    alignSelf: "stretch",
  },
  barLabel: { fontSize: 9, color: "#aaa", fontWeight: "600" },
  barBg: {
    height: 7,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: 7, borderRadius: 4 },
  dataSource: {
    fontSize: 9,
    color: "#bbb",
    textAlign: "center",
    marginTop: 12,
    fontWeight: "600",
  },
});
