'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, FileText, FileDown, Eye } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { TableCard, THead, Th, TBody, Tr, Td } from '@/components/ui/Table';

interface ActaAsignacion {
  id: string;
  nroAsignacion: string;
  fecha: string;
  funcionario: string;
  unidad: string;
  estado: 'VIGENTE' | 'DEVUELTO' | 'OBSERVADO';
  totalBienes: number;
}

const MOCK_DATA: ActaAsignacion[] = [
  {
    id: '1',
    nroAsignacion: '80901',
    fecha: '2026-08-27',
    funcionario: 'RIBERA DIEZ OLGA',
    unidad: 'BLOQUE D.T.I.C. - CPD JEFATURA',
    estado: 'VIGENTE',
    totalBienes: 2,
  },
  {
    id: '2',
    nroAsignacion: '80902',
    fecha: '2026-09-10',
    funcionario: 'JUSTINIANO MENDEZ JOSE MIGUEL',
    unidad: 'EDIF. RECTORADO Y ADM.-3ER. PISO',
    estado: 'VIGENTE',
    totalBienes: 5,
  },
];

export default function AsignacionesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-ink-secondary">
          <Panel>Cargando registros de asignación...</Panel>
        </div>
      }
    >
      <AsignacionesContent />
    </Suspense>
  );
}

function AsignacionesContent() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');

  return (
    <div className="mx-auto max-w-7xl p-6 animate-in fade-in duration-500">
      <PageHeader
        title="Gestión de Asignaciones y Custodia"
        description="Emisión de actas de entrega, traspasos y devoluciones de activos fijos"
        action={
          <Button
            variant="primary"
            onClick={() => router.push('/asignaciones/nuevo')}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva Asignación
          </Button>
        }
      />

      <Panel className="mb-6 p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Buscar Acta o Funcionario">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
              <Input
                type="text"
                placeholder="Ej. 80901 o RIBERA DIEZ..."
                className="pl-9"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </Field>
        </div>
      </Panel>

      <TableCard>
        <THead>
          <Th className="w-32">Nro. Asignación</Th>
          <Th className="w-32">Fecha</Th>
          <Th>Funcionario Custodio</Th>
          <Th>Unidad / Ubicación</Th>
          <Th className="w-24 text-center">Bienes</Th>
          <Th className="w-32">Estado</Th>
          <Th className="w-40 text-center">Acciones</Th>
        </THead>
        <TBody>
          {MOCK_DATA.map((acta) => (
            <Tr key={acta.id}>
              <Td className="font-mono text-xs font-bold text-ink">{acta.nroAsignacion}</Td>
              <Td className="font-mono text-xs text-ink-secondary">{acta.fecha}</Td>
              <Td className="font-semibold text-ink">{acta.funcionario}</Td>
              <Td className="text-xs text-ink-secondary">{acta.unidad}</Td>
              <Td className="text-center font-mono text-xs tabular-nums text-ink">{acta.totalBienes}</Td>
              <Td>
                <Badge
                  tone={
                    acta.estado === 'VIGENTE'
                      ? 'brand'
                      : acta.estado === 'DEVUELTO'
                      ? 'neutral'
                      : 'accent'
                  }
                >
                  {acta.estado}
                </Badge>
              </Td>
              <Td className="text-center">
                <div className="flex justify-center gap-2">
                  <Button variant="secondary" size="sm" title="Ver detalle">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="sm" title="Descargar Acta PDF">
                    <FileDown className="h-4 w-4 text-brand" />
                  </Button>
                </div>
              </Td>
            </Tr>
          ))}
        </TBody>
      </TableCard>
    </div>
  );
}
