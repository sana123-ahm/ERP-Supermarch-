# Guide d'Intégration Frontend-Backend

## 🔌 Configuration Frontend pour Backend

### 1. URL API
Dans le frontend React, configurer l'URL API:

```typescript
// src/lib/api.ts
export const API_BASE_URL = 'http://localhost:3000/api';

// Client Axios
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pour JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('erp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. Service d'Authentification
```typescript
// src/services/authService.ts
export async function login(email: string, password: string) {
  const response = await apiClient.post('/auth/login', { email, password });
  const { token, user } = response.data;
  
  localStorage.setItem('erp_token', token);
  localStorage.setItem('erp_user', JSON.stringify(user));
  
  return { token, user };
}
```

### 3. Mettre à jour AuthContext

```typescript
// src/app/context/AuthContext.tsx
import { apiClient } from '../lib/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      setUser(user);
      localStorage.setItem('erp_token', token);
      localStorage.setItem('erp_user', JSON.stringify(user));
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## 📊 Hooks pour les Données

### Products Hook
```typescript
// src/hooks/useProducts.ts
import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get('/products');
        setProducts(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
}
```

### Sales Hook
```typescript
// src/hooks/useSales.ts
export function useSales() {
  const [sales, setSales] = useState([]);

  const createSale = async (saleData) => {
    const response = await apiClient.post('/sales', saleData);
    setSales([...sales, response.data]);
    return response.data;
  };

  const getSales = async () => {
    const response = await apiClient.get('/sales');
    setSales(response.data);
  };

  return { sales, createSale, getSales };
}
```

## 📑 Mise à jour des Pages Frontend

### ProductsPage
```typescript
// src/app/pages/ProductsPage.tsx
import { useProducts } from '../hooks/useProducts';

export function ProductsPage() {
  const { products, loading } = useProducts();

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Produits</h1>
      <table>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.price}</td>
              <td>{product.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### POSPage (Caisse)
```typescript
// src/app/pages/POSPage.tsx
import { useSales } from '../hooks/useSales';

export function POSPage() {
  const { createSale } = useSales();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  const processPayment = async (paymentMethod) => {
    const sale = {
      totalAmount: total.toString(),
      taxAmount: '0',
      discountAmount: '0',
      paymentMethod,
      items: cart,
    };

    const response = await createSale(sale);
    toast.success(`Vente #${response.receiptNumber} complétée`);
    setCart([]);
    setTotal(0);
  };

  return (
    <div>
      <h1>Point de Vente</h1>
      {/* Interface caisse */}
    </div>
  );
}
```

## 🔒 Gestion des Permissions

```typescript
// src/utils/permissions.ts
export const rolePermissions = {
  ADMIN: ['read', 'create', 'update', 'delete'],
  MANAGER: ['read', 'create', 'update'],
  CAISSIER: ['read', 'create'],
  MAGASINIER: ['read', 'update'],
  RH: ['read', 'create', 'update'],
};

// Component pour protéger l'accès
export function ProtectedComponent({ requiredRole, children }) {
  const { user } = useAuth();

  if (!user || user.role !== requiredRole) {
    return <div>Accès refusé</div>;
  }

  return children;
}
```

## 🧪 Test d'Intégration

```bash
# Terminal 1: Backend
cd Backend
mvn spring-boot:run

# Terminal 2: Frontend
cd "Frontend Design for ERP"
npm run dev
```

### Tester la connexion
```
1. Ouvrir http://localhost:5173
2. Se connecter avec: admin@supermarche.com / admin123
3. Vérifier que le token est sauvegardé dans localStorage
4. Naviguer vers une page pour confirmer l'intégration
```

## 🔗 Endpoints Intégration

### Authentication Flow
```
POST /api/auth/login
↓
Récoit: { token, user }
↓
Store token in localStorage
↓
Redirect to /dashboard
```

### Data Flow - Products
```
ComponentDidMount / useEffect
↓
GET /api/products
↓
Include: Authorization: Bearer {token}
↓
Display products in table
```

### Data Flow - Sales
```
User clicks "Finaliser"
↓
POST /api/sales with cart items
↓
Backend calculates total & tax
↓
Returns: { id, receiptNumber, totalAmount }
↓
Show receipt & clear cart
```

## 🚨 Gestion des Erreurs

```typescript
// Interceptor pour gestion globale
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expiré
      localStorage.removeItem('erp_token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Permission refusée
      toast.error('Accès refusé');
    } else {
      toast.error(error.response?.data?.message || 'Erreur serveur');
    }
    return Promise.reject(error);
  }
);
```

## 📱 Formats de Réponse

### Réponse Succès
```json
{
  "id": "abc123",
  "name": "Product Name",
  "price": "10.99",
  "category": "Fruits"
}
```

### Réponse Erreur
```json
{
  "status": 400,
  "message": "Validation failed",
  "timestamp": "2024-01-15T10:30:00"
}
```

## ✅ Checklist d'Intégration

- [ ] Backend démarré sur port 3000
- [ ] Frontend démarré sur port 5173
- [ ] CORS configuré correctement
- [ ] JWT token implémenté côté frontend
- [ ] AuthContext mis à jour
- [ ] Services API créés
- [ ] Hooks de données implémentés
- [ ] Pages principales connectées
- [ ] Gestion des erreurs fonctionnelle
- [ ] Test de login réussi
- [ ] Test de création de vente réussi
- [ ] Permissions vérifiées par rôle

## 🐛 Dépannage Intégration

### CORS Error
```
Solution: Vérifier que le backend a CORS configuré
Vérifier que les origins correspondent
```

### 401 Unauthorized
```
Solution: Token peut être expiré
Renouveler le token via login
```

### 500 Internal Server Error
```
Solution: Vérifier les logs du backend
Vérifier que MySQL est opérationnel
Vérifier les tables existent
```
