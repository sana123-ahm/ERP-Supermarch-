import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Send, 
  User, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  Search,
  MoreVertical,
  Inbox
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { toast } from "sonner";
import { notificationsApi } from "../../services/api";

interface Notification {
  id: string;
  senderName: string;
  senderRole: string;
  targetRole: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

const ALL_ROLES = ["ADMIN", "MANAGER", "CAISSIER", "RH", "MAGASINIER"];

export default function NotificationsPage() {
  const { user } = useAuth();
  const [allMessages, setAllMessages] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s for better "chat" feel
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
    if (selectedRole) {
      handleMarkAllAsRead(selectedRole);
    }
  }, [allMessages, selectedRole]);

  const handleMarkAllAsRead = async (role: string) => {
    if (!user?.role) return;
    try {
      await notificationsApi.markAllRead(role, user.role);
    } catch (error) {
      console.error("Erreur marquage lu", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!user?.role) return;
    try {
      const data = await notificationsApi.getByRole(user.role);
      setAllMessages(data);
      // Select first available role if none selected
      if (!selectedRole && data.length > 0) {
        const otherRole = data[0].senderRole === user.role ? data[0].targetRole : data[0].senderRole;
        setSelectedRole(otherRole);
      } else if (!selectedRole) {
        setSelectedRole(ALL_ROLES.find(r => r !== user.role) || null);
      }
    } catch (error) {
      console.error("Erreur messages", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.name || !selectedRole) return;

    try {
      await notificationsApi.send({
        senderName: user.name,
        senderRole: user.role,
        targetRole: selectedRole,
        message: newMessage,
      });
      setNewMessage("");
      fetchMessages();
    } catch (error) {
      toast.error("Échec de l'envoi");
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setAllMessages(allMessages.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  // Filter messages for the current conversation
  const chatMessages = allMessages.filter(m => 
    (m.senderRole === user?.role && m.targetRole === selectedRole) ||
    (m.senderRole === selectedRole && m.targetRole === user?.role)
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const getUnreadCount = (role: string) => {
    return allMessages.filter(m => m.senderRole === role && m.targetRole === user?.role && !m.isRead).length;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 overflow-hidden">
      {/* Sidebar - Service List */}
      <Card className="w-80 flex flex-col shadow-lg border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-4">
            <Inbox className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-slate-800">Boîte de réception</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Rechercher un service..." className="pl-9 bg-white" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {ALL_ROLES.filter(r => r !== user?.role).map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                selectedRole === role 
                  ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100" 
                  : "hover:bg-slate-50 text-slate-600 border border-transparent"
              }`}
            >
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                <AvatarFallback className={selectedRole === role ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}>
                  {role.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left overflow-hidden">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-sm truncate">{role}</p>
                  {getUnreadCount(role) > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {getUnreadCount(role)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate">Cliquez pour voir les échanges</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col shadow-lg border-slate-200 overflow-hidden bg-white">
        {selectedRole ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-blue-100">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold">
                    {selectedRole.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-slate-900">Service {selectedRole}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-xs text-slate-500">Canal de communication actif</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm"><MoreVertical className="w-5 h-5 text-slate-400" /></Button>
            </div>

            {/* Messages Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-10 h-10" />
                  </div>
                  <p>Aucun message avec ce service. Commencez la discussion !</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMine = msg.senderRole === user?.role;
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] group ${isMine ? "items-end" : "items-start"}`}>
                        {!isMine && (
                          <p className="text-[10px] font-bold text-slate-400 mb-1 ml-1 flex items-center gap-1">
                            <User className="w-3 h-3" /> {msg.senderName}
                          </p>
                        )}
                        <div 
                          className={`p-3 rounded-2xl text-sm shadow-sm relative ${
                            isMine 
                              ? "bg-blue-600 text-white rounded-tr-none" 
                              : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                          }`}
                        >
                          {msg.message}
                          <div className={`text-[9px] mt-1 opacity-70 flex items-center gap-1 ${isMine ? "justify-end" : "justify-start"}`}>
                            <Clock className="w-3 h-3" />
                            {formatDate(msg.createdAt)}
                            {!isMine && !msg.isRead && (
                              <button 
                                onClick={() => markAsRead(msg.id)}
                                className="ml-2 hover:underline text-blue-500 font-bold"
                              >
                                Marquer lu
                              </button>
                            )}
                            {!isMine && msg.isRead && (
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input 
                  placeholder={`Répondre au service ${selectedRole}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-slate-50 border-transparent focus:bg-white focus:border-blue-200 transition-all rounded-full px-6"
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-lg shadow-blue-200"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Inbox className="w-16 h-16 mb-4 opacity-20" />
            <p>Sélectionnez un service pour voir les échanges</p>
          </div>
        )}
      </Card>
    </div>
  );
}
