import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Package, Lock, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success("Bienvenue dans votre espace ERP");
        navigate("/");
      } else {
        toast.error("Identifiants invalides");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
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
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-2xl mb-6 group hover:rotate-6 transition-transform duration-300"
          >
            <Package className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 drop-shadow-md">
            ERP Market Pro
          </h1>
          <p className="text-blue-100/80 font-medium">Connectez-vous à la gestion intelligente</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-2xl border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-white text-center">Connexion</CardTitle>
            <CardDescription className="text-blue-100/70 text-center text-base">
              Accédez à votre console d'administration
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90 text-sm font-semibold ml-1">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300/70 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@supermarche.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:bg-black/40 focus:border-blue-400/50 transition-all h-12 rounded-xl border"
                    required
                  />
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-white/30 focus:bg-black/40 focus:border-blue-400/50 transition-all h-12 rounded-xl border"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-900/40 transition-all hover:scale-[1.01] active:scale-[0.99] border-none text-lg mt-4"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2 justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Vérification...</span>
                  </div>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-blue-100/60 text-sm">
                Vous n'avez pas de compte ?{" "}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                  S'inscrire
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-white/40 mt-10 font-medium tracking-wide">
          SÉCURISÉ PAR ERP MARKET PRO • 2026
        </p>
      </motion.div>
    </div>
  );
}
