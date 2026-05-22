// Coverage class map (re-export consolidated so panels don't duplicate)
export const COVERAGE_CLASSES_LIKE: Record<string, string> = {
  covered: 'bg-success/10 text-success border-success/30',
  partial: 'bg-warning/10 text-warning border-warning/30',
  missing: 'bg-destructive/10 text-destructive border-destructive/30',
  not_required: 'bg-muted/30 text-muted-foreground border-border',
};

export { buildObservabilityCoverage } from './audit';
