"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { DeleteServiceDialog } from "@/components/services/DeleteServiceDialog";
import { EditServiceDialog } from "@/components/services/EditServiceDialog";
import { NewServiceDialog } from "@/components/services/NewServiceDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useServices } from "@/hooks/use-availability";
import type { Service } from "@/services/schedule.service";

type ServicesViewProps = {
  initialServices: Service[];
};

export function ServicesView({ initialServices }: ServicesViewProps) {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  const { data: services, isLoading } = useServices();
  const rows = services ?? initialServices;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <NewServiceDialog />
      </div>

      <Card>
        <CardContent className="px-0">
          {isLoading && rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Cargando servicios...</p>
          ) : rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Todavía no tenés servicios cargados. Creá el primero para que el bot pueda ofrecerlo.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>RD$ {parseFloat(service.price).toLocaleString("es-DO")}</TableCell>
                    <TableCell>{service.durationMinutes} min</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setEditingService(service)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onSelect={() => setDeletingService(service)}>
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EditServiceDialog service={editingService} onOpenChange={(open) => !open && setEditingService(null)} />
      <DeleteServiceDialog service={deletingService} onOpenChange={(open) => !open && setDeletingService(null)} />
    </div>
  );
}
