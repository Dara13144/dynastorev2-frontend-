import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  PlusCircle,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Check,
  X,
  Loader2,
  HardDrive,
  Upload,
  Image as ImageIcon,
  Link2,
  AlertTriangle,
} from 'lucide-react';
import API from '../../utils/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { TableSkeleton } from '../../components/SkeletonLoader.jsx';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGameFile, setUploadingGameFile] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    price: '',
    discount_price: '',
    category_id: '',
    platform: 'PC / Windows',
    version: 'v1.0.0',
    developer: '',
    publisher: 'DynaPublishing',
    cover_image: '',
    file_path: '',
    file_name: '',
    file_size: '',
    is_published: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        API.get('/admin/products'),
        API.get('/categories'),
      ]);

      if (prodRes.data.success) setProducts(prodRes.data.products || []);
      if (catRes.data.success) setCategories(catRes.data.categories || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      short_description: '',
      description: '',
      price: '',
      discount_price: '',
      category_id: categories[0]?.id || '',
      platform: 'PC / Windows',
      version: 'v1.0.0',
      developer: '',
      publisher: 'DynaPublishing',
      cover_image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
      file_path: 'games/new_game.zip',
      file_name: 'game_setup.zip',
      file_size: '2.5 GB',
      is_published: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      title: p.title || '',
      short_description: p.short_description || '',
      description: p.description || '',
      price: p.price || '',
      discount_price: p.discount_price || '',
      category_id: p.category_id || '',
      platform: p.platform || 'PC / Windows',
      version: p.version || 'v1.0.0',
      developer: p.developer || '',
      publisher: p.publisher || '',
      cover_image: p.cover_image || '',
      file_path: p.file_path || '',
      file_name: p.file_name || '',
      file_size: p.file_size || '',
      is_published: p.is_published ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingProduct) {
        await API.put(`/admin/products/${editingProduct.id}`, formData);
        toast.success('Product updated successfully');
      } else {
        await API.post('/admin/products', formData);
        toast.success('New game product added successfully');
      }
      setModalOpen(false);
      await fetchData();
    } catch (err) {
      toast.error(err.formattedMessage || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, JPEG, WEBP)');
      return;
    }

    try {
      setUploadingCover(true);
      const data = new FormData();
      data.append('file', file);
      data.append('bucket', 'product-images');

      const res = await API.post('/admin/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.publicUrl) {
        setFormData((prev) => ({ ...prev, cover_image: res.data.publicUrl }));
        toast.success('Cover image uploaded successfully!');
      } else {
        toast.error('Failed to retrieve uploaded image URL');
      }
    } catch (err) {
      toast.error(err.formattedMessage || 'Cover image upload failed');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGameFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingGameFile(true);
      const data = new FormData();
      data.append('file', file);
      data.append('bucket', 'game-files');

      const res = await API.post('/admin/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.filePath) {
        setFormData((prev) => ({
          ...prev,
          file_path: res.data.filePath,
          file_name: res.data.fileName || file.name,
          file_size: res.data.fileSize || `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        }));
        toast.success('Private game installer uploaded successfully!');
      }
    } catch (err) {
      toast.error(err.formattedMessage || 'File upload failed');
    } finally {
      setUploadingGameFile(false);
    }
  };

  const openDeleteModal = (p) => {
    setProductToDelete(p);
    setDeleteModalOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      const res = await API.delete(`/admin/products/${productToDelete.id}`);
      if (res.data.success) {
        toast.success(`Successfully deleted "${productToDelete.title}"`);
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        setDeleteModalOpen(false);
        setProductToDelete(null);
        await fetchData();
      }
    } catch (err) {
      toast.error(err.formattedMessage || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (p) => {
    try {
      await API.put(`/admin/products/${p.id}`, { is_published: !p.is_published });
      toast.info(`Updated status for "${p.title}"`);
      await fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.developer?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white font-display">Product Catalog Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Add, update, or remove digital game files and pricing
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold flex items-center gap-2 shadow-neon-cyan"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Game</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/5">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-background-card text-xs text-white rounded-xl pl-9 pr-4 py-2 border border-white/10 focus:outline-none focus:border-brand-cyan"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-400 font-medium">{filtered.length} Games</span>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="rounded-3xl glass-card border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/40 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="p-4">Game</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">File Path</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.cover_image}
                          alt={p.title}
                          className="w-12 h-9 rounded-lg object-cover bg-slate-900 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-white block text-sm">{p.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {p.version} • {p.platform}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 font-medium">
                      {p.category?.name || 'Uncategorized'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-white text-sm">
                          ${p.discount_price || p.price}
                        </span>
                        {p.discount_price && (
                          <span className="text-[10px] text-slate-500 line-through">
                            ${p.price}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-cyan-400">
                      {p.file_path || 'No file attached'}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleTogglePublish(p)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                          p.is_published
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-700/30 text-slate-400 border-slate-600'
                        }`}
                      >
                        {p.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {p.is_published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(p)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-white/10 transition-colors"
                          title="Delete Game"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl glass-panel border border-white/15 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-white font-display">
                {editingProduct ? 'Edit Game Product' : 'Add New Game Product'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Game Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. CyberPulse 2088"
                    className="w-full bg-background-card text-white rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-background-card text-white rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="29.99"
                    className="w-full bg-background-card text-white rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Discount Price (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discount_price}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                    placeholder="19.99"
                    className="w-full bg-background-card text-white rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Version</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="v1.0.0"
                    className="w-full bg-background-card text-white rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Short Description</label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="One sentence summary..."
                  className="w-full bg-background-card text-white rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed gameplay details, features, lore..."
                  className="w-full bg-background-card text-white rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan"
                />
              </div>

              {/* Cover Image Uploader & Preview */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold block">Cover Image</label>
                  <span className="text-[11px] text-slate-400">PNG, JPG, WEBP recommended</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Thumbnail Preview */}
                  <div className="sm:col-span-4 relative aspect-[16/10] rounded-xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center group">
                    {formData.cover_image ? (
                      <>
                        <img
                          src={formData.cover_image}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, cover_image: '' })}
                          className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-500">
                        <ImageIcon className="w-6 h-6" />
                        <span className="text-[10px]">No image set</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls & URL input */}
                  <div className="sm:col-span-8 space-y-2.5">
                    {/* File Upload Button */}
                    <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-brand-surface border border-brand-cyan/40 hover:border-brand-cyan hover:bg-brand-cyan/10 cursor-pointer text-brand-cyan font-bold transition-all text-xs">
                      {uploadingCover ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>{uploadingCover ? 'Uploading Image...' : 'Upload Image File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingCover}
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Direct URL Input */}
                    <div className="relative">
                      <input
                        type="url"
                        value={formData.cover_image}
                        onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                        placeholder="Or paste image URL (https://...)"
                        className="w-full bg-background-card text-white rounded-xl pl-8 pr-3 py-2 border border-white/10 focus:outline-none focus:border-brand-cyan text-xs"
                      />
                      <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Private Game Storage File & Download Source System */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <label className="text-slate-200 font-bold block text-xs">
                      Game File Download Source
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Upload to private storage or provide an external cloud download link
                    </span>
                  </div>

                  {/* Upload Trigger Button */}
                  <label className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-brand-surface border border-brand-cyan/40 hover:border-brand-cyan hover:bg-brand-cyan/10 cursor-pointer text-brand-cyan font-bold transition-all text-xs shrink-0 shadow-sm">
                    {uploadingGameFile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>{uploadingGameFile ? 'Uploading Game...' : 'Upload Game File (.zip, .exe)'}</span>
                    <input
                      type="file"
                      disabled={uploadingGameFile}
                      onChange={handleGameFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Storage Path / External Link Input */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold block text-[11px]">
                    Storage File Path (Private) or Direct Cloud URL
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.file_path}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => {
                          const isUrl = val.startsWith('http://') || val.startsWith('https://');
                          return {
                            ...prev,
                            file_path: val,
                            file_name: prev.file_name || (isUrl ? 'game_download_package' : val.split('/').pop() || 'game_setup.zip'),
                          };
                        });
                      }}
                      placeholder="e.g. games/cyberpulse_v1.zip or https://drive.google.com/... or https://mediafire.com/..."
                      className="w-full bg-background-card text-white rounded-xl pl-8 pr-3 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan font-mono text-xs"
                    />
                    <Link2 className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    💡 Tip: Enter internal Supabase path (e.g. <code className="text-cyan-400 font-mono">games/file.zip</code>) or direct cloud link (e.g. Google Drive, MediaFire, Mega, CDN).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">File Name & Size</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.file_name}
                      onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                      placeholder="game.zip"
                      className="w-2/3 bg-background-card text-white rounded-xl px-3 py-2.5 border border-white/10 font-mono"
                    />
                    <input
                      type="text"
                      value={formData.file_size}
                      onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                      placeholder="4.5 GB"
                      className="w-1/3 bg-background-card text-white rounded-xl px-3 py-2.5 border border-white/10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Developer / Publisher</label>
                  <input
                    type="text"
                    value={formData.developer}
                    onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                    placeholder="Studio Name"
                    className="w-full bg-background-card text-white rounded-xl px-3 py-2.5 border border-white/10"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl gradient-btn font-bold flex items-center gap-2 shadow-neon-cyan"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Game Confirmation Modal */}
      {deleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-rose-500/30 p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Warning Header */}
            <div className="flex items-center gap-3.5 text-rose-400 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display">Delete Game Product</h3>
                <span className="text-[11px] text-rose-400 font-semibold uppercase tracking-wider">
                  Irreversible Action
                </span>
              </div>
            </div>

            {/* Target Game Details Card */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-black/40 border border-white/10">
              <img
                src={productToDelete.cover_image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'}
                alt={productToDelete.title}
                className="w-14 h-14 rounded-xl object-cover bg-slate-900 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate font-display">
                  {productToDelete.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="font-semibold text-brand-cyan">${productToDelete.discount_price || productToDelete.price}</span>
                  <span>•</span>
                  <span className="truncate">{productToDelete.category?.name || 'Game'}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{productToDelete.title}"</strong>? This will permanently remove the title from the public storefront, search indexing, and category collections.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteProduct}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{deleting ? 'Deleting...' : 'Yes, Delete Game'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
