import React from "react";
import { ActivityIndicator, View, Text, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { DriverHomeScreen } from "../screens/driver/DriverHomeScreen";
import { CreateVanScreen } from "../screens/driver/CreateVanScreen";
import { StudentHomeScreen } from "../screens/student/StudentHomeScreen";
import { VanStudentsScreen } from "../screens/driver/VanStudentsScreen";
import { LinkStudentScreen } from "../screens/driver/LinkStudentScreen";
import { AbsenceScreen } from "../screens/student/AbsenceScreen";
import { colors } from "../theme";
import { RouteScreen } from "../screens/driver/RouteScreen";

const Stack = createNativeStackNavigator();

function SignOutButton() {
  const { signOut } = useAuth();
  return (
    <TouchableOpacity onPress={signOut}>
      <Text style={{ color: colors.primary, fontWeight: "bold" }}>Sair</Text>
    </TouchableOpacity>
  );
}

export function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: "Cadastro" }}
            />
          </>
        ) : user.userType === "MOTORISTA" ? (
          <>
            <Stack.Screen
              name="DriverHome"
              component={DriverHomeScreen}
              options={{
                title: "Minhas vans",
                headerRight: () => <SignOutButton />,
              }}
            />
            <Stack.Screen
              name="CreateVan"
              component={CreateVanScreen}
              options={{ title: "Nova van" }}
            />
            <Stack.Screen
              name="VanStudents"
              component={VanStudentsScreen}
              options={{ title: "Alunos da van" }}
            />
            <Stack.Screen
              name="LinkStudent"
              component={LinkStudentScreen}
              options={{ title: "Vincular aluno" }}
            />
            <Stack.Screen
              name="Route"
              component={RouteScreen}
              options={{ title: "Rota de hoje" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="StudentHome"
              component={StudentHomeScreen}
              options={{ title: "Início" }}
            />
            <Stack.Screen
              name="Absence"
              component={AbsenceScreen}
              options={{ title: "Avisar ausência" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
