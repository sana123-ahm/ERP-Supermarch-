import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Plus, Minus, Search, FileText, ArrowUpCircle, ArrowDownCircle, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { stockApi, productsApi } from "../../services/api";

interface StockMovement {
  id: string;
  productName: string;
  type: "in" | "out" | "inventory";
  quantity: number;
  reason: string;
  date: string;
  user: string;
}

interface StockItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number | null;
  warehouseLocation: string | null;
  lastUpdated: string;
}





export function StockPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visibleCountStocks, setVisibleCountStocks] = useState(10);
  const [visibleCountMovements, setVisibleCountMovements] = useState(10);
  const [formData, setFormData] = useState({
    productId: "",
    type: "in" as "in" | "out" | "inventory",
    quantity: 0,
    reason: "",
  });

  useEffect(() => {
    loadMovements();
    loadStocks();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsApi.getAll();
      setAvailableProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadMovements = async () => {
    try {
      setLoading(true);
      const data = await stockApi.getMovements();
      const mappedData = data.map((m: any) => ({
        id: m.id,
        productName: m.productName,
        type: m.type.toLowerCase(),
        quantity: m.quantity,
        reason: m.reason,
        date: new Date(m.date).toLocaleString("fr-FR"),
        user: m.userName
      }));
      setMovements(mappedData);
    } catch (error) {
      console.error("Error loading movements:", error);
      toast.error("Erreur lors du chargement des mouvements");
    } finally {
      setLoading(false);
    }
  };

  const loadStocks = async () => {
    try {
      const data = await stockApi.getAll();
      const mappedData = data.map((s: any) => ({
        id: s.id,
        productId: s.productId,
        productName: s.productName,
        quantity: s.quantity,
        minQuantity: s.minQuantity,
        maxQuantity: s.maxQuantity ?? null,
        warehouseLocation: s.warehouseLocation ?? null,
        lastUpdated: s.lastUpdated,
      }));
      setStocks(mappedData);
    } catch (error) {
      console.error("Error loading stocks:", error);
      toast.error("Erreur lors du chargement des stocks");
    }
  };

  const filteredMovements = movements.filter(
    (movement) =>
      movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStocks = stocks.filter((stock) =>
    stock.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmSubmitOpen(true);
  };

  const handleSubmit = async () => {
    
    try {
      setLoading(true);
      await stockApi.addMovement({
        productId: formData.productId,
        type: formData.type.toUpperCase(),
        quantity: formData.quantity,
        reason: formData.reason
      });
      
      toast.success("Mouvement de stock enregistré");
      setDialogOpen(false);
      resetForm();
      loadMovements();
    } catch (error) {
      console.error("Error saving movement:", error);
      toast.error("Erreur lors de l'enregistrement du mouvement");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      productId: "",
      type: "in",
      quantity: 0,
      reason: "",
    });
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case "in":
        return { label: "Entrée", color: "bg-green-500" };
      case "out":
        return { label: "Sortie", color: "bg-red-500" };
      case "inventory":
        return { label: "Inventaire", color: "bg-blue-500" };
      default:
        return { label: "Inconnu", color: "bg-slate-500" };
    }
  };

  const totalIn = movements.filter((m) => m.type === "in").reduce((sum, m) => sum + m.quantity, 0);
  const totalOut = movements.filter((m) => m.type === "out").reduce((sum, m) => sum + m.quantity, 0);
  const todayMovements = movements.filter((m) => {
    const parsed = new Date(m.date);
    if (!Number.isFinite(parsed.getTime())) return false;
    const today = new Date();
    return (
      parsed.getFullYear() === today.getFullYear() &&
      parsed.getMonth() === today.getMonth() &&
      parsed.getDate() === today.getDate()
    );
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestion des Stocks</h1>
          <p className="text-slate-600">Suivez les entrées et sorties de stock</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Mouvement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enregistrer un mouvement de stock</DialogTitle>
            </DialogHeader>
            <form onSubmit={onFormSubmit} className="space-y-4">
              <div>
                <Label htmlFor="productId">Produit *</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) => setFormData({ ...formData, productId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un produit..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Type de mouvement *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle className="w-4 h-4 text-green-600" />
                        Entrée de stock
                      </div>
                    </SelectItem>
                    <SelectItem value="out">
                      <div className="flex items-center gap-2">
                        <ArrowDownCircle className="w-4 h-4 text-red-600" />
                        Sortie de stock
                      </div>
                    </SelectItem>
                    <SelectItem value="inventory">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Inventaire
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">Quantité *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="reason">Motif *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Ex: Livraison fournisseur, vente, produits périmés..."
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700">
                  Enregistrer
                </Button>
              </div>
            </form>

            <AlertDialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Voulez-vous vraiment enregistrer ce mouvement de stock ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-blue-700">
                    Confirmer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Entrées</p>
                <p className="text-2xl font-bold text-green-600">+{totalIn}</p>
              </div>
              <ArrowUpCircle className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Sorties</p>
                <p className="text-2xl font-bold text-red-600">-{totalOut}</p>
              </div>
              <ArrowDownCircle className="w-10 h-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Mouvements Aujourd'hui</p>
                <p className="text-2xl font-bold text-slate-900">{todayMovements}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Stock List */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Stocks actuels</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-500">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Chargement...
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Seuil</TableHead>
                    <TableHead>Emplacement</TableHead>
                    <TableHead>Dernière mise à jour</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStocks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500">
                        Aucun stock trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStocks.slice(0, visibleCountStocks).map((stock) => (
                      <TableRow key={stock.id}>
                        <TableCell className="font-medium">{stock.productName}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              stock.quantity === 0
                                ? "bg-red-500"
                                : stock.quantity <= stock.minQuantity
                                  ? "bg-orange-500"
                                  : "bg-green-500"
                            }
                          >
                            {stock.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell>{stock.minQuantity}</TableCell>
                        <TableCell>{stock.warehouseLocation ?? "-"}</TableCell>
                        <TableCell>
                          {stock.lastUpdated ? new Date(stock.lastUpdated).toLocaleString("fr-FR") : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {filteredStocks.length > 10 && (
                <div className="flex justify-center p-4 bg-slate-50 border-t border-slate-200">
                  {visibleCountStocks < filteredStocks.length ? (
                    <Button variant="outline" onClick={() => setVisibleCountStocks(filteredStocks.length)}>
                      Voir plus ({filteredStocks.length - visibleCountStocks} restants)
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => setVisibleCountStocks(10)}>
                      Voir moins
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Movements Table */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle className="flex-1">Historique des mouvements</CardTitle>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher un mouvement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Utilisateur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.slice(0, visibleCountMovements).map((movement) => {
                  const badge = getMovementBadge(movement.type);
                  return (
                    <TableRow key={movement.id} className="hover:bg-slate-50">
                      <TableCell className="font-mono text-sm">{movement.date}</TableCell>
                      <TableCell className="font-semibold">{movement.productName}</TableCell>
                      <TableCell>
                        <Badge className={`${badge.color} text-white`}>{badge.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${
                            movement.type === "in" ? "text-green-600" : movement.type === "out" ? "text-red-600" : "text-blue-600"
                          }`}
                        >
                          {movement.type === "in" ? "+" : movement.type === "out" ? "-" : ""}
                          {movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{movement.reason}</TableCell>
                      <TableCell className="text-slate-600">{movement.user}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {filteredMovements.length > 10 && (
            <div className="flex justify-center mt-6">
              {visibleCountMovements < filteredMovements.length ? (
                <Button variant="outline" onClick={() => setVisibleCountMovements(filteredMovements.length)}>
                  Voir plus ({filteredMovements.length - visibleCountMovements} restants)
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setVisibleCountMovements(10)}>
                  Voir moins
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
