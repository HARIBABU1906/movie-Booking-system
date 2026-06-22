import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import TheaterPage from "./pages/TheaterPage";
import SeatPage from "./pages/SeatPage";
import PaymentPage from "./pages/PaymentPage";
import TicketPage from "./pages/TicketPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import OwnerPage from "./pages/OwnerPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <AboutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <ContactPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/theaters/:id"
          element={
            <ProtectedRoute>
              <TheaterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seats/:showId"
          element={
            <ProtectedRoute>
              <SeatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ticket/:id"
          element={
            <ProtectedRoute>
              <TicketPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner"
          element={
            <ProtectedRoute ownerOnly>
              <OwnerPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
