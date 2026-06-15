import React, { useState, useRef } from 'react'
import TrustMeter from './TrustMeter.jsx'

const STEPS = [
  { id: 1, label: 'Upload Photo' },
  { id: 2, label: 'Trust Check' },
  { id: 3, label: 'Listing Ready' },
]

export default function App() {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState('')
  const [generating, setGenerating] = useState(false)
  const [listing, setListing] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef()

  const currentStep = listing ? 3 : analysis ? 2 : 1

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
    setAnalysis(null)
    setListing(null)
    setError(null)
  }

  const handleAnalyze = async () => {
    if (!image) return
    setAnalyzing(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('image', image)
      const res = await fetch('/api/analyze-image', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Analysis failed')
      const data = await res.json()
      setAnalysis(data)
    } catch (err) {
      setError('Could not analyze image. Make sure the backend server is running.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleGenerateListing = async () => {
    if (!productName) {
      setError('Please enter a product name first.')
      return
    }
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          category,
          riskVerdict: analysis?.verdict,
        }),
      })
      if (!res.ok) throw new Error('Generation failed')
      const data = await res.json()
      if (data.action === 'BLOCKED') {
        setError(data.message)
      } else {
        setListing(data.listing)
      }
    } catch (err) {
      setError('Could not generate listing. Check backend connection / API key.')
    } finally {
      setGenerating(false)
    }
  }

  const reset = () => {
    setImage(null)
    setImagePreview(null)
    setAnalysis(null)
    setListing(null)
    setProductName('')
    setCategory('')
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-cream font-body">
      {/* Header */}
      <header className="bg-indigo-deep text-cream py-6 px-6 sm:px-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
              Sahayak<span className="text-marigold">AI</span>
            </h1>
            <p className="text-cream/60 text-sm mt-1">Seller Trust &amp; Onboarding Agent · ScriptedBy{'{'}Her{'}'} 2.0</p>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-xs uppercase tracking-widest text-marigold font-semibold">Built for Bharat</p>
            <p className="text-cream/50 text-xs mt-1">Agentic AI for trusted listings</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 sm:px-10 py-10">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm transition-colors ${
                    currentStep >= step.id ? 'bg-indigo-base text-cream' : 'bg-indigo-base/10 text-indigo-base/40'
                  }`}
                >
                  {step.id}
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${currentStep >= step.id ? 'text-indigo-base' : 'text-indigo-base/40'}`}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && <div className={`flex-1 h-px ${currentStep > step.id ? 'bg-indigo-base' : 'bg-indigo-base/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: upload + image */}
          <div className="bg-white rounded-2xl shadow-sm border border-indigo-base/5 p-6">
            <h2 className="font-display font-bold text-lg text-indigo-deep mb-1">1. Upload product photo</h2>
            <p className="text-sm text-indigo-base/60 mb-4">Take a clear photo of your product. The agent checks it before generating your listing.</p>

            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-base/20 rounded-xl h-56 cursor-pointer hover:border-marigold hover:bg-marigold/5 transition-colors">
                <span className="text-4xl mb-2">📷</span>
                <span className="text-indigo-base font-medium">Click to upload a photo</span>
                <span className="text-xs text-indigo-base/40 mt-1">JPG or PNG</span>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            ) : (
              <div>
                <img src={imagePreview} alt="Product preview" className="w-full h-56 object-cover rounded-xl mb-4" />
                <div className="flex gap-3">
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="flex-1 bg-indigo-deep text-cream font-display font-semibold py-3 rounded-xl hover:bg-indigo-base transition-colors disabled:opacity-50"
                  >
                    {analyzing ? 'Checking…' : 'Run Trust Check'}
                  </button>
                  <button onClick={reset} className="px-4 py-3 rounded-xl border border-indigo-base/20 text-indigo-base/70 hover:bg-indigo-base/5 text-sm">
                    Reset
                  </button>
                </div>
              </div>
            )}

            {analysis && (
              <div className="mt-5 pt-5 border-t border-indigo-base/10">
                <h3 className="font-display font-semibold text-sm text-indigo-deep mb-2">Agent findings</h3>
                {analysis.reasons && analysis.reasons.length > 0 ? (
                  <ul className="space-y-1.5">
                    {analysis.reasons.map((r, i) => (
                      <li key={i} className="text-sm text-indigo-base/70 flex gap-2">
                        <span className="text-marigold mt-0.5">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-leaf flex gap-2">
                    <span>✓</span> No issues detected — photo appears authentic.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right: trust meter + listing form */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-indigo-base/5 p-6 flex flex-col items-center justify-center">
              <h2 className="font-display font-bold text-lg text-indigo-deep mb-4 self-start">2. Trust check result</h2>
              <TrustMeter score={analysis?.risk_score ?? null} verdict={analysis?.verdict} loading={analyzing} />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-indigo-base/5 p-6">
              <h2 className="font-display font-bold text-lg text-indigo-deep mb-1">3. Generate your listing</h2>
              <p className="text-sm text-indigo-base/60 mb-4">The agent writes your title and description in English and Hindi.</p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-indigo-base/70 uppercase tracking-wide">Product name</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Cotton Printed Kurti"
                    className="w-full mt-1 px-3 py-2.5 rounded-lg border border-indigo-base/15 focus:outline-none focus:ring-2 focus:ring-marigold/50 focus:border-marigold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-indigo-base/70 uppercase tracking-wide">Category (optional)</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Women's Ethnic Wear"
                    className="w-full mt-1 px-3 py-2.5 rounded-lg border border-indigo-base/15 focus:outline-none focus:ring-2 focus:ring-marigold/50 focus:border-marigold"
                  />
                </div>
                <button
                  onClick={handleGenerateListing}
                  disabled={generating || !analysis}
                  className="w-full bg-marigold text-indigo-deep font-display font-semibold py-3 rounded-xl hover:bg-marigold-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {generating ? 'Writing listing…' : !analysis ? 'Run trust check first' : 'Generate Listing'}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-risk-high/10 border border-risk-high/30 text-risk-high text-sm">{error}</div>
              )}
            </div>
          </div>
        </div>

        {/* Listing output */}
        {listing && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-indigo-base/5 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl text-indigo-deep">Your listing is ready</h2>
              <span className="text-xs font-semibold bg-leaf/10 text-leaf px-3 py-1 rounded-full">Approved by Trust Agent</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-semibold text-indigo-base/50 uppercase tracking-wide mb-1">English</h3>
                <p className="font-display font-bold text-lg text-indigo-deep">{listing.title_en}</p>
                <p className="text-sm text-indigo-base/70 mt-2">{listing.description_en}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-indigo-base/50 uppercase tracking-wide mb-1">हिंदी</h3>
                <p className="font-display font-bold text-lg text-indigo-deep font-devanagari">{listing.title_hi}</p>
                <p className="text-sm text-indigo-base/70 mt-2 font-devanagari">{listing.description_hi}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <div className="bg-indigo-deep text-cream px-4 py-2 rounded-lg">
                <span className="text-xs text-cream/60 block">Suggested Price</span>
                <span className="font-display font-bold">₹{listing.suggested_price_range_inr}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {listing.tags?.map((tag, i) => (
                  <span key={i} className="text-xs bg-marigold/15 text-marigold-dim text-indigo-deep font-medium px-3 py-1.5 rounded-full border border-marigold/30">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center text-indigo-base/40 text-xs py-8">
        Built for ScriptedBy{'{'}Her{'}'} 2.0 — Meesho Hackathon · Theme: Building for Bharat with the Power of Agentic AI
      </footer>
    </div>
  )
}
