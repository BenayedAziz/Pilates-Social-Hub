interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-3">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-2">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground text-base">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
