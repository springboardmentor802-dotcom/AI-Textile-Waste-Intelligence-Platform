import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Trash2, 
  Edit3, 
  Calendar, 
  Building, 
  Sparkles, 
  Scale, 
  Tag, 
  FileText,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Upload
} from 'lucide-react';
import AnalysisCard from '../components/AnalysisCard';

const InventoryDetail = () => {
  const { batch_id } = useParams();
  const { apiRequest, token, API_URL, user, addNotification } = useAuth();
  const navigate = useNavigate();

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  
  // Delete confirm modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchBatchDetails = async () => {
    try {
      const res = await apiRequest(`/api/inventory/${batch_id}`);
      if (res.ok) {
        const data = await res.json();
        setBatch(data);
      } else {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to load batch details');
      }
    } catch (err) {
      setError(err.message || 'Error loading details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchDetails();
  }, [batch_id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await apiRequest(`/api/inventory/${batch_id}`, { method: 'DELETE' });
      if (res.ok) {
        addNotification(`Batch ${batch_id} has been permanently deleted.`, 'success');
        navigate('/inventory');
      } else {
        const errData = await res.json();
        throw new Error(errData.detail || 'Could not delete batch');
      }
    } catch (err) {
      addNotification(err.message || 'Deletion failed', 'error');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleImageUploadForDetail = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/api/analysis/upload/${batch_id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        addNotification('AI Image analysis and classification saved!', 'success');
        fetchBatchDetails();
      } else {
        throw new Error(data.detail || 'AI scanning failed.');
      }
    } catch (err) {
      addNotification(err.message || 'Error uploading image', 'error');
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-forest-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="space-y-4">
        <Link to="/inventory" className="inline-flex items-center space-x-1 text-slate-500 hover:text-slate-800 text-sm font-semibold">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Inventory</span>
        </Link>
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-center">
          <h3 className="font-bold text-lg mb-2">Error Loading Detail</h3>
          <p className="text-sm">{error || 'Waste batch record could not be retrieved.'}</p>
        </div>
      </div>
    );
  }

  // Check if current user is allowed to delete (Only Admin or Manufacturer owner if status is Pending)
  const canDelete = 
    user.role === 'Administrator' || 
    (user.role === 'Textile Manufacturer' && batch.created_by_id === user.id && batch.status === 'Pending');

  // Check if current user is allowed to edit (Recyclers can edit status, Admins can edit everything, Manufacturers edit details if Pending)
  const canEdit = user.role !== 'Sustainability Manager';

  // Environmental impact values based on database and actual fabric type if analyzed
  const getEnvironmentalMetrics = () => {
    let mult_co2 = 2.0;
    let mult_water = 1000;
    
    const fab = batch.fabric_type.lowerCase ? batch.fabric_type.toLowerCase() : batch.fabric_type.toLowerCase();
    if (fab.includes('cotton')) {
      mult_co2 = 2.5;
      mult_water = 2000;
    } else if (fab.includes('denim')) {
      mult_co2 = 3.0;
      mult_water = 2500;
    } else if (fab.includes('wool')) {
      mult_co2 = 4.0;
      mult_water = 1500;
    } else if (fab.includes('polyester')) {
      mult_co2 = 1.5;
      mult_water = 500;
    }
    
    return {
      co2: batch.quantity * mult_co2,
      water: batch.quantity * mult_water
    };
  };

  const metrics = getEnvironmentalMetrics();

  return (
    <div className="space-y-6">
      
      {/* Back button & Action toolbar */}
      <div className="flex items-center justify-between">
        <Link to="/inventory" className="inline-flex items-center space-x-1.5 text-slate-500 hover:text-slate-800 text-sm font-bold transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to List</span>
        </Link>

        <div className="flex items-center space-x-2">
          {canEdit && (
            <Link 
              to={`/inventory/${batch.batch_id}/edit`}
              className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all"
            >
              <Edit3 className="h-4 w-4 text-slate-400" />
              <span>Edit Batch</span>
            </Link>
          )}

          {canDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-2 rounded-xl transition-all"
            >
              <Trash2 className="h-4 w-4 text-rose-500" />
              <span>Delete Batch</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid detail view */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Side: General Info Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-8">
            {/* Header info */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Waste Batch Profile</span>
                <h2 className="text-2xl font-extrabold text-slate-800 mt-1">{batch.batch_id}</h2>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full border ${
                  batch.status === 'Pending' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                  batch.status === 'Sorting' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  batch.status === 'Processing' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                  batch.status === 'Recycled' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {batch.status}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Pipeline status</span>
              </div>
            </div>

            {/* Spec grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Tag className="h-3.5 w-3.5" />
                  <span>Fabric Type</span>
                </span>
                <p className="text-sm font-bold text-slate-700">{batch.fabric_type}</p>
              </div>

              <div className="space-y-1">
                <span className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Scale className="h-3.5 w-3.5" />
                  <span>Quantity</span>
                </span>
                <p className="text-sm font-bold text-slate-700">{batch.quantity} {batch.unit}</p>
              </div>

              <div className="space-y-1">
                <span className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="h-3.5 w-3.5 rounded-full border border-slate-300" style={{backgroundColor: batch.color.toLowerCase()}}></span>
                  <span>Color</span>
                </span>
                <p className="text-sm font-bold text-slate-700">{batch.color}</p>
              </div>

              <div className="space-y-1">
                <span className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Building className="h-3.5 w-3.5" />
                  <span>Source / Facility</span>
                </span>
                <p className="text-sm font-bold text-slate-700 truncate">{batch.source}</p>
              </div>

              <div className="space-y-1">
                <span className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Collection Date</span>
                </span>
                <p className="text-sm font-bold text-slate-700">
                  {new Date(batch.collection_date).toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})}
                </p>
              </div>

              <div className="space-y-1">
                <span className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    batch.condition === 'Clean' ? 'bg-emerald-500' :
                    batch.condition === 'Damaged' ? 'bg-amber-500' :
                    'bg-rose-500'
                  }`}></span>
                  <span>Condition</span>
                </span>
                <p className="text-sm font-bold text-slate-700">{batch.condition}</p>
              </div>
            </div>

            {/* Notes Section */}
            <div className="border-t border-slate-100 pt-6 space-y-2">
              <span className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <FileText className="h-3.5 w-3.5" />
                <span>Notes & Descriptions</span>
              </span>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium whitespace-pre-line">
                {batch.notes || "No extra descriptions or logistics notes provided for this textile waste batch."}
              </p>
            </div>

            {/* Timestamp Meta */}
            <div className="border-t border-slate-100 pt-4 flex flex-wrap gap-4 text-[10px] text-slate-400 font-semibold justify-between">
              <span>System ID: #{batch.id}</span>
              <span>Registered at: {new Date(batch.created_at).toLocaleString()}</span>
              <span>Last updated: {new Date(batch.updated_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Environmental Impact & AI Scan Trigger */}
        <div className="space-y-6">
          
          {/* Circular impact statistics */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Environmental Offset</h3>
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">CO₂ Diverted</span>
                <span className="text-sm font-extrabold text-emerald-800">-{metrics.co2.toFixed(1)} kg</span>
              </div>
              <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Water Preserved</span>
                <span className="text-sm font-extrabold text-blue-800">-{metrics.water.toLocaleString()} Liters</span>
              </div>
            </div>
          </div>

          {/* AI Scan Action (If not analyzed) */}
          {!batch.image_analysis && (
            <div className="bg-gradient-to-br from-forest-900 to-forest-950 p-6 rounded-3xl text-white shadow-md space-y-4">
              <div className="flex items-center space-x-1.5 text-earth-300">
                <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                <span className="text-[10px] font-bold tracking-wider uppercase">AI Analysis Center</span>
              </div>
              <p className="text-xs text-slate-300">Run a computer vision scan to predict material purity composition, detect contaminants, and verify the batch condition.</p>
              
              <label className="border border-dashed border-forest-700 hover:border-forest-400 bg-forest-950/60 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-xs font-bold text-slate-200 select-none group">
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUploadForDetail} disabled={scanning} />
                <Upload className="w-5 h-5 mb-1.5 text-forest-400 group-hover:text-forest-300" />
                <span>{scanning ? "AI Scanning Image..." : "Upload and Scan Textile"}</span>
              </label>
            </div>
          )}

          {batch.image_analysis && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scan Health</span>
                <span className="text-[10px] bg-forest-100 text-forest-800 px-2 py-0.5 rounded-full font-bold">Active</span>
              </div>
              <div className="text-xs text-slate-500 space-y-2 leading-relaxed">
                <p>• <strong>Circularity Index</strong>: {batch.image_analysis.circularity_score}%</p>
                <p>• <strong>Fiber Composition</strong>: {batch.image_analysis.fiber_composition}</p>
                <p>• <strong>Category Group</strong>: {batch.image_analysis.predicted_waste_category}</p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Complete AI Assessment Card below main grid */}
      {batch.image_analysis && (
        <div className="space-y-4 mt-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Classification Assessment</h3>
          <AnalysisCard analysis={batch.image_analysis} />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-6 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-2">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Confirm Deletion</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete batch <span className="font-extrabold text-slate-800">{batch.batch_id}</span>? This action is permanent and cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center"
              >
                {deleting ? "Deleting..." : "Delete Batch"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InventoryDetail;
