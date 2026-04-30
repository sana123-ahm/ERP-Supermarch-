import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { authApi } from "../../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Package, Lock, Mail, User, Phone, Loader2, ArrowLeft, Shield } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "CAISSIER",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authApi.register(formData);
      toast.success("Compte créé avec succès. Veuillez vous connecter.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création du compte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-900">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 scale-105"
        style={{
          backgroundImage: `url('/login-bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.4) blur(4px)'
        }}
      />

      {/* Decorative Light Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10 my-8"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-2xl mb-4 group hover:rotate-6 transition-transform duration-300"
          >
            <Package className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2 drop-shadow-md">
            Créer un compte
          </h1>
          <p className="text-blue-100/80 font-medium">Rejoignez ERP Market Pro</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-2xl border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
          <CardHeader className="space-y-1 relative">
            <Link to="/login" className="absolute top-6 left-6 text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <CardTitle className="text-2xl font-bold text-white text-center">Inscription</CardTitle>
            <CardDescription className="text-blue-100/70 text-center text-sm">
              Renseignez vos informations
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/90 text-sm font-semibold ml-1">Nom complet</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/70 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jean Dupont"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:bg-black/40 focus:border-blue-400/50 transition-all h-11 rounded-xl border"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90 text-sm font-semibold ml-1">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/70 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@supermarche.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:bg-black/40 focus:border-blue-400/50 transition-all h-11 rounded-xl border"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-white/90 text-sm font-semibold ml-1">Téléphone</Label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/70 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:bg-black/40 focus:border-blue-400/50 transition-all h-11 rounded-xl border"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-white/90 text-sm font-semibold ml-1">Rôle</Label>
                <div className="relative group">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/70 group-focus-within:text-blue-400 transition-colors" />
                  <select
                    id="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 bg-black/20 border-white/10 text-white focus:bg-black/40 focus:border-blue-400/50 transition-all h-11 rounded-xl border appearance-none outline-none cursor-pointer"
                    required
                  >
                    <option value="CAISSIER" className="bg-slate-800 text-white">Caissier</option>
                    <option value="MAGASINIER" className="bg-slate-800 text-white">Magasinier</option>
                    <option value="MANAGER" className="bg-slate-800 text-white">Manager</option>
                    <option value="RH" className="bg-slate-800 text-white">Ressources Humaines</option>
                    <option value="ADMIN" className="bg-slate-800 text-white">Administrateur</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" title="Mot de passe" className="text-white/90 text-sm font-semibold ml-1">Mot de passe</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/70 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:bg-black/40 focus:border-blue-400/50 transition-all h-11 rounded-xl border"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-900/40 transition-all hover:scale-[1.01] active:scale-[0.99] border-none text-lg mt-2"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2 justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Création...</span>
                  </div>
                ) : (
                  "S'inscrire"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
