"use client";

import React, { useState } from "react";
import { 
  ArrowUpRight, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  UserCheck, 
  Search,
  DollarSign
} from "lucide-react";

// Mock User Database with starting balances
const INITIAL_USERS = [
  { id: "1", name: "Alex Johnson", email: "alex@example.com", phone: "555-0101", balance: 1450.00 },
  { id: "2", name: "Sarah Parker", email: "sarah@example.com", phone: "555-0102", balance: 820.50 },
  { id: "3", name: "Michael Scott", email: "michael@example.com", phone: "555-0103", balance: 310.00 },
];

interface Transaction {
  id: string;
  senderName: string;
  recipientName: string;
  amount: number;
  note: string;
  timestamp: string;
  senderId: string;
}

export default function ZelleDemo() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>("1");
  const [recipientContact, setRecipientContact] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message?: string }>({ type: "idle" });
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "tx-1",
      senderName: "Sarah Parker",
      recipientName: "Alex Johnson",
      amount: 150.00,
      note: "Dinner split",
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderId: "2",
    }
  ]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  const handleSendMoney = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "loading" });

    const sendAmount = parseFloat(amount);

    setTimeout(() => {
      // Validations
      if (isNaN(sendAmount) || sendAmount <= 0) {
        setStatus({ type: "error", message: "Please enter a valid amount." });
        return;
      }

      if (sendAmount > currentUser.balance) {
        setStatus({ type: "error", message: "Insufficient funds in your account." });
        return;
      }

      const targetContact = recipientContact.trim().toLowerCase();
      const recipient = users.find(
        (u) => u.email.toLowerCase() === targetContact || u.phone === targetContact
      );

      if (!recipient) {
        setStatus({ 
          type: "error", 
          message: "Recipient not found. Try sarah@example.com or 555-0103" 
        });
        return;
      }

      if (recipient.id === currentUser.id) {
        setStatus({ type: "error", message: "You cannot send money to yourself." });
        return;
      }

      // Execute Transfer in local state
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user.id === currentUser.id) {
            return { ...user, balance: user.balance - sendAmount };
          }
          if (user.id === recipient.id) {
            return { ...user, balance: user.balance + sendAmount };
          }
          return user;
        })
      );

      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        senderName: currentUser.name,
        recipientName: recipient.name,
        amount: sendAmount,
        note: note || "Transfer",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderId: currentUser.id,
      };

      setTransactions((prev) => [newTx, ...prev]);
      setStatus({ 
        type: "success", 
        message: `Successfully sent $${sendAmount.toFixed(2)} to ${recipient.name}!` 
      });

      // Reset form fields
      setAmount("");
      setRecipientContact("");
      setNote("");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans antialiased p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header & Sandbox Controller */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80 backdrop-blur">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center font-black text-black text-xl shadow-lg shadow-amber-400/20">
              ⚡
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-white">ZELLE <span className="text-amber-400">PAY</span></h1>
              <p className="text-xs text-zinc-500 font-mono">Interactive Demo</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs text-zinc-400 whitespace-nowrap">Switch User:</span>
            <select
              value={currentUserId}
              onChange={(e) => {
                setCurrentUserId(e.target.value);
                setStatus({ type: "idle" });
              }}
              className="bg-zinc-800 border border-zinc-700 text-xs font-medium text-amber-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-400 w-full sm:w-auto"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} (${u.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 p-6 rounded-3xl border border-zinc-800/80 shadow-2xl">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Available Balance</p>
          <div className="flex items-baseline space-x-1 mt-2">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              ${currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800/60 flex flex-wrap gap-4 text-xs text-zinc-400 font-mono">
            <span>Email: <strong className="text-zinc-200">{currentUser.email}</strong></span>
            <span>Phone: <strong className="text-zinc-200">{currentUser.phone}</strong></span>
          </div>
        </div>

        {/* Transfer Form Box */}
        <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-amber-400" />
              <span>Send Money</span>
            </h2>
            <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full font-medium">
              Instant
            </span>
          </div>

          {/* Feedback Alerts */}
          {status.type === "success" && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>{status.message}</span>
            </div>
          )}

          {status.type === "error" && (
            <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-300 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSendMoney} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-zinc-400 mb-2">
                Recipient Contact
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={recipientContact}
                  onChange={(e) => setRecipientContact(e.target.value)}
                  placeholder="e.g. sarah@example.com or 555-0102"
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-3.5 pl-10 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                />
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-4" />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-zinc-400 mb-2">
                Amount ($)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-3.5 pl-10 text-2xl font-black text-amber-400 focus:outline-none focus:border-amber-400 transition"
                />
                <DollarSign className="w-5 h-5 text-zinc-500 absolute left-3.5 top-4" />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-zinc-400 mb-2">
                Note (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's this transfer for?"
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={status.type === "loading"}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-extrabold py-3.5 rounded-xl transition duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-amber-400/10 active:scale-[0.99]"
            >
              {status.type === "loading" ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Transfer...</span>
                </>
              ) : (
                <>
                  <span>Send Money Now</span>
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Activity Log */}
        <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-3xl shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            <span>Recent Activity</span>
            <span className="text-xs font-normal text-zinc-500">Live Updates</span>
          </h3>

          <div className="divide-y divide-zinc-800/60">
            {transactions
              .filter((t) => t.senderName === currentUser.name || t.recipientName === currentUser.name)
              .length === 0 ? (
                <p className="text-xs text-zinc-500 py-4 text-center">No transactions recorded for this user yet.</p>
              ) : (
                transactions
                  .filter((t) => t.senderName === currentUser.name || t.recipientName === currentUser.name)
                  .map((t) => {
                    const isSender = t.senderName === currentUser.name;
                    return (
                      <div key={t.id} className="py-3.5 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-semibold text-zinc-200">
                            {isSender ? `To ${t.recipientName}` : `From ${t.senderName}`}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {t.note} • {t.timestamp}
                          </p>
                        </div>
                        <div className={`text-base font-bold ${isSender ? "text-red-400" : "text-emerald-400"}`}>
                          {isSender ? "-" : "+"}${t.amount.toFixed(2)}
                        </div>
                      </div>
                    );
                  })
              )}
          </div>
        </div>

      </div>
    </div>
  );
}
