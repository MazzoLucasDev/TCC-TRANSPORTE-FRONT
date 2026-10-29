import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import {
  generateRouteComparison,
  type RouteComparison,
} from "../../api/routes";
import { todayIso } from "../../utils/date";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { SegmentedControl } from "../../components/SegmentedControl";
import { colors, spacing, fontSize } from "../../theme";
import { distanceMeters, distanceToRouteMeters } from "../../utils/geo";

const OFF_ROUTE_M = 50; // distância que conta como "fora da rota"
const CONFIRM_FIXES = 3; // leituras seguidas fora da rota antes de recalcular
const COOLDOWN_MS = 20000; // intervalo mínimo entre recálculos
const VISITED_RADIUS_M = 40; // chegou na parada se estiver a menos disso

type RouteKind = "SIMPLE" | "OPTIMIZED";
type Coord = { latitude: number; longitude: number };

const ROUTE_OPTIONS: { label: string; value: RouteKind }[] = [
  { label: "Otimizada", value: "OPTIMIZED" },
  { label: "Simples", value: "SIMPLE" },
];

const formatKm = (km: number) => `${km.toFixed(1)} km`;
const formatMin = (min: number) => `${Math.round(min)} min`;

export function RouteScreen({ route }: any) {
  const { vanId } = route.params as { vanId: string };
  const mapRef = useRef<MapView>(null);
  const visited = useRef<Set<string>>(new Set());
  const outCount = useRef(0);
  const lastRecalc = useRef(0);
  const recalculating = useRef(false);

  const [origin, setOrigin] = useState<Coord | null>(null);
  const [data, setData] = useState<RouteComparison | null>(null);
  const [selected, setSelected] = useState<RouteKind>("OPTIMIZED");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generate = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
        visited.current = new Set(); // recálculo manual recomeça do zero
      }
      setErrorMessage(null);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMessage(
            "Precisamos da sua localização para definir o ponto de partida da rota.",
          );
          return;
        }

        const position = await Location.getCurrentPositionAsync({});
        const driverLocation = {
          lat: position.coords.latitude,
          long: position.coords.longitude,
        };
        setOrigin({
          latitude: driverLocation.lat,
          longitude: driverLocation.long,
        });

        const result = await generateRouteComparison({
          vanId,
          date: todayIso(),
          driverLocation,
          visitedStudentIds: [...visited.current],
          persist: !silent,
        });
        setData(result);
      } catch (error: any) {
        if (!silent) setData(null);
        setErrorMessage(
          error.response?.data?.error ?? "Não foi possível gerar a rota",
        );
      } finally {
        setLoading(false);
      }
    },
    [vanId],
  );

  useEffect(() => {
    generate();
  }, [generate]);

  const selectedRoute = data
    ? selected === "SIMPLE"
      ? data.simpleRoute
      : data.optimizedRoute
    : null;

  const coordinates: Coord[] = useMemo(() => {
    if (!selectedRoute) return [];
    return selectedRoute.geometry.map((p) => ({
      latitude: p.lat,
      longitude: p.long,
    }));
  }, [selectedRoute]);

  useEffect(() => {
    if (coordinates.length < 2) return;
    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
      animated: true,
    });
  }, [coordinates]);

  useEffect(() => {
    if (!selectedRoute || coordinates.length < 2) return;
    let subscription: Location.LocationSubscription | undefined;
    let cancelled = false;

    (async () => {
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 10,
        },
        async ({ coords }) => {
          const here = {
            latitude: coords.latitude,
            longitude: coords.longitude,
          };

          // marca as paradas já alcançadas
          for (const stop of selectedRoute.stops) {
            const stopCoord = { latitude: stop.lat, longitude: stop.long };
            if (distanceMeters(here, stopCoord) < VISITED_RADIUS_M) {
              visited.current.add(stop.studentId);
            }
          }
          const allVisited = selectedRoute.stops.every((s) =>
            visited.current.has(s.studentId),
          );
          if (allVisited) return; // rota concluída, nada a recalcular

          // fora da rota?
          outCount.current =
            distanceToRouteMeters(here, coordinates) > OFF_ROUTE_M
              ? outCount.current + 1
              : 0;

          if (
            outCount.current >= CONFIRM_FIXES &&
            !recalculating.current &&
            Date.now() - lastRecalc.current > COOLDOWN_MS
          ) {
            recalculating.current = true;
            outCount.current = 0;
            lastRecalc.current = Date.now();
            try {
              await generate(true);
            } finally {
              recalculating.current = false;
            }
          }
        },
      );
      if (cancelled) sub.remove();
      else subscription = sub;
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [selectedRoute, coordinates, generate]);

  const summaryText = useMemo(() => {
    if (!data) return "";
    const saved = data.simpleRoute.distanceKm - data.optimizedRoute.distanceKm;
    if (saved > 0.05 && data.simpleRoute.distanceKm > 0) {
      const percent = (saved / data.simpleRoute.distanceKm) * 100;
      return `A rota otimizada economiza ${saved.toFixed(1)} km (${percent.toFixed(0)}%).`;
    }
    return "As duas rotas têm distâncias equivalentes para estes pontos.";
  }, [data]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: -14.2,
          longitude: -51.9,
          latitudeDelta: 40,
          longitudeDelta: 40,
        }}
      >
        {origin && (
          <Marker coordinate={origin} title="Saída (você)" pinColor="blue" />
        )}

        {selectedRoute?.stops.map((stop, index) => (
          <Marker
            key={stop.studentId}
            coordinate={{ latitude: stop.lat, longitude: stop.long }}
            title={`${index + 1}. ${stop.name}`}
          />
        ))}

        {coordinates.length > 1 && (
          <Polyline
            coordinates={coordinates}
            strokeWidth={4}
            strokeColor={
              selected === "OPTIMIZED" ? colors.primary : colors.danger
            }
          />
        )}
      </MapView>

      <View style={styles.panel}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.muted}>Calculando rotas...</Text>
          </View>
        ) : errorMessage ? (
          <Card>
            <Text style={styles.error}>{errorMessage}</Text>
          </Card>
        ) : data && selectedRoute ? (
          <>
            <SegmentedControl
              value={selected}
              onChange={setSelected}
              options={ROUTE_OPTIONS}
            />

            <Card>
              <Text style={styles.cardTitle}>Comparativo</Text>
              <Text style={styles.line}>
                Otimizada: {formatKm(data.optimizedRoute.distanceKm)} ·{" "}
                {formatMin(data.optimizedRoute.durationMin)}
              </Text>
              <Text style={styles.line}>
                Simples: {formatKm(data.simpleRoute.distanceKm)} ·{" "}
                {formatMin(data.simpleRoute.durationMin)}
              </Text>
              <Text style={styles.summary}>{summaryText}</Text>
              {selectedRoute.approximate && (
                <Text style={styles.error}>
                  Trajeto aproximado: o serviço de mapas não respondeu.
                </Text>
              )}
              <Text style={styles.order} numberOfLines={3}>
                {selectedRoute.stops
                  .map((stop, i) => `${i + 1}. ${stop.name}`)
                  .join("  →  ")}
              </Text>
            </Card>
          </>
        ) : null}

        <Button
          title="Recalcular rota"
          variant="outline"
          loading={loading}
          onPress={() => generate()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  map: { flex: 1 },
  panel: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  muted: { color: colors.textMuted, fontSize: fontSize.md },
  error: { color: colors.danger, fontSize: fontSize.md },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  line: { fontSize: fontSize.md, color: colors.text },
  summary: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: "bold",
    marginTop: spacing.sm,
  },
  order: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
