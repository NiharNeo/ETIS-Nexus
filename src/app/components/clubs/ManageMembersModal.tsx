import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, Users, Trash2, Mail, ShieldCheck } from 'lucide-react';
import type { Club, ClubMember } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface ManageMembersModalProps {
  club: Club;
  open: boolean;
  onClose: () => void;
}

export function ManageMembersModal({ club, open, onClose }: ManageMembersModalProps) {
  const { user, token } = useAuth();
  const { getClubMembers, addClubMember, removeClubMember, getUsers } = useData();
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  const canManage = user?.role === 'super_admin' || (user?.role === 'club_rep' && user.clubIds?.includes(club.id));
  
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Member');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      
      // Fetch members
      getClubMembers(club.id).then(data => {
        setMembers(data);
      });

      // Fetch all users if admin
      if (user?.role === 'super_admin') {
        getUsers().then(data => {
          setAvailableUsers(data);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }
  }, [open, club.id, user?.role, getClubMembers, getUsers]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    setSubmitting(true);
    try {
      const result = await addClubMember(club.id, {
        name: newMemberName,
        email: newMemberEmail,
        role: newMemberRole,
        userId: selectedUserId || undefined
      });
      if (result) {
        setMembers([...members, result]);
        setNewMemberName('');
        setNewMemberEmail('');
        setNewMemberRole('Member');
        setSelectedUserId('');
      }
    } catch (error) {
      console.error('Failed to add member', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card w-full max-w-3xl rounded-[2rem] border border-border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 border-b border-border/50 flex items-center justify-between bg-sidebar/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Users size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  {canManage ? 'Manage Roster' : 'Club Directory'}
                </h2>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground text-sm font-medium">{club.name}</p>
                  {!canManage && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider">
                      <ShieldCheck size={10} /> Verified Protocol
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar bg-card">
            {/* Add Member Form */}
            {canManage && (
              <form onSubmit={handleAddMember} className="bg-sidebar p-6 rounded-[1.5rem] border border-border/50 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <UserPlus size={16} /> Add New Member
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={newMemberName}
                    onChange={e => setNewMemberName(e.target.value)}
                    className="md:col-span-2 px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                  />
                  <input
                    type="email"
                    placeholder="University Email"
                    required={newMemberRole === 'Club Representative'}
                    value={newMemberEmail}
                    onChange={e => setNewMemberEmail(e.target.value)}
                    className="px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                  />
                  <select
                    value={newMemberRole}
                    onChange={e => setNewMemberRole(e.target.value)}
                    className="px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                  >
                    <option value="Member">Member</option>
                    <option value="Core Group">Core Group</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Vice President">Vice President</option>
                    {user?.role === 'super_admin' && <option value="Club Representative">Club Representative</option>}
                  </select>
                </div>

                {user?.role === 'super_admin' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        Admin Discovery: Link University Account
                      </label>
                      <span className="text-[10px] font-medium text-primary/60 italic leading-none">Super Admin Privilege</span>
                    </div>
                    <select
                      value={selectedUserId}
                      onChange={e => {
                        setSelectedUserId(e.target.value);
                        const selected = availableUsers.find(u => u.id === e.target.value);
                        if (selected) {
                          setNewMemberName(selected.name);
                          setNewMemberEmail(selected.email);
                        }
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                    >
                      <option value="">-- No Account Linked --</option>
                      {availableUsers.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email}) - Current: {u.role}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2">
                  <p className="text-[10px] text-muted-foreground/40 font-medium italic">
                    {user?.role === 'super_admin' 
                      ? 'Linking an account will synchronize institutional credentials.' 
                      : 'Provide university email to bridge membership with user accounts.'}
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? 'Adding...' : 'Add Member'}
                  </button>
                </div>
              </form>
            )}

            {canManage && <div className="w-full h-px bg-border/50" />}

            {/* Institutional Roster */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-primary" />
                  Elite Sector Roster ({members.length})
                </h3>
                <div className="h-px flex-1 bg-border/20 mx-4" />
              </div>
              
              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-2xl border-2 border-primary border-t-transparent animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Synchronizing Roster...</p>
                </div>
              ) : members.length === 0 ? (
                <div className="py-24 text-center text-muted-foreground bg-sidebar/30 rounded-[2.5rem] border border-dashed border-border/20">
                  <Users size={40} className="mx-auto mb-4 opacity-10" />
                  <p className="font-bold text-sm italic">Negative results. Roster not yet initialized.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {members.sort((a, b) => {
                    const roles = { 'President': 0, 'Vice President': 1, 'Club Representative': 2, 'Treasurer': 3, 'Core Group': 4, 'Member': 5 };
                    // Use a generic fallback if the specific role isn't in our sorting map
                    const getRoleScore = (role: string) => {
                      for (const [key, val] of Object.entries(roles)) {
                        if (role.toLowerCase().includes(key.toLowerCase())) return val;
                      }
                      return 99;
                    };
                    return getRoleScore(a.role) - getRoleScore(b.role);
                  }).map(member => (
                    <motion.div 
                      key={member.id} 
                      layout
                      className="flex items-center justify-between p-5 rounded-[1.8rem] border border-border/40 bg-card hover:bg-sidebar/80 hover:border-primary/20 transition-all group relative overflow-hidden"
                    >
                      {/* Status Background Glow for Admins */}
                      {member.role === 'Club Representative' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                      )}

                      <div className="flex items-center gap-5 relative z-10">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-sidebar border border-border/40 text-primary flex items-center justify-center font-black text-xl shadow-inner">
                            {member.name.charAt(0)}
                          </div>
                          {member.userId && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-lg flex items-center justify-center text-white border-2 border-card">
                              <ShieldCheck size={10} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-black text-foreground tracking-tight text-base leading-none capitalize">
                              {member.name}
                            </p>
                            {member.userId === user?.id && (
                              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[8px] font-black uppercase tracking-tighter">You</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${getRoleBadgeClass(member.role)}`}>
                              {member.role}
                            </span>
                            {member.email && (
                              <span className="text-[10px] text-muted-foreground/50 font-bold flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
                                <Mail size={12} className="opacity-40" /> {member.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 relative z-10">
                        {canManage && (
                          <button 
                            disabled={member.userId === user?.id || members.find(m => m.id === member.id && m.name === 'Super Admin') !== undefined}
                            onClick={async () => {
                              if (!window.confirm(`Verify termination of ${member.name}'s institutional access?`)) return;
                              const success = await removeClubMember(club.id, member.id);
                              if (success) setMembers(members.filter(m => m.id !== member.id));
                            }}
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                              member.userId === user?.id 
                                ? 'hidden' 
                                : 'text-rose-500/30 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}

function getRoleBadgeClass(role: string) {
  const r = role.toLowerCase();
  if (r.includes('rep') || r.includes('president')) return 'bg-primary/5 border-primary/20 text-primary';
  if (r.includes('treasurer') || r.includes('group')) return 'bg-amber-500/5 border-amber-500/20 text-amber-500';
  return 'bg-muted border-border/50 text-muted-foreground/60';
}
