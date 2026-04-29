import { useState } from 'react'
import { submitBugReport } from './api'

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low']
const COMPONENTS = ['Authentication', 'Dashboard', 'Billing', 'API', 'Notifications', 'Settings']

const EMPTY_FORM = {
  title: '',
  severity: '',
  component: '',
  description: '',
  steps: '',
  stepsCount: '',
}

export default function App() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(null)

  const [submitted, setSubmitted] = useState([])
  const [successId, setSuccessId] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((f) => ({ ...f, [name]: value }))

    // ✅ FIX: clear error when user edits field
    setErrors((prev) => ({
      ...prev,
      [name]: ''
    }))
  }

  // ✅ FIX: real validation
  const validate = (data) => {
    const errs = {}

    if (!data.title.trim()) {
      errs.title = 'Title is required'
    }

    if (!data.severity) {
      errs.severity = 'Severity is required'
    }

    if (!data.component) {
      errs.component = 'Component is required'
    }

    if (!data.description.trim()) {
      errs.description = 'Description is required'
    }

    if (!data.stepsCount) {
      errs.stepsCount = 'Steps count is required'
    } else if (Number(data.stepsCount) <= 0) {
      errs.stepsCount = 'Must be greater than 0'
    }

    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errs = validate(form)

    // ✅ FIX: block submission if errors exist
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    try {
      // ✅ FIX: loading before API call
      setLoading(true)
      setServerError(null)

      const result = await submitBugReport(form)

      setSuccessId(result.id)
      setSubmitted((prev) => [result, ...prev])

      // ✅ FIX: reset form after success
      setForm(EMPTY_FORM)
      setErrors({})
    } catch (err) {
      // ✅ FIX: handle server errors properly
      if (err.field) {
        setErrors({ [err.field]: err.message })
      } else {
        setServerError(err.message || 'Something went wrong')
      }
    } finally {
      // ✅ FIX: always stop loading
      setLoading(false)
    }
  }

  const sevClass = (s) =>
    ({ Critical: 'sev-critical', High: 'sev-high', Medium: 'sev-medium', Low: 'sev-low' }[s] ?? '')

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="badge">⬡ TrackFlow Internal Tools</div>
        <h1>Report a Bug</h1>
        <p>
          You're on the <strong>QA Engineering</strong> team at <strong>TrackFlow Inc.</strong>
        </p>
      </header>

      <div className="card">
        <p className="section-label">New Bug Report</p>

        <form onSubmit={handleSubmit} noValidate>

          {/* SUCCESS */}
          {successId && (
            <div style={{ color: '#4caf7d', marginBottom: 16 }}>
              ✓ Bug <strong>{successId}</strong> filed successfully!
            </div>
          )}

          {/* SERVER ERROR */}
          {serverError && (
            <div style={{ color: '#f75f5f', marginBottom: 16 }}>
              {serverError}
            </div>
          )}

          {/* TITLE */}
          <div className="form-group">
            <label>Bug Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <p className="error-text">{errors.title}</p>}
          </div>

          {/* SEVERITY + COMPONENT */}
          <div className="form-row">
            <div className="form-group">
              <label>Severity *</label>
              <select
                name="severity"
                value={form.severity}
                onChange={handleChange}
                className={errors.severity ? 'error' : ''}
              >
                <option value="">— Select —</option>
                {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
              </select>
              {errors.severity && <p className="error-text">{errors.severity}</p>}
            </div>

            <div className="form-group">
              <label>Component *</label>
              <select
                name="component"
                value={form.component}
                onChange={handleChange}
                className={errors.component ? 'error' : ''}
              >
                <option value="">— Select —</option>
                {COMPONENTS.map((c) => <option key={c}>{c}</option>)}
              </select>
              {errors.component && <p className="error-text">{errors.component}</p>}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
            />
            {errors.description && <p className="error-text">{errors.description}</p>}
          </div>

          <hr className="divider" />

          {/* STEPS */}
          <div className="form-row">
            <div className="form-group">
              <label>Steps</label>
              <textarea
                name="steps"
                value={form.steps}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>No. of Steps *</label>
              <input
                type="number"
                name="stepsCount"
                value={form.stepsCount}
                onChange={handleChange}
                className={errors.stepsCount ? 'error' : ''}
              />
              {errors.stepsCount && <p className="error-text">{errors.stepsCount}</p>}
            </div>
          </div>

          {/* BUTTON */}
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Submitting…' : 'Submit Bug Report'}
          </button>

        </form>
      </div>

      {/* LIST */}
      {submitted.length > 0 && (
        <div className="submitted-list">
          {submitted.map((bug, i) => (
            <div key={i} className="submitted-item">
              <div>
                <div className="title">{bug.title}</div>
                <div className="meta">{bug.component} · {bug.stepsCount} steps</div>
              </div>
              <span className={`severity-badge ${sevClass(bug.severity)}`}>
                {bug.severity}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}