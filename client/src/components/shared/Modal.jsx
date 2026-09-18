import { Dialog, DialogPopup, DialogHeader, DialogTitle, DialogDescription, DialogPanel, DialogFooter } from '@/components/ui/dialog';

export function AppModal({ open, onOpenChange, title, description, children, footer, className }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className={className}>
        {title ? (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
        ) : null}
        {children ? <DialogPanel>{children}</DialogPanel> : null}
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogPopup>
    </Dialog>
  );
}