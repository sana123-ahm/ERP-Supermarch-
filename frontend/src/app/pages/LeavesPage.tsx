import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Check, X, Calendar, Clock, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { leavesApi, employeesApi } from "../../services/api";

interface LeaveRequest {
  id: string;
  employeeName: string;
  type: "conge_paye" | "maladie" | "sans_solde" | "rtt";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestDate: string;
}





const leaveTypes = [
  { value: "conge_paye", label: "Congé payé" },
  { value: "maladie", label: "Arrêt maladie" },
  { value: "sans_solde", label: "Sans solde" },
  { value: "rtt", label: "RTT" },
];

export function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    type: "conge_paye" as LeaveRequest["type"],
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => {
    loadLeaves();
    loadEmployees();
  }, []);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const data = await leavesApi.getAll();
      const reverseTypeMap: Record<string, string> = {
        ANNUAL: "conge_paye",
        SICK: "maladie",
        UNPAID: "sans_solde",
        PERSONAL: "rtt",
      };

      const mapped = (Array.isArray(data) ? data : []).map((l: any) => ({
        id: l.id,
        employeeName: l.employeeName,
        type: reverseTypeMap[l.leaveType] || String(l.leaveType || "").toLowerCase(),
        startDate: l.startDate,
        endDate: l.endDate,
        days: l.numberOfDays ?? 0,
        reason: l.reason ?? "",
        status: String(l.status || "").toLowerCase(),
        requestDate: l.startDate,
      })) as LeaveRequest[];
      setLeaves(mapped);
    } catch (error) {
      console.error("Error loading leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await employeesApi.getAll();
      setEmployees(data);
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  const filteredLeaves = leaves.filter(
    (leave) =>
      (leave.employeeName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmSubmitOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      // backend expects LeaveDTO: leaveType enum (CONGE_PAYE, MALADIE, SANS_SOLDE, RTT) + dates
      const leaveTypeMap: Record<LeaveRequest["type"], string> = {
        conge_paye: "ANNUAL",
        maladie: "SICK",
        sans_solde: "UNPAID",
        rtt: "PERSONAL",
      };

      if (!formData.employeeId) {
        toast.error("Veuillez sélectionner un employé");
        return;
      }

      await leavesApi.createForEmployee(formData.employeeId, {
        leaveType: leaveTypeMap[formData.type],
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      });

      toast.success("Demande de congé créée");
      setDialogOpen(false);
      resetForm();
      await loadLeaves();
    } catch (error: any) {
      console.error("Error creating leave:", error);
      toast.error(error.message || "Erreur lors de la création de la demande");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: "",
      type: "conge_paye",
      startDate: "",
      endDate: "",
      reason: "",
    });
  };

  const approveLeave = async (id: string) => {
    try {
      await leavesApi.approve(id);
      toast.success("Demande de congé approuvée");
      await loadLeaves();
    } catch (error) {
      console.error("Error approving leave:", error);
      toast.error("Erreur lors de l'approbation");
    }
  };

  const rejectLeave = async (id: string) => {
    try {
      await leavesApi.reject(id, "Rejeté");
      toast.success("Demande de congé rejetée");
      await loadLeaves();
    } catch (error) {
      console.error("Error rejecting leave:", error);
      toast.error("Erreur lors du rejet");
    }
  };

  const deleteLeave = async (id: string) => {
    try {
      await leavesApi.delete(id);
      toast.success("Demande de congé supprimée");
      await loadLeaves();
    } catch (error) {
      console.error("Error deleting leave:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "En attente", color: "bg-orange-500" };
      case "approved":
        return { label: "Approuvée", color: "bg-green-500" };
      case "rejected":
        return { label: "Rejetée", color: "bg-red-500" };
      default:
        return { label: "Inconnu", color: "bg-slate-500" };
    }
  };

  const getTypeBadge = (type: string) => {
    const typeObj = leaveTypes.find((t) => t.value === type);
    return typeObj?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestion des Congés</h1>
          <p className="text-slate-600">Gérez les demandes de congés et absences</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Demande
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouvelle demande de congé</DialogTitle>
            </DialogHeader>
            <form onSubmit={onFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="employee">Employé *</Label>
                  <Select
                    value={formData.employeeId}
                    onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un employé..." />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="type">Type de congé *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startDate">Date de début *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">Date de fin *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>

                {formData.startDate && formData.endDate && (
                  <div className="col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Durée: <span className="font-bold">{calculateDays(formData.startDate, formData.endDate)} jours</span>
                    </p>
                  </div>
                )}

                <div className="col-span-2">
                  <Label htmlFor="reason">Motif *</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Raison de la demande..."
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-blue-600 to-blue-700"
                >
                  Créer la demande
                </Button>
              </div>
            </form>

            <AlertDialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Voulez-vous vraiment soumettre cette nouvelle demande de congé ?
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
                <p className="text-sm text-slate-600 mb-1">Total Demandes</p>
                <p className="text-2xl font-bold text-slate-900">{leaves.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">En attente</p>
                <p className="text-2xl font-bold text-slate-900">
                  {leaves.filter((l) => l.status === "pending").length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Approuvées</p>
                <p className="text-2xl font-bold text-slate-900">
                  {leaves.filter((l) => l.status === "approved").length}
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
                <p className="text-sm text-slate-600 mb-1">Rejetées</p>
                <p className="text-2xl font-bold text-slate-900">
                  {leaves.filter((l) => l.status === "rejected").length}
                </p>
              </div>
              <X className="w-10 h-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaves Table */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher une demande..."
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
                  <TableHead>Employé</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date début</TableHead>
                  <TableHead>Date fin</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaves.slice(0, visibleCount).map((leave) => {
                  const status = getStatusBadge(leave.status);
                  return (
                    <TableRow key={leave.id} className="hover:bg-slate-50">
                      <TableCell className="font-semibold">{leave.employeeName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getTypeBadge(leave.type)}</Badge>
                      </TableCell>
                      <TableCell>{new Date(leave.startDate).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>{new Date(leave.endDate).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell className="font-semibold">{leave.days} jour{leave.days > 1 ? "s" : ""}</TableCell>
                      <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
                      <TableCell>
                        <Badge className={`${status.color} text-white`}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {leave.status === "pending" && (
                            <>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                    <Check className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Approuver la demande</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Voulez-vous vraiment approuver la demande de congé de {leave.employeeName} ?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => approveLeave(leave.id)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Approuver
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="text-orange-600 hover:bg-orange-50">
                                    <X className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Rejeter la demande</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Voulez-vous vraiment rejeter la demande de congé de {leave.employeeName} ?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => rejectLeave(leave.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Rejeter
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer la demande</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Voulez-vous vraiment supprimer définitivement cette demande de l'historique ?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteLeave(leave.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredLeaves.length > 10 && (
              <div className="flex justify-center p-4 bg-slate-50 border-t border-slate-200">
                {visibleCount < filteredLeaves.length ? (
                  <Button variant="outline" onClick={() => setVisibleCount(filteredLeaves.length)}>
                    Voir plus ({filteredLeaves.length - visibleCount} restants)
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setVisibleCount(10)}>
                    Voir moins
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
