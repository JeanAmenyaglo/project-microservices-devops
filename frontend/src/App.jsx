import { Routes, Route, NavLink } from 'react-router-dom';
import UsersPage from './pages/UsersPage';
import ProductsPage from './pages/ProductsPage';
import HealthPage from './pages/HealthPage';

export default function App() {
  return (
    <>
      <nav>
        <span className="brand">🚀 DevOps App</span>
        <NavLink to="/" end>Users</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/health">Health</NavLink>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<UsersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/health" element={<HealthPage />} />
        </Routes>
      </main>
    </>
  );
}
