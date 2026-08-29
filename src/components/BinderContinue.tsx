export function BinderContinue({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="binder-continue no-print">
      <button type="button" className="binder-continue-btn" onClick={onClick} disabled={disabled}>
        {label}
      </button>
    </div>
  );
}
