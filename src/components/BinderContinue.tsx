export function BinderContinue({
  label,
  onClick,
  disabled,
  secondaryLabel,
  onSecondaryClick,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** Optional action shown above the primary continue button (e.g. Watch video). */
  secondaryLabel?: string;
  onSecondaryClick?: () => void;
}) {
  return (
    <div className="binder-continue no-print">
      {secondaryLabel && onSecondaryClick ? (
        <button
          type="button"
          className="binder-continue-btn binder-continue-btn-secondary"
          onClick={onSecondaryClick}
        >
          {secondaryLabel}
        </button>
      ) : null}
      <button type="button" className="binder-continue-btn" onClick={onClick} disabled={disabled}>
        {label}
      </button>
    </div>
  );
}
