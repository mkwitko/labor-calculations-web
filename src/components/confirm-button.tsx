import type { ComponentProps, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ConfirmButtonProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  /** Called only after the user confirms in the dialog. */
  onConfirm: () => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Tooltip shown on hover/focus over the trigger. */
  tooltip?: string;
  /** Style the confirm action as a destructive (red) button. */
  destructive?: boolean;
};

/**
 * A trigger button that opens a confirmation dialog before running `onConfirm`.
 * Use for destructive/irreversible actions (delete, unlink, etc). Pass the
 * button content (icon and/or label) as children.
 */
export function ConfirmButton({
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tooltip,
  destructive = true,
  children,
  ...buttonProps
}: ConfirmButtonProps) {
  const trigger = (
    <AlertDialogTrigger asChild>
      {/* Fall back to the tooltip text as the accessible name — icon-only
          triggers otherwise have no label for screen readers. */}
      <Button aria-label={tooltip} {...buttonProps}>
        {children}
      </Button>
    </AlertDialogTrigger>
  );

  return (
    <AlertDialog>
      {tooltip ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{trigger}</TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        trigger
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          {/* Variante, e não classe: `AlertDialogAction` é `<Button asChild>`,
              e o Slot do Radix concatena as duas listas de classe sem passar
              pelo twMerge — `bg-destructive` e `bg-primary` conviviam, e no
              tema escuro o `bg-primary` quase branco vencia por ordem de CSS,
              deixando texto branco em fundo branco. */}
          <AlertDialogAction
            onClick={onConfirm}
            variant={destructive ? "destructive" : "default"}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
