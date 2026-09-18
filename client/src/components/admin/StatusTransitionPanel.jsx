import { useState } from 'react';
import { ArrowRightIcon, ShieldAlertIcon } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger, AlertDialogPopup, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogClose } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectItem, SelectPopup } from '@/components/ui/select';
import api from '@/api/axiosInstance';
import { useToast } from '@/context/ToastContext';
import { STATUS_FLOW } from '@/lib/constants';
import { formatError } from '@/lib/format';

export function StatusTransitionPanel({ request, onUpdated }) {
  const { toast } = useToast();
  const [target, setTarget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [force, setForce] = useState(false);

  const currentIndex = STATUS_FLOW.indexOf(request.status);
  const nextTarget = currentIndex >= 0 ? STATUS_FLOW[currentIndex + 1] : null;
  const choices = STATUS_FLOW.filter((s) => s !== request.status);

  const move = async (status, isForced) => {
    setSubmitting(true);
    try {
      const { data } = await api.patch(`/admin/requests/${request.id}/status`, {
        status,
        force: isForced,
      });
      toast.success(
        `Moved to ${data.item.status}`,
        isForced ? 'Sequence override applied.' : undefined
      );
      setTarget('');
      onUpdated?.(data.item);
      return true;
    } catch (err) {
      toast.error('Transition failed', formatError(err));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const advance = () => move(nextTarget, false);

  const handleSelect = async (value) => {
    const ok = await move(value, false);
    if (!ok) {
      setTarget(value);
      setForce(true);
    } else {
      setTarget('');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {nextTarget ? (
        <Button type="button" size="sm" variant="outline" loading={submitting} onClick={advance}>
          <ArrowRightIcon />
          {nextTarget}
        </Button>
      ) : null}

      <Select value={force ? target : ''} onValueChange={handleSelect}>
        <SelectTrigger size="sm" className="min-w-32">
          <SelectValue placeholder="Jump to…" />
        </SelectTrigger>
        <SelectPopup className="z-50">
          {choices.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>

      <AlertDialog open={force} onOpenChange={setForce}>
        <AlertDialogTrigger className="hidden" />
        <AlertDialogPopup className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlertIcon className="size-5 text-warning" />
              Override status sequence?
            </AlertDialogTitle>
            <AlertDialogDescription>
              "{request.status}" → "{target}" skips or reverses the normal flow (Under Review → Planned →
              In Progress → Completed). Force it anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose asChild>
              <Button type="button" variant="ghost" disabled={submitting}>
                Cancel
              </Button>
            </AlertDialogClose>
            <Button
              type="button"
              variant="default"
              loading={submitting}
              onClick={async () => {
                const ok = await move(target, true);
                if (ok) setForce(false);
              }}
            >
              Force move
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </div>
  );
}