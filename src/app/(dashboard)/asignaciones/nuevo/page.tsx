'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, FileText, UserPlus, PackagePlus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormSection } from '@/components/ui/FormSection';
import { TableCard, THead, Th, TBody, Tr, Td } from '@/components/ui/Table';

export default function NuevaAsignacionPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl p-6 animate-in fade-in duration-500">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4 text-ink-secondary" 
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a Asignaciones
      </Button>

      <PageHeader
        title="Registrar Nueva Asignación"
        description="Generación de acta de entrega o traspaso de bienes a funcionario custodio"
      />

      <div className="mt-6 flex flex-col gap-6">
        <Panel className="p-6 border-t-4 border-t-brand shadow-sm">
          <FormSection
            title="Datos del Acta"
            description="Información administrativa y fecha de la asignación institucional."
            icon={FileText}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Número de Asignación">
                <Input type="text" placeholder="Ej. 80901" className="font-mono" />
              </Field>
              <Field label="Fecha de Asignación">
                <Input type="date" />
              </Field>
              <Field label="Tipo de Movimiento" className="md:col-span-2">
                <Select>
                  <option>ASIGNACION DE BIENES POR NUEVA ADQUISICION</option>
                  <option>TRASPASO ENTRE OFICINAS</option>
                  <option>ASIGNACION DE BIENES FALTANTES</option>
                </Select>
              </Field>
              <Field label="Glosa / Observaciones" className="md:col-span-2">
                <Input type="text" placeholder="Motivo o respaldo de la asignación..." />
              </Field>
            </div>
          </FormSection>
        </Panel>

        <Panel className="p-6 shadow-sm">
          <FormSection
            title="Responsable Custodio"
            description="Funcionario o docente al que se le entregarán los activos físicos."
            icon={UserPlus}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Funcionario">
                <Select>
                  <option>Buscar funcionario...</option>
                  <option>RIBERA DIEZ OLGA (Cod. 4556)</option>
                  <option>JUSTINIANO MENDEZ JOSE MIGUEL (Cod. 9168)</option>
                </Select>
              </Field>
              <Field label="Unidad Académica / Administrativa">
                <Select>
                  <option>Buscar unidad...</option>
                  <option>BLOQUE D.T.I.C. - CPD JEFATURA (130501)</option>
                  <option>EDIF. RECTORADO Y ADM.-3ER. PISO ACTIVOS FIJOS (137012)</option>
                </Select>
              </Field>
            </div>
          </FormSection>
        </Panel>

        <Panel className="p-6 shadow-sm">
          <FormSection
            title="Bienes Asignados"
            description="Activos que se transferirán al custodio bajo el acta actual."
            icon={PackagePlus}
          >
            <div className="mb-4">
              <Button variant="secondary" size="sm">
                <PackagePlus className="mr-2 h-4 w-4" />
                Añadir Bien al Acta
              </Button>
            </div>
            
            <TableCard>
              <THead>
                <Th className="w-40">Código UAGRM</Th>
                <Th>Descripción</Th>
                <Th className="w-32 text-right">Costo Actz (Bs)</Th>
                <Th className="w-24 text-center">Acción</Th>
              </THead>
              <TBody>
                <Tr>
                  <Td className="font-mono text-xs text-ink font-semibold">U145621110938</Td>
                  <Td className="text-xs text-ink-secondary max-w-xs truncate" title="COMPUTADORA PORTATIL LENOVO, PROC. INTEL CORE I3...">
                    COMPUTADORA PORTATIL LENOVO, PROC. INTEL CORE I3...
                  </Td>
                  <Td className="font-mono text-xs tabular-nums text-right text-ink">2.375,00</Td>
                  <Td className="text-center">
                    <Button variant="ghost" size="sm" className="text-danger hover:text-danger-surface hover:bg-danger">
                      Quitar
                    </Button>
                  </Td>
                </Tr>
                {/* Fila de Totales */}
                <Tr className="bg-bg-muted border-t-2 border-border-strong font-bold">
                  <Td colSpan={2} className="text-right text-sm">TOTAL ASIGNADO:</Td>
                  <Td className="font-mono text-sm tabular-nums text-right text-ink">2.375,00</Td>
                  <Td></Td>
                </Tr>
              </TBody>
            </TableCard>
          </FormSection>
        </Panel>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button variant="primary">
            <Save className="mr-2 h-4 w-4" />
            Guardar y Generar Acta
          </Button>
        </div>
      </div>
    </div>
  );
}
