export default function Cell({ value, index, highlighted, disabled, onClick }) {
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  const classes = [
    'cell',
    value ? `cell--${value.toLowerCase()}` : '',
    highlighted ? 'cell--win' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || !!value}
      onClick={() => onClick(index)}
      aria-label={`Row ${row}, Column ${col}${value ? `, ${value}` : ''}`}
      data-testid={`cell-${index}`}
    >
      {value}
    </button>
  );
}
