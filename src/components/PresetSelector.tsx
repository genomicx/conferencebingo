import { PRESETS, PRESET_IDS } from '../bingo/presets'

interface PresetSelectorProps {
  value: string
  onChange: (presetId: string) => void
  disabled?: boolean
}

export function PresetSelector({ value, onChange, disabled }: PresetSelectorProps) {
  return (
    <div className="preset-row">
      <label htmlFor="preset-select" className="preset-label">
        Card list
      </label>
      <select
        id="preset-select"
        className="gx-input preset-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {PRESET_IDS.map((id) => (
          <option key={id} value={id}>
            {PRESETS[id].name} ({PRESETS[id].items.length} items)
          </option>
        ))}
      </select>
    </div>
  )
}
