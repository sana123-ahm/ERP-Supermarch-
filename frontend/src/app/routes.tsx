import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProductsPage } from "./pages/ProductsPage";
import { StockPage } from "./pages/StockPage";
import { SuppliersPage } from "./pages/SuppliersPage";
import { PurchasesPage } from "./pages/PurchasesPage";
import { POSPage } from "./pages/POSPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { LeavesPage } from "./pages/LeavesPage";
import { TimesheetPage } from "./pages/TimesheetPage";
import { ReportsPage } from "./pages/ReportsPage";
import NotificationsPage from "./pages/NotificationsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "produits", Component: ProductsPage },
      { path: "stocks", Component: StockPage },
      { path: "fournisseurs", Component: SuppliersPage },
      { path: "achats", Component: PurchasesPage },
      { path: "caisse", Component: POSPage },
      { path: "employes", Component: EmployeesPage },
      { path: "conges", Component: LeavesPage },
      { path: "pointage", Component: TimesheetPage },
      { path: "rapports", Component: ReportsPage },
      { path: "messages", Component: NotificationsPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
