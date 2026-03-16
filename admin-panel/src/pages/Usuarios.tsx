import React, { useEffect, useState } from 'react';
import { Users, Plus, RefreshCcw, Loader2, UserCheck, UserX } from 'lucide-react';
import apiClient from '../api/client';

export const Usuarios = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', fullname: '', password: '', roleId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      apiClient.get('/users'),
      apiClient.get('/users/roles'),
    ])
    .then(([usersRes, rolesRes]) => {
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    })
    .catch(() => {})
    .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiClient.post('/users', form);
      setShowForm(false);
      setForm({ email: '', fullname: '', password: '', roleId: '' });
      fetchAll();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al crear el usuario');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await apiClient.patch(`/users/${id}`, { status: newStatus });
    fetchAll();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Usuarios y Permisos</h1>
          <p className="text-slate-500 mt-1">Administra el acceso al panel de gestión</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={fetchAll} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
            <RefreshCcw size={20} />
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center space-x-2 px-4 py-2 bg-agua-deep text-white font-bold rounded-xl shadow-sm hover:scale-105 transition-all">
            <Plus size={18} /><span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4">Crear nuevo usuario</h3>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required value={form.fullname} onChange={e => setForm(f => ({ ...f, fullname: e.target.value }))} placeholder="Nombre completo" className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-agua-deep/20" />
            <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Correo electrónico" className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-agua-deep/20" />
            <input required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Contraseña" className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-agua-deep/20" />
            <select required value={form.roleId} onChange={e => setForm(f => ({ ...f, roleId: e.target.value }))} className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-agua-deep/20">
              <option value="">Seleccionar rol...</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <div className="md:col-span-2 flex justify-end space-x-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-500 font-bold hover:text-red-500">Cancelar</button>
              <button type="submit" disabled={saving} className="px-6 py-2 bg-agua-deep text-white font-bold rounded-xl disabled:opacity-60 flex items-center space-x-2">
                {saving ? <><Loader2 size={16} className="animate-spin" /><span>Guardando...</span></> : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="animate-spin text-agua-deep" size={32} /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider">Nombre</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider">Correo</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider">Rol</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{u.fullname}</td>
                  <td className="px-6 py-4 text-slate-600">{u.email}</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{u.role?.name}</span></td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {u.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleStatus(u.id, u.status)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-all" title={u.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}>
                      {u.status === 'ACTIVE' ? <UserX size={18} /> : <UserCheck size={18} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
