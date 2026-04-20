import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Users, Check, X, Clock, Club, MessageSquare, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function MembershipRequestsPage() {
  const { user } = useAuth();
  const { membershipRequests, resolveMembershipRequest, clubs } = useData();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // Filter requests based on role
  const filteredRequests = membershipRequests.filter(req => {
    if (user?.role === 'super_admin') return true;
    if (user?.role === 'club_rep') {
      // Rep can only see requests for clubs they manage
      const managedClubs = clubs.filter(c => c.repIds.includes(user.id)).map(c => c.id);
      return managedClubs.includes(req.clubId);
    }
    return false;
  });

  const handleResolve = async (id: string, approve: boolean) => {
    setIsProcessing(id);
    try {
      const success = await resolveMembershipRequest(id, approve);
      if (success) {
        toast.success(approve ? 'Candidate Commissioned' : 'Request Decommissioned', {
          description: approve 
            ? 'The candidate has been integrated into the institutional roster.' 
            : 'The request has been removed from the queue.',
          icon: approve ? <Check className="text-emerald-500" size={16} /> : <X className="text-rose-500" size={16} />
        });
      }
    } catch (err) {
      toast.error('Adjudication Failure', { description: 'Failed to process the request.' });
    } finally {
      setIsProcessing(null);
    }
  };

  if (user?.role === 'student') {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
        <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center text-rose-500">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-2xl font-black tracking-tighter">Access Denied</h2>
        <p className="text-muted-foreground font-medium max-w-md">
          Your credentials do not have clearance for sectoral personnel management.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-lg shadow-indigo-500/5">
              <Users size={24} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Join <span className="text-indigo-500">Requests</span></h1>
          </div>
          <p className="text-muted-foreground font-medium max-w-2xl leading-relaxed text-lg">
            Review and adjudicate mission-critical personnel requests for your sectors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.map((request) => (
          <div 
            key={request.id}
            className="group p-6 rounded-[2rem] bg-card border border-border/50 hover:border-indigo-500/30 transition-all duration-500 shadow-sm"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile Shortcut */}
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-xl font-black text-muted-foreground shrink-0 shadow-inner uppercase">
                {(request.userName || 'U').charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-lg font-black tracking-tight">{request.userName || 'Anonymous Unit'}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-muted text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Candidate
                  </span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-xs font-bold">
                  <span className="flex items-center gap-1">
                    <Club size={12} className="text-indigo-500" />
                    {request.clubName || 'Unknown Sector'}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    Requested on {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Message */}
              {request.message && (
                <div className="hidden lg:flex items-start gap-3 bg-muted/40 p-4 rounded-2xl max-w-md border border-border/10">
                  <MessageSquare size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-2">
                    "{request.message}"
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleResolve(request.id, false)}
                  disabled={isProcessing === request.id}
                  className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-lg shadow-rose-500/5 group/btn"
                >
                  <X size={20} className="group-hover/btn:rotate-90 transition-transform" />
                </button>
                <button 
                  onClick={() => handleResolve(request.id, true)}
                  disabled={isProcessing === request.id}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-black hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  {isProcessing === request.id ? <Clock className="animate-spin" size={18} /> : <Check size={18} />}
                  <span>Approve</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="py-32 text-center rounded-[3rem] bg-muted/5 border-2 border-dashed border-border/20">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6 text-muted-foreground/30">
              <Users size={32} />
            </div>
            <p className="text-xl font-black text-muted-foreground/40 uppercase tracking-[0.2em]">All Systems Cleared</p>
            <p className="text-sm text-muted-foreground/40 font-bold mt-2">Zero pending requests in this sector</p>
          </div>
        )}
      </div>
    </div>
  );
}
