import { useState, useEffect } from "react";
import axios from "axios";
import { UserCog, Pencil, Trash2, Check, X, ShieldAlert } from "lucide-react";

function getAdminHeaders() {
  const token = localStorage.getItem("adminToken");
  return { headers: { Authorization: `Bearer ${token}` } };
}

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: "", email: "" });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/users", getAdminHeaders());
        if (res.data.success) {
          const mappedUsers = res.data.data.map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            status: "Active",
            createdAt: u.createdAt,
            initials: u.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
          }));
          setUsers(mappedUsers);
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this user?")) {
      try {
        const res = await axios.delete(`http://localhost:5000/api/admin/users/${id}`, getAdminHeaders());
        if (res.data.success) {
          setUsers(users.filter(u => u.id !== id));
        }
      } catch (err) {
        alert("Failed to delete user");
      }
    }
  };

  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setEditFormData({ name: user.name, email: user.email });
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/admin/users/${id}`, editFormData, getAdminHeaders());
      if (res.data.success) {
        setUsers(users.map(u => u.id === id ? { ...u, name: res.data.data.name, email: res.data.data.email, initials: res.data.data.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() } : u));
        setEditingUserId(null);
      }
    } catch (err) {
      alert("Failed to update user");
    }
  };

  return (
    <div className="p-10 min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Header Area */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
            <UserCog size={28} className="text-emerald-500" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Base</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Review and manage platform access for all registered members.</p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-5 text-[10px] font-black tracking-widest text-slate-400 uppercase">User ID</th>
              <th className="px-6 py-5 text-[10px] font-black tracking-widest text-slate-400 uppercase">Member Profile</th>
              <th className="px-6 py-5 text-[10px] font-black tracking-widest text-slate-400 uppercase">Contact Email</th>
              <th className="px-6 py-5 text-[10px] font-black tracking-widest text-slate-400 uppercase text-center">Security Status</th>
              <th className="px-6 py-5 text-[10px] font-black tracking-widest text-slate-400 uppercase text-center">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-bold text-sm">
                  <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div> Fetching secure user data...</span>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-bold text-sm">
                  <span className="flex flex-col items-center gap-3"><ShieldAlert size={32} className="text-slate-300" /> No active users registered yet.</span>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-6 py-5 text-xs font-mono font-bold text-slate-400">
                    #{user.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 flex items-center justify-center text-sm font-black text-emerald-700 shadow-inner group-hover:scale-110 transition-transform">
                        {user.initials}
                      </div>
                      {editingUserId === user.id ? (
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="border-2 border-emerald-400 bg-white rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-100 transition-all w-48 shadow-sm"
                        />
                      ) : (
                        <span className="font-bold text-slate-900">{user.name}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-500">
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="border-2 border-emerald-400 bg-white rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-100 transition-all w-64 shadow-sm"
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase ${user.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {editingUserId === user.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleSaveEdit(user.id)} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 active:scale-95 transition-all shadow-md shadow-emerald-500/20" title="Save">
                          <Check size={16} strokeWidth={3} />
                        </button>
                        <button onClick={() => setEditingUserId(null)} className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 active:scale-95 transition-all shadow-sm" title="Cancel">
                          <X size={16} strokeWidth={3} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClick(user)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit User">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageUsers;