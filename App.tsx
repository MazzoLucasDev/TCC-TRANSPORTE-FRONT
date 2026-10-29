import { Navigation } from "./src/navigation";
import { AuthProvider } from "./src/contexts/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
