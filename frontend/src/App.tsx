import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { GuestRoute } from "./components/GuestRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Products } from "./pages/Products";
import { POS } from "./pages/POS";
import { SalesHistory } from "./pages/SalesHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Only accessible when NOT logged in */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<POS />} />
          <Route path="/products" element={<Products />} />
          <Route path="/sales" element={<SalesHistory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
