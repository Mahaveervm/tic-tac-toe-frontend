import { MODES } from '../utils/normalize';

const OPTIONS = [
  { value: MODES.TWO_PLAYER, label: 'Two Player Mode' },
  { value: MODES.COMPUTER, label: 'Play Against Computer' }
];

export default function ModeSelector({ mode, onChange, disabled }) {
  return (
    <div className="mode-selector" role="radiogroup" aria-label="Game mode">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={mode === option.value}
          className={`mode-selector__btn ${mode === option.value ? 'mode-selector__btn--active' : ''}`}
          onClick={() => onChange(option.value)}
          disabled={disabled}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
