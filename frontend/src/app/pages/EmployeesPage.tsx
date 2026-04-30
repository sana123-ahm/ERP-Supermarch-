import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Edit, Trash2, Users, Mail, Phone, Calendar, Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
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
import type { UserRole } from "../context/AuthContext";
import { employeesApi } from "../../services/api";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  contractType: string;
  salary: number;
  hireDate: string;
  active: boolean;
}



export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [formData, setFormData] = useState<Partial<Employee> & { password?: string }>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "CAISSIER",
    contractType: "CDI",
    salary: 0,
    hireDate: "",
    active: true,
    password: "",
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeesApi.getAll();
      setEmployees((data || []).map((employee: any) => ({
        ...employee,
        contractType: employee.contractType ?? "CDI",
      })));
    } catch (error) {
      console.error("Error loading employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(
    (employee) =>
        (employee.firstName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.lastName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.email ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.role ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmSubmitOpen(true);
  };

  const handleSubmit = async () => {

    try {
      if (editingEmployee) {
        const updatedEmployee = await employeesApi.update(editingEmployee.id, formData);
        setEmployees(
          employees.map((emp) =>
            emp.id === editingEmployee.id ? updatedEmployee : emp
          )
        );
        toast.success("Employé et accès modifiés avec succès");
      } else {
        const newEmployee = await employeesApi.create(formData);
        setEmployees([...employees, newEmployee]);
        toast.success("Employé et accès créés avec succès");
      }

      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error saving employee:", error);
      toast.error(error.message || "Erreur lors de l'enregistrement de l'employé");
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData(employee);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await employeesApi.delete(id);
      setEmployees(employees.filter((emp) => emp.id !== id));
      toast.success("Employé supprimé");
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      role: "CAISSIER",
      contractType: "CDI",
      salary: 0,
      hireDate: "",
      active: true,
      password: "",
    });
    setEditingEmployee(null);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      ADMIN: "bg-purple-500",
      MANAGER: "bg-blue-500",
      CAISSIER: "bg-green-500",
      MAGASINIER: "bg-orange-500",
      RH: "bg-pink-500",
    };
    return colors[role] || "bg-slate-500";
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestion des Employés</h1>
          <p className="text-slate-600">Gérez votre équipe et les informations RH</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Employé
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEmployee ? "Modifier l'employé" : "Nouvel employé"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={onFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Téléphone *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Rôle *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrateur</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="CAISSIER">Caissier</SelectItem>
                      <SelectItem value="MAGASINIER">Magasinier</SelectItem>
                      <SelectItem value="RH">Ressources Humaines</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="password">{editingEmployee ? "Changer le mot de passe (optionnel)" : "Mot de passe *"}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={editingEmployee ? "Laisser vide pour conserver" : "Saisissez un mot de passe"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingEmployee}
                  />
                </div>
                <div>
                  <Label htmlFor="contractType">Type de contrat *</Label>
                  <Select
                    value={formData.contractType}
                    onValueChange={(value: any) => setFormData({ ...formData, contractType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="CDD">CDD</SelectItem>
                      <SelectItem value="Stage">Stage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="salary">Salaire mensuel (DH) *</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hireDate">Date d'embauche *</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700">
                  {editingEmployee ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </form>

            <AlertDialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmation</AlertDialogTitle>
                  <AlertDialogDescription>
                    {editingEmployee 
                      ? "Voulez-vous vraiment enregistrer les modifications pour cet employé ?" 
                      : "Voulez-vous vraiment ajouter ce nouvel employé ?"}
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
                <p className="text-sm text-slate-600 mb-1">Total Employés</p>
                <p className="text-2xl font-bold text-slate-900">{employees.length}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Employés Actifs</p>
                <p className="text-2xl font-bold text-slate-900">
                  {employees.filter((e) => e.active).length}
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
                <p className="text-sm text-slate-600 mb-1">Contrats CDI</p>
                <p className="text-2xl font-bold text-slate-900">
                  {employees.filter((e) => e.contractType === "CDI").length}
                </p>
              </div>
              <Briefcase className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Masse Salariale</p>
                <p className="text-2xl font-bold text-slate-900">
                  {employees.reduce((sum, e) => sum + Number(e.salary || 0), 0).toLocaleString()} DH
                </p>
              </div>
              <Briefcase className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employees Grid */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher un employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredEmployees.slice(0, visibleCount).map((employee) => (
              <Card key={employee.id} className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="w-14 h-14 border-2 border-slate-200">
                      <AvatarFallback className={`${getRoleBadgeColor(employee.role)} text-white font-bold`}>
                        {getInitials(employee.firstName, employee.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge className={`${getRoleBadgeColor(employee.role)} text-white text-xs`}>
                          {employee.role}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {employee.contractType}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4" />
                      {employee.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4" />
                      {employee.phoneNumber}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      Embauché le {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString("fr-FR") : "N/A"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Briefcase className="w-4 h-4" />
                      {(employee.salary || 0).toLocaleString()} DH / mois
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEdit(employee)}
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
                          <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action ne peut pas être annulée. Cela marquera l'employé {employee.firstName} {employee.lastName} comme inactif dans le système.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(employee.id)}
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
          )}
          
          {filteredEmployees.length > 10 && (
            <div className="flex justify-center mt-6">
              {visibleCount < filteredEmployees.length ? (
                <Button variant="outline" onClick={() => setVisibleCount(filteredEmployees.length)}>
                  Voir plus ({filteredEmployees.length - visibleCount} restants)
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
