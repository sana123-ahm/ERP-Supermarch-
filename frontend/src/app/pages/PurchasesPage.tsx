import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Plus, Search, FileText, Check, X, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { purchasesApi, productsApi, suppliersApi } from "../../services/api";

interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierName: string;
  date: string;
  items: PurchaseOrderItem[];
  total: number;
  status: "pending" | "received" | "cancelled";
}


export function PurchasesPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [formData, setFormData] = useState({
    supplierName: "",
    items: [] as PurchaseOrderItem[],
  });
  const [currentItem, setCurrentItem] = useState<PurchaseOrderItem>({
    productId: "",
    productName: "",
    quantity: 0,
    unitPrice: 0,
  });

  const [dbSuppliers, setDbSuppliers] = useState<any[]>([]);
  const [dbProducts, setDbProducts] = useState<any[]>([]);

  useEffect(() => {
    loadOrders();
    loadSuppliers();
    loadProducts();
  }, []);

  const loadSuppliers = async () => {
    try {
      const data = await suppliersApi.getAll();
      setDbSuppliers(data);
    } catch (error) {
      console.error("Error loading suppliers:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productsApi.getAll();
      setDbProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await purchasesApi.getAll();
      const normalized = (data || []).map((order: any) => {
        const items = Array.isArray(order.items) ? order.items : [];
        return {
          id: order.id,
          orderNumber: order.orderNumber ?? order.id ?? "",
          supplierName: order.supplierName ?? "",
          date: order.date ?? order.purchaseDate ?? new Date().toISOString(),
          items: items.map((item: any) => ({
            productId: item.productId ?? "",
            productName: item.productName ?? "",
            quantity: Number(item.quantity ?? 0),
            unitPrice: Number(item.unitPrice ?? 0),
            totalPrice: Number(item.totalPrice ?? (item.quantity * item.unitPrice) ?? 0),
          })),
          total: Number(order.total ?? order.totalAmount ?? 0),
          status: (order.status ?? "pending").toString().toLowerCase(),
        } as PurchaseOrder;
      });
      setOrders(normalized);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      (order.orderNumber ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.supplierName ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItemToOrder = () => {
    if (currentItem.productName && currentItem.quantity > 0) {
      setFormData({
        ...formData,
        items: [...formData.items, { ...currentItem, totalPrice: currentItem.quantity * currentItem.unitPrice }],
      });
      setCurrentItem({ productId: "", productName: "", quantity: 0, unitPrice: 0 });
    }
  };

  const removeItemFromOrder = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let itemsToSubmit = [...formData.items];
    if (currentItem.productName && currentItem.quantity > 0) {
      itemsToSubmit.push({ ...currentItem, totalPrice: currentItem.quantity * currentItem.unitPrice });
    }
    if (itemsToSubmit.length === 0) {
      toast.error("Ajoutez au moins un produit");
      return;
    }
    setConfirmSubmitOpen(true);
  };

  const handleSubmit = async () => {
    let itemsToSubmit = [...formData.items];
    if (currentItem.productName && currentItem.quantity > 0) {
      itemsToSubmit.push({ ...currentItem, totalPrice: currentItem.quantity * currentItem.unitPrice });
    }
    
    if (itemsToSubmit.length === 0) {
      toast.error("Ajoutez au moins un produit");
      return;
    }

    try {
      setLoading(true);
      const total = itemsToSubmit.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

      const newOrder = await purchasesApi.create({
        supplierId: formData.supplierName, // Now storing supplier ID instead of name locally
        items: itemsToSubmit,
        totalAmount: total,
      });

      toast.success("Bon de commande créé avec succès");
      setDialogOpen(false);
      resetForm();
      await loadOrders(); // Reload to get fresh data with populated supplier name if backend does that
    } catch (error) {
      console.error("Error saving purchase order:", error);
      toast.error("Erreur lors de la création de la commande");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      supplierName: "",
      items: [],
    });
    setCurrentItem({ productId: "", productName: "", quantity: 0, unitPrice: 0 });
  };

  const markAsReceived = async (id: string) => {
    try {
      await purchasesApi.updateStatus(id, "RECEIVED");
      setOrders(orders.map((o) => (o.id === id ? { ...o, status: "received" as const } : o)));
      toast.success("Commande marquée comme reçue - Stock mis à jour");
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Erreur lors de la mise à jour du statut");
    }
  };

  const cancelOrder = async (id: string) => {
    try {
      await purchasesApi.updateStatus(id, "CANCELLED");
      setOrders(orders.map((o) => (o.id === id ? { ...o, status: "cancelled" as const } : o)));
      toast.success("Commande annulée");
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Erreur lors de l'annulation de la commande");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "En attente", color: "bg-orange-500" };
      case "received":
        return { label: "Reçue", color: "bg-green-500" };
      case "cancelled":
        return { label: "Annulée", color: "bg-red-500" };
      default:
        return { label: "Inconnu", color: "bg-slate-500" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestion des Achats</h1>
          <p className="text-slate-600">Créez et suivez vos bons de commande</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Bon de Commande
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un bon de commande</DialogTitle>
            </DialogHeader>
            <form onSubmit={onFormSubmit} className="space-y-4">
              <div>
                <Label htmlFor="supplier">Fournisseur *</Label>
                <Select
                  value={formData.supplierName}
                  onValueChange={(value) => setFormData({ ...formData, supplierName: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un fournisseur..." />
                  </SelectTrigger>
                  <SelectContent>
                    {dbSuppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-slate-900">Ajouter des produits</h3>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <Label htmlFor="product">Produit</Label>
                    <Select
                      value={currentItem.productName}
                      onValueChange={(value) => {
                        const product = dbProducts.find((p) => p.name === value);
                        setCurrentItem({
                          ...currentItem,
                          productId: product?.id || "",
                          productName: value,
                          unitPrice: product?.price || 0,
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Produit..." />
                      </SelectTrigger>
                      <SelectContent>
                        {dbProducts.map((product) => (
                          <SelectItem key={product.id} value={product.name}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Label htmlFor="quantity">Quantité</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={currentItem.quantity || ""}
                      onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="col-span-3">
                    <Label htmlFor="unitPrice">Prix unitaire</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      value={currentItem.unitPrice || ""}
                      onChange={(e) => setCurrentItem({ ...currentItem, unitPrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="col-span-1 flex items-end">
                    <Button type="button" onClick={addItemToOrder} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {formData.items.length > 0 && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead>Produit</TableHead>
                          <TableHead>Quantité</TableHead>
                          <TableHead>Prix unitaire</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.unitPrice.toFixed(2)} DH</TableCell>
                            <TableCell className="font-semibold">
                              {(item.quantity * item.unitPrice).toFixed(2)} DH
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="text-red-600"
                                onClick={() => removeItemFromOrder(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-slate-50 font-semibold">
                          <TableCell colSpan={3}>Total</TableCell>
                          <TableCell>
                            {formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0).toFixed(2)} DH
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700">
                  Créer le bon de commande
                </Button>
              </div>
            </form>

            <AlertDialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Voulez-vous vraiment créer ce nouveau bon de commande ?
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Commandes</p>
                <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">En attente</p>
                <p className="text-2xl font-bold text-slate-900">
                  {orders.filter((o) => o.status === "pending").length}
                </p>
              </div>
              <Package className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Reçues</p>
                <p className="text-2xl font-bold text-slate-900">
                  {orders.filter((o) => o.status === "received").length}
                </p>
              </div>
              <Check className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Montant Total</p>
                <p className="text-2xl font-bold text-slate-900">
                  {orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)} DH
                </p>
              </div>
              <FileText className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher une commande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredOrders.slice(0, visibleCount).map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <Card key={order.id} className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-slate-900">{order.orderNumber}</h3>
                        <Badge className={`${badge.color} text-white`}>{badge.label}</Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        Fournisseur: <span className="font-semibold">{order.supplierName}</span>
                      </p>
                      <p className="text-sm text-slate-600">Date: {new Date(order.date).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 mb-1">Montant total</p>
                      <p className="text-2xl font-bold text-slate-900">{order.total.toFixed(2)} DH</p>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead>Produit</TableHead>
                          <TableHead>Quantité</TableHead>
                          <TableHead>Prix unitaire</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.unitPrice.toFixed(2)} DH</TableCell>
                            <TableCell className="font-semibold">
                              {(item.quantity * item.unitPrice).toFixed(2)} DH
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {order.status === "pending" && (
                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Marquer comme reçu
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmer la réception</AlertDialogTitle>
                            <AlertDialogDescription>
                              Confirmez-vous avoir reçu tous les produits de la commande {order.orderNumber} ? Cela mettra à jour les stocks automatiquement.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => markAsReceived(order.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Confirmer la réception
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Annuler
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Annuler la commande</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir annuler la commande {order.orderNumber} ?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Retour</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => cancelOrder(order.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Annuler la commande
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {filteredOrders.length > 10 && (
            <div className="flex justify-center mt-6">
              {visibleCount < filteredOrders.length ? (
                <Button variant="outline" onClick={() => setVisibleCount(filteredOrders.length)}>
                  Voir plus ({filteredOrders.length - visibleCount} restants)
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setVisibleCount(10)}>
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
