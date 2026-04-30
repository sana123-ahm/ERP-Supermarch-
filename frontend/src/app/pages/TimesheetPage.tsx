import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Search, Clock, LogIn, LogOut, Calendar, Loader2, Trash2 } from "lucide-react";
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
import { employeesApi, timesheetsApi } from "../../services/api";
import { useAuth } from "../context/AuthContext";

interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // yyyy-mm-dd
  checkIn: string | null; // HH:mm
  checkOut: string | null; // HH:mm
  duration: number | null; // hours
  status: "in_progress" | "completed";
}



export function TimesheetPage() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [confirmCheckInOpen, setConfirmCheckInOpen] = useState(false);
  const [confirmCheckOutOpen, setConfirmCheckOutOpen] = useState(false);
  const [selectedActionEmployee, setSelectedActionEmployee] = useState<{id: string, name: string} | null>(null);
  const [selectedActionTimesheet, setSelectedActionTimesheet] = useState<string | null>(null);
  const [visibleCountEmployees, setVisibleCountEmployees] = useState(9); // 9 because it's a grid of 3
  const [visibleCountEntries, setVisibleCountEntries] = useState(10);
  const { user } = useAuth();

  useEffect(() => {
    loadTimeEntries();
    loadEmployees();
  }, [selectedDate]);

  const loadEmployees = async () => {
    try {
      const data = await employeesApi.getAll();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  const loadTimeEntries = async () => {
    try {
      setLoading(true);
      const startDate = selectedDate;
      const endDate = selectedDate;

      const data = await timesheetsApi.getAllByDate(startDate, endDate);
      const flattened = (Array.isArray(data) ? data : []).map((t: any) => {
        const workDate = t.workDate; // yyyy-mm-dd
        const checkInTime = t.checkInTime ? String(t.checkInTime).slice(0, 5) : null;
        const checkOutTime = t.checkOutTime ? String(t.checkOutTime).slice(0, 5) : null;
        const backendStatus = String(t.status || "").toUpperCase();
        const status =
          backendStatus === "OPEN" && !checkOutTime ? "in_progress" : "completed";

        return {
          id: t.id,
          employeeId: t.employeeId,
          employeeName: t.employeeName,
          date: workDate,
          checkIn: checkInTime,
          checkOut: checkOutTime,
          duration: typeof t.hoursWorked === "number" ? t.hoursWorked : null,
          status,
        } satisfies TimeEntry;
      });

      setTimeEntries(flattened);
    } catch (error) {
      console.error("Error loading time entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = timeEntries.filter(
    (entry) =>
      entry.date === selectedDate &&
      (entry.employeeName ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const checkIn = async () => {
    if (!selectedActionEmployee) return;
    try {
      setLoading(true);
      await timesheetsApi.checkIn(selectedActionEmployee.id);
      toast.success(`${selectedActionEmployee.name} a pointé à l'entrée`);
      await loadTimeEntries();
    } catch (error) {
      console.error("Error check-in:", error);
      toast.error("Erreur lors du pointage entrée");
    } finally {
      setLoading(false);
      setConfirmCheckInOpen(false);
      setSelectedActionEmployee(null);
    }
  };

  const checkOut = async () => {
    if (!selectedActionTimesheet) return;
    try {
      setLoading(true);
      await timesheetsApi.checkOut(selectedActionTimesheet);
      toast.success("Pointage sortie enregistré");
      await loadTimeEntries();
    } catch (error) {
      console.error("Error check-out:", error);
      toast.error("Erreur lors du pointage sortie");
    } finally {
      setLoading(false);
      setConfirmCheckOutOpen(false);
      setSelectedActionTimesheet(null);
    }
  };

  const deleteTimesheet = async (id: string) => {
    try {
      await timesheetsApi.delete(id);
      toast.success("Pointage supprimé");
      await loadTimeEntries();
    } catch (error) {
      console.error("Error deleting timesheet:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const totalHours = filteredEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const activeEmployees = filteredEntries.filter((e) => e.status === "in_progress").length;

  const currentEmployee = employees.find((e: any) => e.email && user?.email && e.email === user.email);
  const currentEmployeeName =
    currentEmployee ? `${currentEmployee.firstName ?? ""} ${currentEmployee.lastName ?? ""}`.trim() : user?.name ?? "Moi";
  const myActiveEntry = filteredEntries.find(
    (e) => currentEmployee && e.employeeId === currentEmployee.id && e.status === "in_progress"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestion du Pointage</h1>
        <p className="text-slate-600">Suivez les heures de travail de vos employés</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Employés présents</p>
                <p className="text-2xl font-bold text-slate-900">{activeEmployees}</p>
              </div>
              <LogIn className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total heures</p>
                <p className="text-2xl font-bold text-slate-900">{totalHours.toFixed(1)}h</p>
              </div>
              <Clock className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Pointages du jour</p>
                <p className="text-2xl font-bold text-slate-900">{filteredEntries.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Moyenne heures/jour</p>
                <p className="text-2xl font-bold text-slate-900">
                  {filteredEntries.length > 0 ? (totalHours / filteredEntries.length).toFixed(1) : "0"}h
                </p>
              </div>
              <Clock className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Check-in for all employees */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle>Pointer un employé</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Rechercher un employé par nom..."
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {employees.length === 0 ? (
            <div className="text-slate-600 text-sm">Aucun employé trouvé.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {employees.filter((emp: any) => {
                const empName = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim();
                return empName.toLowerCase().includes(employeeSearch.toLowerCase());
              }).slice(0, visibleCountEmployees).map((emp: any) => {
                const empName = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim();
                const activeEntry = filteredEntries.find(
                  (e) => e.employeeId === emp.id && e.status === "in_progress"
                );
                const completedToday = filteredEntries.some(
                  (e) => e.employeeId === emp.id && e.status === "completed"
                );
                return (
                  <div
                    key={emp.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      activeEntry
                        ? "border-green-300 bg-green-50"
                        : completedToday
                        ? "border-slate-200 bg-slate-50"
                        : "border-slate-200"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{empName}</div>
                      <div className="text-xs text-slate-500">{emp.role ?? ""}</div>
                    </div>
                    {activeEntry ? (
                      <Button
                        size="sm"
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => {
                          setSelectedActionTimesheet(activeEntry.id);
                          setConfirmCheckOutOpen(true);
                        }}
                        disabled={loading}
                      >
                        <LogOut className="w-3 h-3 mr-1" />
                        Sortie
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-700 border-green-300 hover:bg-green-50"
                        onClick={() => {
                          setSelectedActionEmployee({id: emp.id, name: empName});
                          setConfirmCheckInOpen(true);
                        }}
                        disabled={loading}
                      >
                        <LogIn className="w-3 h-3 mr-1" />
                        Entrée
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {employees.filter((emp: any) => {
            const empName = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim();
            return empName.toLowerCase().includes(employeeSearch.toLowerCase());
          }).length > 9 && (
            <div className="flex justify-center mt-6">
              {visibleCountEmployees < employees.filter((emp: any) => {
                const empName = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim();
                return empName.toLowerCase().includes(employeeSearch.toLowerCase());
              }).length ? (
                <Button variant="outline" onClick={() => setVisibleCountEmployees(employees.length)}>
                  Voir plus
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setVisibleCountEmployees(9)}>
                  Voir moins
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timesheet Table */}
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
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-600" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
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
                  <TableHead>Date</TableHead>
                  <TableHead>Heure d'entrée</TableHead>
                  <TableHead>Heure de sortie</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      Aucun pointage pour cette date
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.slice(0, visibleCountEntries).map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-slate-50">
                      <TableCell className="font-semibold">{entry.employeeName}</TableCell>
                      <TableCell>{new Date(entry.date).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <LogIn className="w-4 h-4 text-green-600" />
                          <span className="font-mono">{entry.checkIn ?? "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.checkOut ? (
                          <div className="flex items-center gap-2">
                            <LogOut className="w-4 h-4 text-red-600" />
                            <span className="font-mono">{entry.checkOut}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.duration !== null && entry.duration !== undefined ? (
                          <span className="font-semibold">
                            {entry.duration < 1
                              ? `${Math.round(entry.duration * 60)} min`
                              : `${entry.duration.toFixed(1)}h`}
                          </span>
                        ) : entry.status === "in_progress" ? (
                          <span className="text-orange-500 animate-pulse">En cours...</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={entry.status === "in_progress" ? "bg-orange-500" : "bg-green-500"}>
                          {entry.status === "in_progress" ? "En cours" : "Terminé"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {entry.status === "in_progress" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedActionTimesheet(entry.id);
                                setConfirmCheckOutOpen(true);
                              }}
                            >
                              <LogOut className="w-4 h-4 mr-2" />
                              Sortie
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer le pointage</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Voulez-vous vraiment supprimer ce pointage de {entry.employeeName} ?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteTimesheet(entry.id)}
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
                  ))
                )}
              </TableBody>
            </Table>
            {filteredEntries.length > 10 && (
              <div className="flex justify-center p-4 bg-slate-50 border-t border-slate-200">
                {visibleCountEntries < filteredEntries.length ? (
                  <Button variant="outline" onClick={() => setVisibleCountEntries(filteredEntries.length)}>
                    Voir plus ({filteredEntries.length - visibleCountEntries} restants)
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setVisibleCountEntries(10)}>
                    Voir moins
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* CheckIn Confirm */}
      <AlertDialog open={confirmCheckInOpen} onOpenChange={setConfirmCheckInOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation de pointage</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment enregistrer l'entrée pour {selectedActionEmployee?.name} ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedActionEmployee(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={checkIn} className="bg-gradient-to-r from-blue-600 to-blue-700">
              Confirmer l'entrée
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CheckOut Confirm */}
      <AlertDialog open={confirmCheckOutOpen} onOpenChange={setConfirmCheckOutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation de sortie</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment enregistrer la sortie pour ce pointage ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedActionTimesheet(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={checkOut} className="bg-red-600 hover:bg-red-700">
              Confirmer la sortie
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
