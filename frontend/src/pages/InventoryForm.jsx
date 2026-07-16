import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Loader2, Calendar, Scale, Tag, Upload, Sparkles } from 'lucide-react';
import AnalysisCard from '../components/AnalysisCard';

const InventoryForm = () => {
  const { batch_id } = useParams(); // present if editing
  const isEdit = !!batch_id;
  
  const { apiRequest, token, API_URL, user, addNotification } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // AI Scanning state
  const [scanning, setScanning] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Form fields state
  const [fabricType, setFabricType] = useState('Cotton');
  const [source, setSource] = useState(user?.organization || '');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [color, setColor] = useState('');
  const [condition, setCondition] = useState('Clean');
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Pending');
  const [notes, setNotes] = useState('');

  const fabrics = ["Cotton", "Polyester", "Wool", "Silk", "Linen", "Denim", "Nylon", "Rayon", "Acrylic", "Mixed Fabrics"];
  const conditions = ["Clean", "Damaged", "Contaminated", "Wet"];
  const units = ["kg", "lbs", "tons"];
  const statuses = ["Pending", "Sorting", "Processing", "Recycled", "Disposed"];

  // Determine if core fields are editable based on user role and batch status
  const isOperator = user?.role === 'Recycling Facility Operator';
  const isManufacturer = user?.role === 'Textile Manufacturer';
  
  // Can modify core fields (e.g. quantity, fabric type)
  const canEditCoreFields = !isOperator && (!isEdit || status === 'Pending' || status === 'Sorting' || user?.role === 'Administrator');
  
  // Can modify status
  const canEditStatus = isOperator || user?.role === 'Administrator' || (isManufacturer && !isEdit);

  useEffect(() => {
    if (isEdit) {
      const fetchBatch = async () => {
        try {
          const res = await apiRequest(`/api/inventory/${batch_id}`);
          if (res.ok) {
            const data = await res.json();
            setFabricType(data.fabric_type);
            setSource(data.source);
            setQuantity(data.quantity.toString());
            setUnit(data.unit);
            setColor(data.color);
            setCondition(data.condition);
            setCollectionDate(data.collection_date);
            setStatus(data.status);
            setNotes(data.notes || '');
            if (data.image_analysis) {
              setAiAnalysis(data.image_analysis);
            }
          } else {
            throw new Error('Failed to load batch data');
          }
        } catch (err) {
          setError(err.message || 'Error occurred');
        } finally {
          setLoading(false);
        }
      };
      fetchBatch();
    }
  }, [batch_id, isEdit]);

  // Handle Image Upload & AI Scan
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/api/analysis/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setAiAnalysis(data);
        
        // Auto-fill fields
        setFabricType(data.predicted_fabric_type);
        setColor(data.fabric_color);
        setCondition(data.condition_suggestion || 'Clean');
        
        // Append AI details to notes
        const aiNotes = `[AI Auto-Scan Result]:\n- Fabric Composition: ${data.fiber_composition}\n- Quality Class: ${data.material_quality}\n- Circularity Score: ${data.circularity_score}%\n- Texture: ${data.fabric_texture} (${data.fabric_pattern})`;
        setNotes((prev) => prev ? `${prev}\n\n${aiNotes}` : aiNotes);
        
        addNotification('AI scan completed successfully! Form pre-filled.', 'success');
      } else {
        throw new Error(data.detail || 'AI scanning failed.');
      }
    } catch (err) {
      setError(err.message || 'Error occurred during image upload');
      addNotification('AI Scan Failed', 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!source || !quantity || !color || !collectionDate) {
      setError('Please fill in all required fields.');
      return;
    }
    if (parseFloat(quantity) <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      fabric_type: fabricType,
      source,
      quantity: parseFloat(quantity),
      unit,
      color,
      condition,
      collection_date: collectionDate,
      status,
      notes: notes || null,
      image_analysis_in: aiAnalysis ? {
        image_path: aiAnalysis.image_path,
        fabric_texture: aiAnalysis.fabric_texture,
        fabric_pattern: aiAnalysis.fabric_pattern,
        fabric_color: aiAnalysis.fabric_color,
        damage_detection: aiAnalysis.damage_detection,
        contamination_detection: aiAnalysis.contamination_detection,
        predicted_fabric_type: aiAnalysis.predicted_fabric_type,
        fiber_composition: aiAnalysis.fiber_composition,
        blend_identification: aiAnalysis.blend_identification,
        material_quality: aiAnalysis.material_quality,
        predicted_waste_category: aiAnalysis.predicted_waste_category,
        recyclability_score: aiAnalysis.recyclability_score,
        reuse_score: aiAnalysis.reuse_score,
        sustainability_score: aiAnalysis.sustainability_score,
        material_recovery_score: aiAnalysis.material_recovery_score,
        circularity_score: aiAnalysis.circularity_score
      } : null
    };

    try {
      let res;
      if (isEdit) {
        // Update request
        res = await apiRequest(`/api/inventory/${batch_id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        // Create request
        res = await apiRequest('/api/inventory', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (res.ok) {
        addNotification(
          isEdit ? `Batch ${batch_id} updated successfully!` : `Batch registered successfully with ID ${data.batch_id}!`,
          'success'
        );
        navigate(`/inventory/${data.batch_id}`);
      } else {
        throw new Error(data.detail || 'Failed to submit form');
      }
    } catch (err) {
      setError(err.message || 'Error occurred during submission');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-forest-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header back button */}
      <div>
        <Link 
          to={isEdit ? `/inventory/${batch_id}` : "/inventory"} 
          className="inline-flex items-center space-x-1.5 text-slate-500 hover:text-slate-800 text-sm font-bold transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Cancel & Return</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight font-sans">
          {isEdit ? `Edit Batch ${batch_id}` : 'Register Textile Waste Batch'}
        </h2>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          {isEdit 
            ? 'Modify the details or change processing pipelines stages' 
            : 'Initialize a new waste record to track batch content composition'}
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-bold text-center">
          {error}
        </div>
      )}

      {/* Upload Zone (For New Registrations or Operators) */}
      {!isEdit && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-forest-500" />
              <h3 className="font-bold text-slate-700 text-sm font-sans">AI-Assisted Smart Registration</h3>
            </div>
            <span className="text-[10px] bg-forest-100 text-forest-800 font-bold px-2 py-0.5 rounded">Recommmend Upload</span>
          </div>
          
          <label className="border-2 border-dashed border-slate-200 hover:border-forest-400 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group">
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={scanning} />
            <Upload className="w-10 h-10 text-slate-300 group-hover:text-forest-500 transition-colors mb-3" />
            <span className="text-xs font-bold text-slate-600 group-hover:text-forest-600">Click to upload or drag textile photo</span>
            <span className="text-[10px] text-slate-400 mt-1">Supports JPG, PNG, WEBP. AI will auto-fill fabric type, color, and condition.</span>
          </label>
        </div>
      )}

      {/* Visual scanning card */}
      {(scanning || aiAnalysis) && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Classification Summary</h4>
          <AnalysisCard analysis={aiAnalysis} isScanning={scanning} />
        </div>
      )}

      {/* Form panel */}
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        
        {/* Core fields (disabled for Recyclers) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Fabric Classification Type
            </label>
            <select
              disabled={!canEditCoreFields}
              value={fabricType}
              onChange={(e) => setFabricType(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 font-medium text-slate-700 disabled:opacity-60"
            >
              {fabrics.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Source Facility / Organization Name
            </label>
            <input
              type="text"
              disabled={!canEditCoreFields}
              required
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. Apex Textiles Factory C"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 font-medium disabled:opacity-60"
            />
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Quantity Weight
              </label>
              <input
                type="number"
                step="any"
                disabled={!canEditCoreFields}
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="450.5"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 font-medium disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Unit
              </label>
              <select
                disabled={!canEditCoreFields}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 font-bold text-slate-600 disabled:opacity-60"
              >
                {units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Color Specifier
            </label>
            <input
              type="text"
              disabled={!canEditCoreFields}
              required
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Off-White, Mixed Indigo, Neon Green"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 font-medium disabled:opacity-60"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Batch Condition
            </label>
            <select
              disabled={!canEditCoreFields}
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 font-medium text-slate-700 disabled:opacity-60"
            >
              {conditions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Collection Date */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Collection Date
            </label>
            <input
              type="date"
              disabled={!canEditCoreFields}
              required
              value={collectionDate}
              onChange={(e) => setCollectionDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 font-medium disabled:opacity-60"
            />
          </div>

          {/* Status (Hidden/Readonly unless authorized role) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Processing Status Pipeline
            </label>
            <select
              disabled={!canEditStatus}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 font-medium text-slate-700 disabled:opacity-60"
            >
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Notes (Always editable by authorized editor roles) */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Logistical Notes / Fabric Details
          </label>
          <textarea
            rows="5"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Provide additional details regarding sorting guidelines, hardware removal, moisture drying requirements, or production source origins..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 font-medium"
          ></textarea>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Link 
            to={isEdit ? `/inventory/${batch_id}` : "/inventory"}
            className="px-5 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 bg-forest-600 hover:bg-forest-700 disabled:bg-slate-300 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                <span>Saving Record...</span>
              </>
            ) : (
              <>
                <Save className="h-4.5 w-4.5" />
                <span>{isEdit ? "Save Changes" : "Register Batch"}</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default InventoryForm;
