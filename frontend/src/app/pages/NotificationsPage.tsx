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

const playBeep = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const playNote = (freq: number, start: number, duration: number, vol: number) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start(start);
      osc.stop(start + duration);
    };

    // Professional "Double Chime" (C6 then E6) - Maximum volume
    const now = audioContext.currentTime;
    playNote(1046.50, now, 0.8, 1.5);      // C6
    playNote(1318.51, now + 0.12, 0.6, 0.7); // E6

  } catch (e) {
    console.error("Audio API error:", e);
  }
};

interface Notification {
  id: string;
  senderName: string;
  senderRole: string;
  targetRole: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const ALL_ROLES = ["ADMIN", "MANAGER", "CAISSIER", "RH", "MAGASINIER"];

export default function NotificationsPage() {
  const { user } = useAuth();
  const [allMessages, setAllMessages] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevUnreadTotal = useRef<number>(0);

  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages(false); // Pass false to skip auto-selection during polling
    }, 5000);
    return () => clearInterval(interval);
  }, [user?.role]); // Re-run if user role changes

  useEffect(() => {
    scrollToBottom();
    if (selectedRole) {
      handleMarkAllAsRead(selectedRole);
    }
  }, [allMessages, selectedRole]);

  const handleMarkAllAsRead = async (role: string) => {
    if (!user?.role) return;

    // Check if there are actually unread messages from this role to us
    const hasUnread = allMessages.some(m => m.senderRole === role && m.targetRole === user.role && !m.read);
    if (!hasUnread) return;

    try {
      await notificationsApi.markAllRead(role, user.role);
      // Update local state immediately for better UX
      setAllMessages(prev => prev.map(m =>
        (m.senderRole === role && m.targetRole === user.role) ? { ...m, read: true } : m
      ));
    } catch (error) {
      console.error("Erreur marquage lu", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async (allowAutoSelect = true) => {
    if (!user?.role) return;
    try {
      const data = await notificationsApi.getByRole(user.role);

      // Sound logic: check for NEW unread messages sent to the user
      // We use a case-insensitive check and log the roles to be sure
      const currentUserRole = user.role.toUpperCase();
      const currentUnreadMessages = data.filter(m =>
        m.targetRole.toUpperCase() === currentUserRole && !m.read
      );
      const currentUnreadTotal = currentUnreadMessages.length;

      console.log(`[Sound Check] User: ${currentUserRole}, Unread: ${currentUnreadTotal}, Prev: ${prevUnreadTotal.current}, FirstLoad: ${isFirstLoad}`);

      if (currentUnreadTotal > prevUnreadTotal.current && !isFirstLoad) {
        const newMsgs = currentUnreadMessages.filter(m => !allMessages.some(prevM => prevM.id === m.id));
        if (newMsgs.length > 0) {
          console.log("!!! PLAYING BEEP !!! New messages:", newMsgs.map(m => m.message));
          playBeep();
        }
      }

      prevUnreadTotal.current = currentUnreadTotal;
      setAllMessages(data);

      // Auto-selection logic: only run if requested AND no role is currently selected in the UI state
      if (allowAutoSelect) {
        setSelectedRole(prev => {
          if (prev) return prev; // If a role is already selected, don't change it

          if (data.length > 0) {
            const firstMsg = data[0];
            return firstMsg.senderRole === user.role ? firstMsg.targetRole : firstMsg.senderRole;
          }
          return ALL_ROLES.find(r => r !== user.role) || null;
        });
      }
    } catch (error) {
      console.error("Erreur messages", error);
    } finally {
      setLoading(false);
      setIsFirstLoad(false);
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
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Échec de l'envoi");
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setAllMessages(allMessages.map(n => n.id === id ? { ...n, read: true } : n));
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
    return allMessages.filter(m => m.senderRole === role && m.targetRole === user?.role && !m.read).length;
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
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedRole === role
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
                          className={`p-3 rounded-2xl text-sm shadow-sm relative ${isMine
                            ? "bg-blue-600 text-white rounded-tr-none"
                            : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                            }`}
                        >
                          {msg.message}
                          <div className={`text-[9px] mt-1 opacity-70 flex items-center gap-1 ${isMine ? "justify-end" : "justify-start"}`}>
                            <Clock className="w-3 h-3" />
                            {formatDate(msg.createdAt)}
                            {!isMine && !msg.read && (
                              <button
                                onClick={() => markAsRead(msg.id)}
                                className="ml-2 hover:underline text-blue-500 font-bold"
                              >
                                Marquer lu
                              </button>
                            )}
                            {!isMine && msg.read && (
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
