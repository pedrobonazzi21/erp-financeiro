"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { incomeSchema, type IncomeFormData } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Repeat, Paperclip, Loader2 } from "lucide-react"

interface Category { id: string; name: string }
interface BankAccount { id: string; bank: string }
interface FamilyMember { id: string; name: string }
interface CostCenter { id: string; name: string }

const subcategories = ["Fixo", "Variável", "Desenvolvimento", "Dividendos", "Imóvel"]

interface IncomeFormProps {
  editingId: string | null
  categories: Category[]
  accounts: BankAccount[]
  members: FamilyMember[]
  costCenters: CostCenter[]
  onSave: (data: IncomeFormData, id?: string) => Promise<void>
}

export function IncomeForm({ editingId, categories, accounts, members, costCenters, onSave }: IncomeFormProps) {
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      description: "",
      categoryId: categories[0]?.id || "",
      subcategoryId: "",
      amount: "",
      receivedDate: "",
      accountId: accounts[0]?.id || "",
      memberId: members[0]?.id || "",
      costCenterId: "",
      recurring: false,
    },
  })

  const formId = "income-form"

  const onSubmit = async (data: IncomeFormData) => {
    await onSave(data, editingId || undefined)
    reset()
  }

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{editingId ? "Editar" : "Nova"} receita</DialogTitle>
      </DialogHeader>
      <form id={formId} onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-2 col-span-2">
            <Label>Descrição</Label>
            <Controller name="description" control={control} render={({ field }) => (
              <Input {...field} placeholder="Ex: Salário mensal" />
            )} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Controller name="categoryId" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>

          <div className="space-y-2">
            <Label>Subcategoria</Label>
            <Controller name="subcategoryId" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>
                  {subcategories.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>

          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Controller name="amount" control={control} render={({ field }) => (
              <Input {...field} type="number" step="0.01" placeholder="0,00" />
            )} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Conta</Label>
            <Controller name="accountId" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.bank}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>

          <div className="space-y-2">
            <Label>Data de recebimento</Label>
            <Controller name="receivedDate" control={control} render={({ field }) => (
              <Input {...field} type="date" />
            )} />
          </div>

          <div className="space-y-2">
            <Label>Responsável</Label>
            <Controller name="memberId" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {members.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>

          <div className="space-y-2">
            <Label>Centro de custo</Label>
            <Controller name="costCenterId" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>
                  {costCenters.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>

          <div className="col-span-2 flex items-center gap-2">
            <Controller name="recurring" control={control} render={({ field }) => (
              <input
                type="checkbox"
                id="recurring"
                checked={field.value || false}
                onChange={field.onChange}
                className="h-4 w-4 rounded border-input"
              />
            )} />
            <Label htmlFor="recurring" className="flex items-center gap-1 text-sm">
              <Repeat className="h-3 w-3" /> Receita recorrente
            </Label>
          </div>

          <div className="col-span-2 space-y-2">
            <Label>Observações</Label>
            <Textarea placeholder="Observações adicionais..." />
          </div>

          <div className="col-span-2">
            <Button variant="outline" size="sm" type="button">
              <Paperclip className="mr-2 h-4 w-4" /> Anexar comprovante
            </Button>
          </div>
        </div>
      </form>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" type="button" />}>Cancelar</DialogClose>
        <Button type="submit" form={formId} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Salvar
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
