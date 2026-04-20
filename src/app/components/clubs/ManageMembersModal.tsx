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
                    placeholder="Email (Optional)"
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 pl-2">
                      Link to University Account (Required for Reps)
                    </label>
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
                
                <div className="flex justify-end pt-2">
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

            {/* Current Roster */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Current Roster ({members.length})</h3>
              
              {loading ? (
                <div className="py-12 flex justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : members.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground bg-sidebar/50 rounded-2xl border border-dashed border-border/50">
                  <p className="font-medium">No members added yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-background hover:bg-sidebar transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm">{member.name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                              {member.role}
                            </span>
                            {member.email && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail size={12} /> {member.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {canManage && (
                        <button 
                          onClick={async () => {
                            if (!window.confirm("Verify termination?")) return;
                            const success = await removeClubMember(club.id, member.id);
                            if (success) setMembers(members.filter(m => m.id !== member.id));
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
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
