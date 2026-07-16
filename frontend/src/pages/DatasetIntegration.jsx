import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Database, 
  HelpCircle, 
  Sparkles, 
  Upload, 
  Info, 
  Code,
  Layers,
  ChevronRight,
  TrendingUp,
  Tag,
  Loader2
} from 'lucide-react';

const DatasetIntegration = () => {
  const { apiRequest, user, addNotification } = useAuth();
  
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Mock Upload state
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [uploadLabel, setUploadLabel] = useState('Cotton (100%)');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadMetadata, setUploadMetadata] = useState('{"weave": "plain", "fiber_length": "long"}');
  const [uploading, setUploading] = useState(false);

  const fetchDatasets = async () => {
    try {
      const res = await apiRequest('/api/datasets');
      if (res.ok) {
        const data = await res.json();
        setDatasets(data);
        if (data.length > 0) {
          setSelectedDatasetId(data[0].id.toString());
        }
      } else {
        throw new Error('Failed to load dataset details');
      }
    } catch (err) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile || !selectedDatasetId) {
      addNotification("Please select a file and dataset to ingest.", "error");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("label", uploadLabel);
      if (uploadMetadata) {
        formData.append("metadata_json", uploadMetadata);
      }

      const res = await fetch(`http://localhost:8000/api/datasets/${selectedDatasetId}/ingest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        addNotification(data.message, "success");
        setUploadFile(null);
        // Clear input file
        document.getElementById("dataset-file-input").value = "";
        // Refresh counts
        fetchDatasets();
      } else {
        throw new Error(data.detail || "Ingestion failed");
      }
    } catch (err) {
      addNotification(err.message || "An error occurred", "error");
    } finally {
      setUploading(false);
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight font-sans">Dataset Integration Hub</h2>
        <p className="text-xs text-slate-400 font-semibold mt-1">Ingest images and composition benchmarks for computer vision models</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-bold text-center">
          {error}
        </div>
      )}

      {/* Dataset Grid documentation */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Side: Dataset listings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 text-base">Recommended & Ingested Datasets</h3>

            <div className="space-y-4">
              {datasets.map((ds) => (
                <div key={ds.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  
                  {/* Title Bar */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{ds.name}</h4>
                      <a href={ds.source_url} target="_blank" rel="noreferrer" className="text-[10px] text-forest-600 font-semibold hover:underline block mt-0.5">
                        {ds.source_url}
                      </a>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      ds.status === 'Ingested' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      ds.status === 'Seeded' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {ds.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {ds.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-[10px] text-slate-400 font-semibold border-t border-slate-200/60 pt-3">
                    <span>Format: <strong className="text-slate-600">{ds.format}</strong></span>
                    <span>Records: <strong className="text-slate-600">{ds.num_records.toLocaleString()}</strong></span>
                  </div>

                  {/* Seeded records preview */}
                  {ds.records.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200/60">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sample Records</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ds.records.map((rec) => (
                          <div key={rec.id} className="bg-white p-3 rounded-xl border border-slate-200/60 flex items-center space-x-3">
                            {rec.image_url_placeholder && (
                              <img src={rec.image_url_placeholder} alt={rec.label} className="h-10 w-12 rounded-lg object-cover border border-slate-100" />
                            )}
                            <div className="min-w-0">
                              <span className="block text-xs font-bold text-slate-700 truncate">{rec.label}</span>
                              <span className="block text-[9px] text-slate-400 font-mono truncate">{rec.metadata_json}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Mock Upload Form & Milestone 2 points */}
        <div className="space-y-6">
          
          {/* Upload card (restricted to Admins & Operators) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-forest-600" />
              <h3 className="font-bold text-slate-800 text-sm">Ingest Local Sample</h3>
            </div>
            
            {user.role === 'Sustainability Manager' || user.role === 'Textile Manufacturer' ? (
              <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                <Info className="h-5 w-5 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Sample ingestion is locked for role '{user.role}'. Only Admins and Recycling Operators can upload images.
                </p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Target Dataset
                  </label>
                  <select
                    value={selectedDatasetId}
                    onChange={(e) => setSelectedDatasetId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    {datasets.map((ds) => (
                      <option key={ds.id} value={ds.id}>
                        {ds.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Classification Label
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadLabel}
                    onChange={(e) => setUploadLabel(e.target.value)}
                    placeholder="e.g. Cotton (80%) Polyester (20%)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Metadata (JSON format)
                  </label>
                  <input
                    type="text"
                    value={uploadMetadata}
                    onChange={(e) => setUploadMetadata(e.target.value)}
                    placeholder='{"weave": "plain", "fiber": "long"}'
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Upload Sample Image
                  </label>
                  <input
                    id="dataset-file-input"
                    type="file"
                    required
                    accept="image/*"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-forest-50 file:text-forest-700 hover:file:bg-forest-100 cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-forest-600 hover:bg-forest-700 disabled:bg-slate-300 text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Ingesting sample...</span>
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4" />
                      <span>Ingest to AI Pipeline</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Integration benchmark info */}
          <div className="bg-gradient-to-tr from-forest-900 to-forest-950 p-6 rounded-3xl text-white shadow-md relative overflow-hidden space-y-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(252,251,247,0.06),transparent_50%)]"></div>
            
            <div className="flex items-center space-x-1.5 text-earth-300 relative z-10">
              <Code className="h-4.5 w-4.5" />
              <h3 className="text-xs font-bold uppercase tracking-wider">M2 Ingestion Pipelines</h3>
            </div>

            <p className="text-[11px] text-forest-200 leading-relaxed font-sans relative z-10">
              In Milestone 2, the uploaded images triggers a background Celery task matching features against pretrained ResNet and YOLO layers to automate fabric prediction values.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DatasetIntegration;
