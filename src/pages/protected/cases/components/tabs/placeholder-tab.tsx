import { LockIcon } from "lucide-react";

type Props = {
  phase: string;
  description: string;
};

export function PlaceholderTab({ phase, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <LockIcon className="w-6 h-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Disponível em breve</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>
        <p className="text-xs text-muted-foreground/60 mt-2">{phase}</p>
      </div>
    </div>
  );
}
