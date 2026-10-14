import React, { useState } from "react";
import { Alert } from "react-native";
import { Screen } from "../../components/Screen";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { SegmentedControl } from "../../components/SegmentedControl";
import { useAuth } from "../../contexts/AuthContext";
import { createVan } from "../../api/vans";

type Period = "MANHA" | "TARDE" | "NOITE";

export function CreateVanScreen({ navigation }: any) {
  const { user } = useAuth();

  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [period, setPeriod] = useState<Period>("MANHA");
  const [destiny, setDestiny] = useState("");
  const [capacity, setCapacity] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    const yearNumber = Number(year);
    const capacityNumber = Number(capacity);

    if (
      !model ||
      !destiny ||
      !Number.isInteger(yearNumber) ||
      !Number.isInteger(capacityNumber)
    ) {
      Alert.alert(
        "Atenção",
        "Preencha todos os campos. Ano e capacidade devem ser números inteiros.",
      );
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      await createVan({
        model: model.trim(),
        year: yearNumber,
        period,
        destiny: destiny.trim(),
        capacity: capacityNumber,
        driverId: user.id,
      });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        "Erro ao cadastrar",
        error.response?.data?.error ?? "Não foi possível conectar ao servidor",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Input
        label="Modelo"
        placeholder="Ex: Mercedes Sprinter"
        value={model}
        onChangeText={setModel}
      />
      <Input
        label="Ano"
        keyboardType="number-pad"
        value={year}
        onChangeText={setYear}
      />

      <SegmentedControl
        label="Período"
        value={period}
        onChange={setPeriod}
        options={[
          { label: "Manhã", value: "MANHA" },
          { label: "Tarde", value: "TARDE" },
          { label: "Noite", value: "NOITE" },
        ]}
      />

      <Input
        label="Destino"
        placeholder="Ex: Colégio Estadual X"
        value={destiny}
        onChangeText={setDestiny}
      />
      <Input
        label="Capacidade (lugares)"
        keyboardType="number-pad"
        value={capacity}
        onChangeText={setCapacity}
      />

      <Button title="Cadastrar van" loading={loading} onPress={handleCreate} />
    </Screen>
  );
}
