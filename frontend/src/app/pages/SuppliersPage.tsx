import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Edit, Trash2, Users, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { suppliersApi } from "../../services/api";

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  address: string;
  categories: string[];
  active: boolean;
}



export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: "",
    contactPerson: "",
    email: "",
    phoneNumber: "",
    address: "",
    categories: [],
    active: true,
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await suppliersApi.getAll();
      const normalized = (data || []).map((supplier: any) => ({
        ...supplier,
        contactPerson: supplier.contactPerson ?? "",
        categories: Array.isArray(supplier.categories) ? supplier.categories : [],
      }));
      setSuppliers(normalized);
    } catch (error) {
      console.error("Error loading suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      (supplier.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.contactPerson ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.email ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmSubmitOpen(true);
  };

  const handleSubmit = async () => {

    try {
      if (editingSupplier) {
        await suppliersApi.update(editingSupplier.id, formData);
        setSuppliers(
          suppliers.map((s) =>
            s.id === editingSupplier.id ? { ...s, ...formData } as Supplier : s
          )
        );
        toast.success("Fournisseur modifié avec succès");
      } else {
        const newSupplier = await suppliersApi.create(formData);
        setSuppliers([...suppliers, newSupplier]);
        toast.success("Fournisseur ajouté avec succès");
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving supplier:", error);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData(supplier);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await suppliersApi.delete(id);
      setSuppliers(suppliers.filter((s) => s.id !== id));
      toast.success("Fournisseur supprimé");
    } catch (error) {
      console.error("Error deleting supplier:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      contactPerson: "",
      email: "",
      phoneNumber: "",
      address: "",
      categories: [],
      active: true,
    });
    setEditingSupplier(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestion des Fournisseurs</h1>
          <p className="text-slate-600">Gérez vos partenaires et fournisseurs</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Fournisseur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? "Modifier le fournisseur" : "Nouveau fournisseur"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={onFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Nom de l'entreprise *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Personne de contact *</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Téléphone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Adresse *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="categories">Catégories (séparées par des virgules)</Label>
                  <Input
                    id="categories"
                    value={formData.categories?.join(", ") ?? ""}
                    onChange={(e) => setFormData({ ...formData, categories: e.target.value.split(",").map(c => c.trim()).filter(Boolean) })}
                    placeholder="Ex: Alimentaire, Boissons"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700">
                  {editingSupplier ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </form>

            <AlertDialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmation</AlertDialogTitle>
                  <AlertDialogDescription>
                    {editingSupplier 
                      ? "Voulez-vous vraiment enregistrer les modifications pour ce fournisseur ?" 
                      : "Voulez-vous vraiment ajouter ce nouveau fournisseur ?"}
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
                <p className="text-sm text-slate-600 mb-1">Total Fournisseurs</p>
                <p className="text-2xl font-bold text-slate-900">{suppliers.length}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Fournisseurs Actifs</p>
                <p className="text-2xl font-bold text-slate-900">
                  {suppliers.filter((s) => s.active).length}
                </p>
              </div>
              <Users className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Fournisseurs Inactifs</p>
                <p className="text-2xl font-bold text-slate-900">
                  {suppliers.filter((s) => !s.active).length}
                </p>
              </div>
              <Users className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Grid */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher un fournisseur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSuppliers.slice(0, visibleCount).map((supplier) => (
              <Card key={supplier.id} className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {supplier.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{supplier.name}</h3>
                        <p className="text-sm text-slate-600">{supplier.contactPerson}</p>
                      </div>
                    </div>
                    <Badge className={supplier.active ? "bg-green-500" : "bg-orange-500"}>
                      {supplier.active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4" />
                      {supplier.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4" />
                      {supplier.phoneNumber}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      {supplier.address}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(supplier.categories ?? []).map((cat) => (
                      <Badge key={cat} variant="outline">
                        {cat}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEdit(supplier)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer le fournisseur "{supplier.name}" ? Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(supplier.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredSuppliers.length > 10 && (
            <div className="flex justify-center mt-6">
              {visibleCount < filteredSuppliers.length ? (
                <Button variant="outline" onClick={() => setVisibleCount(filteredSuppliers.length)}>
                  Voir plus ({filteredSuppliers.length - visibleCount} restants)
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
