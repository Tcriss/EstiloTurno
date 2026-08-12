"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDeleteService } from "@/hooks/use-services";
import type { Service } from "@/services/schedule.service";

type DeleteServiceDialogProps = {
  service: Service | null;
  onOpenChange: (open: boolean) => void;
};

export function DeleteServiceDialog({ service, onOpenChange }: DeleteServiceDialogProps) {
  const deleteService = useDeleteService();

  if (!service) return null;

  async function handleConfirm() {
    if (!service) return;

    try {
      await deleteService.mutateAsync(service.id);
      toast.success("Servicio eliminado");
      onOpenChange(false);
    } catch (error) {
      toast.error("No pudimos eliminar el servicio", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <Dialog open={Boolean(service)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar servicio</DialogTitle>
          <DialogDescription>
            ¿Seguro que querés eliminar &quot;{service.name}&quot;? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" disabled={deleteService.isPending} onClick={handleConfirm}>
            {deleteService.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
