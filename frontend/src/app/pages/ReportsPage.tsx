import { useState, useEffect } from "react";
import {
  TrendingUp,
  Euro,
  Package,
  BarChart3,
  FileText,
  Download,
  Users,
  Loader2,
  PieChart as PieChartIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { reportsApi } from "../../services/api";

export function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [salesByMonth, setSalesByMonth] = useState<any[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [employeePerformance, setEmployeePerformance] = useState<any[]>([]);
  const [dailySales, setDailySales] = useState<number>(0);
  const [averageBasket, setAverageBasket] = useState<number>(0);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const data = await reportsApi.getAnalytics();
      setSalesByMonth(Array.isArray(data?.salesByMonth) ? data.salesByMonth : []);
      setSalesByCategory(
        (Array.isArray(data?.salesByCategory) ? data.salesByCategory : []).map(
          (c: any, index: number) => ({
            ...c,
            color: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#6b7280"][index % 5],
          })
        )
      );
      setTopProducts(Array.isArray(data?.topProducts) ? data.topProducts : []);
      setEmployeePerformance(Array.isArray(data?.employeePerformance) ? data.employeePerformance : []);
      setDailySales(data?.dailySales ?? 0);
      setAverageBasket(data?.averageBasket ?? 0);
    } catch (error) {
      console.error("Error loading report data:", error);
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportType: string, reportName: string) => {
    try {
      toast.info(`Génération du ${reportName}...`);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/reports/export/${reportType}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport_${reportType}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`${reportName} téléchargé !`);
    } catch (error: any) {
      console.error("Error exporting report:", error);
      toast.error(error.message || `Erreur lors de l'export du ${reportName}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Rapports & Statistiques</h1>
        <p className="text-slate-600">Analyses et exports de données</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">CA du mois</p>
                <p className="text-2xl font-bold text-slate-900">
                  {(
                    salesByMonth?.[salesByMonth.length - 1]?.ventes ??
                    salesByMonth?.[salesByMonth.length - 1]?.sales ??
                    0
                  ).toLocaleString()}{" "}
                  DH
                </p>
              </div>
              <Euro className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Ventes totales</p>
                <p className="text-2xl font-bold text-slate-900">
                  {(salesByMonth || []).reduce((sum, m: any) => sum + (m?.count ?? 0), 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Produits vendus</p>
                <p className="text-2xl font-bold text-slate-900">
                  {(topProducts || []).reduce((sum, p: any) => sum + (p?.sold ?? p?.quantite ?? 0), 0).toLocaleString()}
                </p>
              </div>
              <Package className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Marge brute</p>
                <p className="text-2xl font-bold text-slate-900">—</p>
              </div>
              <BarChart3 className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Buttons */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Exports de rapports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-4 px-4"
              onClick={() => downloadReport("sales", "Rapport de ventes")}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Rapport de ventes</p>
                  <p className="text-xs text-slate-600">Ventes détaillées</p>
                </div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="justify-start h-auto py-4 px-4"
              onClick={() => downloadReport("stocks", "Rapport de stocks")}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Rapport de stocks</p>
                  <p className="text-xs text-slate-600">État des stocks</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4 px-4"
              onClick={() => downloadReport("financial", "Rapport financier")}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Rapport financier</p>
                  <p className="text-xs text-slate-600">CA et marges</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4 px-4"
              onClick={() => downloadReport("hr", "Rapport RH")}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Rapport RH</p>
                  <p className="text-xs text-slate-600">Employés et heures</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sales Evolution */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Évolution CA & Achats (4 derniers mois)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="ventes" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 5 }} />
                <Line type="monotone" dataKey="achats" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: "#8b5cf6", r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-600" />
              Ventes par Catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toLocaleString()}DH`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Top 5 Produits du Mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      <p className="text-sm text-slate-600">{product.sold ?? product.quantite ?? 0} unités</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {(product.revenue ?? product.ca ?? 0).toLocaleString()} DH
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Employee Performance */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Performance Caissiers (Ce mois)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={employeePerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="ca" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-blue-900">Ventes Journalières (Aujourd'hui)</h3>
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-900 mb-2">{dailySales.toLocaleString()} DH</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-green-900">Taux de Rotation Stock</h3>
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-900 mb-2">12.5 j</p>
            <p className="text-sm text-green-700">Excellent taux de rotation</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-purple-900">Panier Moyen</h3>
              <Euro className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-900 mb-2">{averageBasket.toLocaleString()} DH</p>
          </CardContent>
        </Card>
      </div>
        </>
      )}
    </div>
  );
}
