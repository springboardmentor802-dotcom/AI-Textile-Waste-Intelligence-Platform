import { useState } from 'react'
import {
  UploadCloud, Shirt, Grid3x3, Palette, AlertTriangle, FlaskConical,
  Recycle, Sprout, Globe2, CircleGauge, FileText, Download, X,
} from 'lucide-react'
import api from '../api'
import { Badge, ProgressBar, CircularProgress, Section } from '../components/ui.jsx'

const MAX_FILES = 5

export default function UploadWaste() {
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analysisIds, setAnalysisIds] = useState([])
  const [activeTab, setActiveTab] = useState(0)

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files || [])
    if (!picked.length) return

    const combined = [...files, ...picked]
    if (combined.length > MAX_FILES) {
      setError(`You can select up to ${MAX_FILES} images total (you have ${files.length}, tried to add ${picked.length})`)
      e.target.value = ''
      return
    }
    setError('')
    setFiles(combined)
    setPreviews([...previews, ...picked.map((f) => URL.createObjectURL(f))])
    setResults(null)
    setActiveTab(0)
    e.target.value = ''
  }

  const removeFile = (idx) => {
    const newFiles = files.filter((_, i) => i !== idx)
    const newPreviews = previews.filter((_, i) => i !== idx)
    setFiles(newFiles)
    setPreviews(newPreviews)
  }

  const handleAnalyze = async () => {
    if (!files.length) return
    setLoading(true); setError('')
    try {
      const formData = new FormData()
      files.forEach((f) => formData.append('files', f))
      const { data } = await api.post('/analyze-batch', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResults(data.results)
      setActiveTab(0)

      const hist = await api.get('/history')
      const ids = (hist.data || []).slice(0, data.results.length).map((r) => r.id)
      setAnalysisIds(ids.reverse())
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const downloadPdf = async (idx) => {
    const analysisId = analysisIds[idx]
    if (!analysisId) return
    try {
      const response = await api.get(`/report/${analysisId}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `analysis_${analysisId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to download PDF report')
    }
  }

  const downloadAllPdf = async () => {
    const validIds = analysisIds.filter(Boolean)
    if (!validIds.length) return
    try {
      const response = await api.get(`/report/batch/pdf?ids=${validIds.join(',')}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'analysis_batch_report.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to download combined PDF report')
    }
  }

  const result = results && results[activeTab] ? results[activeTab] : null

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">🤖 AI Textile Prediction</h1>

      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <label className="flex-1 flex items-center gap-3 border border-dashed border-white/15 rounded-xl px-4 py-6 cursor-pointer hover:border-mint-500/40 transition w-full">
            <UploadCloud className="text-mint-400" size={22} />
            <div>
              <div className="text-sm font-medium">
                {files.length ? `${files.length} image${files.length > 1 ? 's' : ''} selected` : 'Choose up to 5 textile images to analyze'}
              </div>
              <div className="text-xs text-white/40">JPG, PNG up to 10MB each, max {MAX_FILES} images</div>
            </div>
            <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
          </label>
          <button onClick={handleAnalyze} disabled={!files.length || loading}
            className="bg-mint-600 hover:bg-mint-500 disabled:opacity-40 transition rounded-xl px-6 py-3 text-sm font-semibold whitespace-nowrap">
            {loading ? 'Analyzing...' : `Predict Image${files.length > 1 ? 's' : ''}`}
          </button>
        </div>
        {error && <div className="text-xs text-red-400 mt-3">{error}</div>}

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4 items-center">
            {previews.map((p, idx) => (
              <div key={idx} className="relative">
                <img src={p} alt={`preview ${idx}`} className="w-20 h-20 object-cover rounded-lg border border-white/10" />
                <button onClick={() => removeFile(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-400">
                  <X size={12} />
                </button>
              </div>
            ))}
            {files.length < MAX_FILES && (
              <label className="w-20 h-20 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-white/20 hover:border-mint-500/50 cursor-pointer transition text-white/50 hover:text-mint-400">
                <UploadCloud size={18} />
                <span className="text-[10px]">Add Image</span>
                <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
              </label>
            )}
          </div>
        )}
      </div>

      {results && results.length > 0 && (
        <>
          {results.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {results.map((r, idx) => (
                <button key={idx} onClick={() => setActiveTab(idx)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    activeTab === idx ? 'bg-mint-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}>
                  {r.error ? '⚠️ ' : ''}{r.filename}
                </button>
              ))}
            </div>
          )}

          {result?.error ? (
            <Section title="Image Preview" icon={Shirt}>
              <div className="text-sm text-red-400">Failed to analyze {result.filename}: {result.error}</div>
            </Section>
          ) : result && (
            <>
              <Section title="Image Preview" icon={Shirt}>
                <div className="flex flex-col md:flex-row gap-6">
                  <img src={previews[activeTab]} alt="preview" className="w-56 h-56 object-cover rounded-xl border border-white/10" />
                  <div className="grid grid-cols-2 gap-3 text-sm flex-1">
                    <div><span className="text-white/40">Size:</span> {(result.image_info.size_bytes / 1024).toFixed(1)} KB</div>
                    <div><span className="text-white/40">Resolution:</span> {result.image_info.width}×{result.image_info.height}</div>
                    <div><span className="text-white/40">Processing Time:</span> {result.image_info.processing_time_ms} ms</div>
                    <div><span className="text-white/40">Filename:</span> {result.filename}</div>
                  </div>
                </div>
              </Section>

              <Section title="Material Classification" icon={Shirt}>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="text-2xl font-bold">{result.material_classification.material}</span>
                  <Badge level="GOOD">{result.material_classification.confidence}% confidence</Badge>
                  {result.material_classification.classifier_source === 'rule_based_fallback' && (
                    <Badge level="AVERAGE">rule-based estimate — train model for higher accuracy</Badge>
                  )}
                </div>
                <p className="text-sm text-white/70 mb-4">{result.material_classification.explanation}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div><span className="text-white/40 block text-xs">Fiber Composition</span>{result.material_classification.fiber_composition}</div>
                  <div><span className="text-white/40 block text-xs">Blend</span>{result.material_classification.blend_identification}</div>
                  <div><span className="text-white/40 block text-xs">Fabric Category</span>{result.material_classification.fabric_category}</div>
                  <div><span className="text-white/40 block text-xs">Recyclability</span><Badge level={result.material_classification.recyclability} /></div>
                  <div><span className="text-white/40 block text-xs">Reuse Potential</span><Badge level={result.material_classification.reuse_potential} /></div>
                  <div><span className="text-white/40 block text-xs">Quality</span><Badge level={result.material_classification.material_quality} /></div>
                </div>
              </Section>

              <Section title="Texture Analysis" icon={Grid3x3}>
                <div className="mb-3"><Badge level={result.texture_analysis.texture_quality} /></div>
                <p className="text-sm text-white/70 mb-4">{result.texture_analysis.explanation}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <ProgressBar label="Smoothness" value={result.texture_analysis.smoothness_pct} />
                  <ProgressBar label="Homogeneity" value={result.texture_analysis.homogeneity_pct} />
                  <ProgressBar label="Energy" value={result.texture_analysis.energy_pct} />
                  <ProgressBar label="Edge Density" value={result.texture_analysis.edge_density_pct} />
                  <ProgressBar label="Surface Roughness" value={result.texture_analysis.surface_roughness_pct} />
                  <ProgressBar label="Pattern Regularity" value={result.texture_analysis.pattern_regularity_pct} />
                </div>
              </Section>

              <Section title="Color Analysis" icon={Palette}>
                <p className="text-sm text-white/70 mb-4">{result.color_analysis.explanation}</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl border border-white/10"
                    style={{ background: `rgb(${result.color_analysis.dominant_color_rgb.join(',')})` }} />
                  <div className="text-sm">
                    <div className="text-white/40 text-xs">Dominant Color</div>
                    RGB({result.color_analysis.dominant_color_rgb.join(', ')})
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <ProgressBar label="Brightness" value={result.color_analysis.brightness_pct} />
                  <ProgressBar label="Saturation" value={result.color_analysis.saturation_pct} />
                  <ProgressBar label="Uniformity" value={result.color_analysis.uniformity_pct} />
                </div>
              </Section>

              <Section title="Damage Detection" icon={AlertTriangle}>
                <div className="flex flex-wrap gap-3 mb-3">
                  <Badge level={result.damage_detection.severity === 'None' ? 'GOOD' : result.damage_detection.severity === 'Minor' ? 'AVERAGE' : 'POOR'}>
                    {result.damage_detection.damage_type}
                  </Badge>
                  <span className="text-xs text-white/50 self-center">Severity: {result.damage_detection.severity}</span>
                  <span className="text-xs text-white/50 self-center">Confidence: {result.damage_detection.confidence}%</span>
                </div>
                <p className="text-sm text-white/70 mb-4">{result.damage_detection.explanation}</p>
                <ProgressBar label="Estimated Damage Area" value={result.damage_detection.estimated_damage_area_pct} />
                <div className="flex gap-6 mt-3 text-sm">
                  <div>Repairable: <Badge level={result.damage_detection.repairable ? 'GOOD' : 'POOR'}>{result.damage_detection.repairable ? 'Yes' : 'No'}</Badge></div>
                  <div>Recyclable: <Badge level={result.damage_detection.recyclable ? 'GOOD' : 'POOR'}>{result.damage_detection.recyclable ? 'Yes' : 'No'}</Badge></div>
                </div>
              </Section>

              <Section title="Contamination Detection" icon={FlaskConical}>
                <div className="mb-3">
                  <Badge level={result.contamination_detection.contaminated ? 'POOR' : 'GOOD'}>
                    {result.contamination_detection.contaminated ? result.contamination_detection.types_detected.join(', ') : 'Clean'}
                  </Badge>
                </div>
                <p className="text-sm text-white/70">{result.contamination_detection.explanation}</p>
              </Section>

              <Section title="Waste Classification" icon={Recycle}>
                <div className="mb-3"><Badge level="GOOD">{result.waste_classification.waste_category}</Badge></div>
                <p className="text-sm text-white/70">{result.waste_classification.explanation}</p>
              </Section>

              <Section title="Recycling Recommendation" icon={Recycle}>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-mint-500/20">
                    <div className="text-xs text-mint-400 mb-1">Best Recommendation</div>
                    <div className="font-semibold mb-1">{result.recycling_recommendation.best_recommendation}</div>
                    <div className="text-xs text-white/50">{result.recycling_recommendation.best_recommendation_detail}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-xs text-white/40 mb-1">Alternative</div>
                    <div className="font-semibold mb-1">{result.recycling_recommendation.alternative_recommendation}</div>
                    <div className="text-xs text-white/50">{result.recycling_recommendation.alternative_recommendation_detail}</div>
                  </div>
                </div>
                {result.recycling_recommendation.reuse_opportunity && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-mint-400">Reuse Opportunity</span>
                      <Badge level={result.recycling_recommendation.reuse_opportunity.opportunity_detected ? 'GOOD' : 'POOR'}>
                        {result.recycling_recommendation.reuse_opportunity.opportunity_detected ? 'Detected' : 'Not Eligible'}
                      </Badge>
                    </div>
                    <div className="text-sm text-white/70">{result.recycling_recommendation.reuse_opportunity.note}</div>
                  </div>
                )}
                {result.recycling_recommendation.waste_reduction_strategy && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                    <div className="text-xs text-mint-400 mb-1">Waste Reduction Strategy</div>
                    <div className="text-sm text-white/70">{result.recycling_recommendation.waste_reduction_strategy}</div>
                  </div>
                )}
                <div className="flex gap-6 text-sm mb-3">
                  <div>Priority: <Badge level={result.recycling_recommendation.processing_priority} /></div>
                  <div>Expected Recovery: <span className="text-mint-400 font-semibold">{result.recycling_recommendation.expected_recovery}</span></div>
                </div>
                <p className="text-sm text-white/60">{result.recycling_recommendation.reason}</p>
              </Section>

              <Section title="Sustainability Assessment" icon={Sprout}>
                <p className="text-sm text-white/70 mb-4">{result.sustainability_assessment.explanation}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div><div className="text-lg font-bold text-mint-400">{result.sustainability_assessment.carbon_saving_kg_co2}kg</div><div className="text-xs text-white/40">Carbon Saving</div></div>
                  <div><div className="text-lg font-bold text-mint-400">{result.sustainability_assessment.water_saving_liters}L</div><div className="text-xs text-white/40">Water Saving</div></div>
                  <div><div className="text-lg font-bold text-mint-400">{result.sustainability_assessment.waste_diversion_pct}%</div><div className="text-xs text-white/40">Waste Diversion</div></div>
                  <div><div className="text-lg font-bold text-mint-400">{result.sustainability_assessment.resource_recovery_pct}%</div><div className="text-xs text-white/40">Resource Recovery</div></div>
                </div>
              </Section>

              <Section title="Environmental Impact" icon={Globe2}>
                <p className="text-sm text-white/70 mb-4">{result.environmental_impact.explanation}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div><div className="text-lg font-bold">{result.environmental_impact.co2_reduction_kg}kg</div><div className="text-xs text-white/40">CO₂ Reduction</div></div>
                  <div><div className="text-lg font-bold">{result.environmental_impact.water_saved_liters}L</div><div className="text-xs text-white/40">Water Saved</div></div>
                  <div><div className="text-lg font-bold">{result.environmental_impact.landfill_reduction_pct}%</div><div className="text-xs text-white/40">Landfill Reduction</div></div>
                  <div><Badge level={result.environmental_impact.overall_environmental_rating} /><div className="text-xs text-white/40 mt-1">Overall Rating</div></div>
                </div>
              </Section>

              <Section title="Circularity Score" icon={CircleGauge}>
                <div className="flex flex-wrap items-center gap-8">
                  <CircularProgress value={result.scores.circularity_score} label={result.scores.circularity_category} />
                  <div className="flex-1 min-w-[240px] space-y-3">
                    <ProgressBar label="Material Recyclability (35%)" value={result.scores.recyclability_score} />
                    <ProgressBar label="Material Condition (20%)" value={result.scores.material_condition_score} />
                    <ProgressBar label="Reuse Potential (20%)" value={result.scores.reuse_score} />
                    <ProgressBar label="Environmental Benefit (15%)" value={result.scores.environmental_benefit_score} />
                    <ProgressBar label="Processing Feasibility (10%)" value={result.scores.processing_feasibility_score} />
                  </div>
                </div>
              </Section>

              <Section title="Overall Report" icon={FileText}>
                <p className="text-sm text-white/70 mb-4">
                  This <strong>{result.material_classification.material}</strong> item scored{' '}
                  <strong className="text-mint-400">{result.scores.overall_score}/100</strong> ({result.scores.overall_category}),
                  classified as <strong>{result.waste_classification.waste_category}</strong>, with{' '}
                  <strong>{result.recycling_recommendation.best_recommendation}</strong> as the recommended processing method.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => downloadPdf(activeTab)} disabled={!analysisIds[activeTab]}
                    className="flex items-center gap-2 bg-mint-600 hover:bg-mint-500 disabled:opacity-40 transition rounded-xl px-5 py-2.5 text-sm font-semibold">
                    <Download size={16} /> Download PDF Report
                  </button>
                  {results.length > 1 && (
                    <button onClick={downloadAllPdf} disabled={!analysisIds.filter(Boolean).length}
                      className="flex items-center gap-2 bg-mint-600 hover:bg-mint-500 disabled:opacity-40 transition rounded-xl px-5 py-2.5 text-sm font-semibold">
                      <Download size={16} /> Download All (PDF)
                    </button>
                  )}
                </div>
              </Section>
            </>
          )}
        </>
      )}
    </div>
  )
}