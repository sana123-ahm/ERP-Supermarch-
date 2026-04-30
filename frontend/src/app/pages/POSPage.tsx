import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Scan, Plus, Minus, Trash2, CreditCard, Banknote, Receipt, ShoppingCart, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
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
import { productsApi, salesApi } from "../../services/api";

interface CartItem {
  id: string;
  name: string;
  barcode: string;
  price: number;
  tva: number;
  quantity: number;
}

interface Sale {
  id: string;
  items: CartItem[];
  subtotal: number;
  tva: number;
  total: number;
  paymentMethod: "cash" | "card";
  date: string;
  receiptNumber?: string;
  cashGiven?: number;
  change?: number;
  saleDate?: string;
  totalAmount?: number;
  taxAmount?: number;
  cashierName?: string;
}



export function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [barcode, setBarcode] = useState("");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("card");
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [todaySales, setTodaySales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);
  const [visibleCountSales, setVisibleCountSales] = useState(5);
  const [visibleCountProducts, setVisibleCountProducts] = useState(10);

  useEffect(() => {
    loadProducts();
    loadSales();
  }, []);

  const normalizeSale = (sale: any): Sale => {
    const items = Array.isArray(sale.items)
      ? sale.items.map((item: any) => ({
          id: item.productId ?? item.id ?? "",
          name: item.productName ?? "",
          barcode: item.barcode ?? "",
          price: Number(item.unitPrice ?? 0),
          tva: Number(item.discountPercentage ?? 0),
          quantity: Number(item.quantity ?? 0),
        }))
      : [];

    return {
      id: sale.id ?? "",
      items,
      subtotal: Number(sale.subtotal ?? sale.totalAmount ?? 0) - Number(sale.taxAmount ?? 0),
      tva: Number(sale.tva ?? sale.taxAmount ?? 0),
      total: Number(sale.total ?? sale.totalAmount ?? 0),
      paymentMethod: (String(sale.paymentMethod ?? "card").toLowerCase() === "cash" ? "cash" : "card"),
      date: sale.date ?? sale.saleDate ?? new Date().toISOString(),
      receiptNumber: sale.receiptNumber,
      saleDate: sale.saleDate ?? sale.date ?? new Date().toISOString(),
      totalAmount: Number(sale.totalAmount ?? sale.total ?? 0),
      taxAmount: Number(sale.taxAmount ?? sale.tva ?? 0),
    };
  };

  const loadProducts = async () => {
    try {
      const data = await productsApi.getAll();
      setAvailableProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSales = async () => {
    try {
      const data = await salesApi.getAll();
      setTodaySales((data || []).map(normalizeSale));
    } catch (error) {
      console.error("Error loading sales:", error);
    }
  };

  const scanProduct = () => {
    if (!barcode) {
      toast.error("Veuillez saisir un code-barres");
      return;
    }

    const product = availableProducts.find((p) => p.barcode === barcode);
    if (!product) {
      toast.error("Produit non trouvé");
      return;
    }

    addToCart(product);
    setBarcode("");
  };

  const addToCart = (product: typeof availableProducts[0]) => {
    const existingItem = cart.find((item) => item.id === product.id);
    
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...product,
          quantity: 1,
        },
      ]);
    }
    toast.success(`${product.name} ajouté au panier`);
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(
      cart
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setBarcode("");
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tvaAmount = cart.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      return sum + itemTotal * (item.tva / 100);
    }, 0);
    const total = subtotal + tvaAmount;
    
    return { subtotal, tva: tvaAmount, total };
  };

  const { subtotal, tva, total } = calculateTotals();
  const change = paymentMethod === "cash" ? Math.max(0, cashGiven - total) : 0;

  const processSale = async () => {
    if (cart.length === 0) {
      toast.error("Le panier est vide");
      return;
    }

    if (paymentMethod === "cash" && cashGiven < total) {
      toast.error("Montant insuffisant");
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        totalAmount: total.toString(),
        taxAmount: tva.toString(),
        discountAmount: "0",
        paymentMethod: paymentMethod.toUpperCase(),
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price.toString(),
          totalPrice: (item.price * item.quantity),
        }))
      };

      const createdSale = await salesApi.create(saleData);
      
      setTodaySales([normalizeSale(createdSale), ...todaySales]);
      toast.success("Vente enregistrée avec succès !");
      
      printReceipt(normalizeSale(createdSale));
      clearCart();
      setPaymentDialogOpen(false);
      setCashGiven(0);
    } catch (error: any) {
      console.error("Error processing sale:", error);
      toast.error(error.message || "Erreur lors de l'enregistrement de la vente");
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = (sale: Sale) => {
    setReceiptSale(sale);
    setReceiptDialogOpen(true);
  };

  const quickAmounts = [5, 10, 20, 50, 100];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Point de Vente (POS)</h1>
        <p className="text-slate-600">Interface de caisse</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Ventes du jour</p>
                <p className="text-2xl font-bold text-slate-900">{todaySales.length}</p>
              </div>
              <Receipt className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">CA du jour</p>
                <p className="text-2xl font-bold text-slate-900">
                  {todaySales.reduce((sum, s) => sum + s.total, 0).toFixed(2)} DH
                </p>
              </div>
              <CreditCard className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Paiements CB</p>
                <p className="text-2xl font-bold text-slate-900">
                  {todaySales.filter((s) => s.paymentMethod === "card").length}
                </p>
              </div>
              <CreditCard className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Paiements Espèces</p>
                <p className="text-2xl font-bold text-slate-900">
                  {todaySales.filter((s) => s.paymentMethod === "cash").length}
                </p>
              </div>
              <Banknote className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle>Ventes récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todaySales.slice(0, visibleCountSales).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div>
                  <p className="font-semibold text-slate-900">{sale.receiptNumber ?? sale.id}</p>
                  <p className="text-sm text-slate-600">{new Date(sale.date).toLocaleString("fr-FR")}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{sale.total.toFixed(2)} DH</p>
                  <Badge variant="outline">{sale.paymentMethod === "cash" ? "Espèces" : "Carte"}</Badge>
                </div>
              </div>
            ))}
            {todaySales.length === 0 && <p className="text-sm text-slate-500">Aucune vente enregistrée.</p>}
          </div>
          {todaySales.length > 5 && (
            <div className="flex justify-center mt-4">
              {visibleCountSales < todaySales.length ? (
                <Button variant="outline" size="sm" onClick={() => setVisibleCountSales(todaySales.length)}>
                  Voir plus
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setVisibleCountSales(5)}>
                  Voir moins
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main POS Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Products & Scanner */}
        <div className="lg:col-span-2 space-y-4">
          {/* Barcode Scanner */}
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5" />
                Scanner de produits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Scanner ou saisir le code-barres..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && scanProduct()}
                  className="flex-1"
                />
                <Button onClick={scanProduct} className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <Scan className="w-4 h-4 mr-2" />
                  Scanner
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Product Grid */}
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle>Produits disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableProducts.slice(0, visibleCountProducts).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="p-4 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-900 text-sm">{product.name}</h4>
                      <Plus className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-lg font-bold text-blue-600">{product.price.toFixed(2)} DH</p>
                    <p className="text-xs text-slate-500">TVA {product.tva}%</p>
                  </button>
                ))}
              </div>
              {availableProducts.length > 10 && (
                <div className="flex justify-center mt-6">
                  {visibleCountProducts < availableProducts.length ? (
                    <Button variant="outline" onClick={() => setVisibleCountProducts(availableProducts.length)}>
                      Voir plus ({availableProducts.length - visibleCountProducts} restants)
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => setVisibleCountProducts(10)}>
                      Voir moins
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Cart & Payment */}
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Panier ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </CardTitle>
                {cart.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Vider le panier ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Voulez-vous vraiment supprimer tous les articles du panier ?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={clearCart} className="bg-red-600 hover:bg-red-700">
                          Vider
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Panier vide</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-600">{item.price.toFixed(2)} DH × {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="font-bold text-slate-900">
                          {(item.price * item.quantity).toFixed(2)} DH
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Sous-total HT</span>
                      <span className="font-semibold">{subtotal.toFixed(2)} DH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">TVA</span>
                      <span className="font-semibold">{tva.toFixed(2)} DH</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total TTC</span>
                      <span className="text-blue-600">{total.toFixed(2)} DH</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg text-lg py-6"
                    onClick={() => setPaymentDialogOpen(true)}
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Encaisser {total.toFixed(2)} DH
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Encaisser le paiement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Montant à payer</p>
              <p className="text-3xl font-bold text-slate-900">{total.toFixed(2)} DH</p>
            </div>

            <div>
              <Label>Mode de paiement</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("card")}
                  className={paymentMethod === "card" ? "bg-blue-600" : ""}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Carte Bancaire
                </Button>
                <Button
                  variant={paymentMethod === "cash" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("cash")}
                  className={paymentMethod === "cash" ? "bg-green-600" : ""}
                >
                  <Banknote className="w-4 h-4 mr-2" />
                  Espèces
                </Button>
              </div>
            </div>

            {paymentMethod === "cash" && (
              <>
                <div>
                  <Label htmlFor="cashGiven">Montant donné par le client</Label>
                  <Input
                    id="cashGiven"
                    type="number"
                    step="0.01"
                    value={cashGiven || ""}
                    onChange={(e) => setCashGiven(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="text-lg"
                  />
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount}
                      size="sm"
                      variant="outline"
                      onClick={() => setCashGiven(amount)}
                    >
                      {amount}DH
                    </Button>
                  ))}
                </div>

                {cashGiven >= total && (
                  <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                    <p className="text-sm text-green-700 mb-1">Rendu monnaie</p>
                    <p className="text-2xl font-bold text-green-700">{change.toFixed(2)} DH</p>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPaymentDialogOpen(false)} className="flex-1">
                Annuler
              </Button>
              <Button
                onClick={processSale}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700"
                disabled={paymentMethod === "cash" && cashGiven < total}
              >
                Valider le paiement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Ticket de Caisse</DialogTitle>
          </DialogHeader>
          {receiptSale && (
            <div className="bg-white p-4 font-mono text-sm text-slate-800 space-y-4 shadow-inner border border-slate-200">
              <div className="text-center border-b border-dashed border-slate-400 pb-4">
                <h2 className="text-xl font-bold uppercase mb-1">ERP Supermarché</h2>
                <p className="text-xs">123 Avenue du Commerce, Paris</p>
                <p className="text-xs">Tél: 01 23 45 67 89</p>
              </div>
              
              <div className="border-b border-dashed border-slate-400 pb-4 space-y-1">
                <p>Ticket: {receiptSale.receiptNumber}</p>
                <p>Date: {new Date(receiptSale.saleDate!).toLocaleString('fr-FR')}</p>
                <p>Caissier: {receiptSale.cashierName || "Caisse 1"}</p>
              </div>

              <div className="space-y-2 border-b border-dashed border-slate-400 pb-4">
                <div className="flex justify-between font-bold mb-2">
                  <span>Qte x Article</span>
                  <span>Total</span>
                </div>
                {receiptSale.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{(item.price * item.quantity).toFixed(2)} DH</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 border-b border-dashed border-slate-400 pb-4">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span>{(receiptSale.totalAmount! - receiptSale.taxAmount!).toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA:</span>
                  <span>{receiptSale.taxAmount!.toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2">
                  <span>TOTAL TTC:</span>
                  <span>{receiptSale.totalAmount!.toFixed(2)} DH</span>
                </div>
              </div>

              <div className="text-center pt-2">
                <p className="font-bold">Moyen de paiement: {receiptSale.paymentMethod === 'cash' ? 'Espèces' : 'Carte'}</p>
                <p className="mt-4 italic text-xs">Merci de votre visite et à bientôt !</p>
              </div>
            </div>
          )}
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setReceiptDialogOpen(false)}>
              Fermer
            </Button>
            <Button onClick={() => {
              window.print();
            }} className="bg-gradient-to-r from-blue-600 to-blue-700">
              Imprimer le ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
