import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  Ban,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Phone,
  Building2,
  Mail,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

const AdminUsers = () => {
  const { showSuccess, showError } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserForAction, setSelectedUserForAction] = useState(null);
  const [actionType, setActionType] = useState(''); // 'BLOCK' | 'UNBLOCK'
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      showError(err.message || 'Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleBlock = async () => {
    if (!selectedUserForAction) return;

    try {
      setActionLoading(true);
      if (actionType === 'BLOCK') {
        await adminApi.blockUser(selectedUserForAction.user_id);
        showSuccess(`User "${selectedUserForAction.name}" has been blocked.`);
      } else {
        await adminApi.unblockUser(selectedUserForAction.user_id);
        showSuccess(`User "${selectedUserForAction.name}" has been unblocked.`);
      }
      setSelectedUserForAction(null);
      fetchUsers();
    } catch (err) {
      showError(err.message || `Failed to ${actionType.toLowerCase()} user`);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.college_name?.toLowerCase().includes(query) ||
      u.college_id?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            User Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor registered students, listed book counts, and manage access permissions.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
          {users.length} Registered Accounts
        </span>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students by name, email, college, student ID..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12">
          <LoadingSpinner text="Fetching student users..." />
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">College & Contact</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Listings</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.user_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 overflow-hidden flex items-center justify-center shrink-0">
                          {u.profile_photo_url ? (
                            <ImageWithFallback
                              src={u.profile_photo_url}
                              alt={u.name}
                              aspectRatio="aspect-square"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-bold text-indigo-700 uppercase">
                              {u.name?.charAt(0) || 'U'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <p className="font-semibold text-slate-700">
                        {u.college_name || 'No college listed'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {u.phone ? `Phone: ${u.phone}` : u.college_id ? `ID: ${u.college_id}` : ''}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        {u.total_books || 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {u.is_blocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <Ban className="w-3 h-3" />
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {formatDate(u.created_at)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForAction(u);
                            setActionType(u.is_blocked ? 'UNBLOCK' : 'BLOCK');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            u.is_blocked
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          }`}
                        >
                          {u.is_blocked ? 'Unblock User' : 'Block User'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No users found</h3>
          <p className="text-xs text-slate-500">No accounts match your current search query.</p>
        </div>
      )}

      {/* Block / Unblock Modal */}
      <Modal
        isOpen={Boolean(selectedUserForAction)}
        onClose={() => setSelectedUserForAction(null)}
        title={actionType === 'BLOCK' ? 'Block User Account' : 'Unblock User Account'}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {actionType === 'BLOCK' ? (
              <>
                Are you sure you want to block <strong>"{selectedUserForAction?.name}"</strong> ({selectedUserForAction?.email})? They will immediately be prohibited from logging in and listing books.
              </>
            ) : (
              <>
                Are you sure you want to restore access for <strong>"{selectedUserForAction?.name}"</strong> ({selectedUserForAction?.email})?
              </>
            )}
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSelectedUserForAction(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleToggleBlock}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs ${
                actionType === 'BLOCK'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {actionLoading ? 'Processing...' : actionType === 'BLOCK' ? 'Yes, Block User' : 'Yes, Unblock User'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsers;
