"use client"

import { useEffect, useState } from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { expenseSchema, type ExpenseFormData } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Building2, CreditCard, Loader2 } from "lucide-react"

interface Category { id: string; name: string }
interface BankAccount { id: string; bank: string; balance: number }
interface CreditCard { id: string; name: string }
interface PaymentMethod { id: string; name: string }
interface FamilyMember { id: string; name: string }
interface CostCenter { id: string; name: string }

interface ExpenseFormProps {
  editingId: string | null
  categories: Category[]
  accounts: BankAccount[]
  creditCards: CreditCard[]
  paymentMethods: PaymentMethod[]
  members: FamilyMember[]
  costCenters: CostCenter[]
  onSave: (data: ExpenseFormData, id?: string) => Promise<void>
}

export function ExpenseForm({ editingId, categories, accounts, creditCards, paymentMethods, members, costCenters, onSave }: ExpenseFormProps) {
  const { control, handleSubmit, formState: { errors, isSubmitting }, setValue, reset } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      categoryId: categories[0]?.id || "",
      amount: "",
      paidDate: "",
      accountId: accounts[0]?.id || "",
      creditCardId: "",
      paymentMethodId: paymentMethods[0]?.id || "",
      memberId: members[0]?.id || "",
      costCenterId: "",
      installments: "1",
      paymentType: "account",
      splitMembers: [],
    },
  })

  const paymentType = useWatch({ control, name: "paymentType" })
  const amount = useWatch({ control, name: "amount" })
  const [enableSplit, setEnableSplit] = useState(false)

  const totalAmount = parseFloat(amount) || 0
  const splitCount = enableSplit ? members.length : 1
  const splitAmount = splitCount > 0 ? totalAmount / splitCount : 0

  useEffect(() => {
    if (!enableSplit) {
      setValue("splitMembers", [])
    }
  }, [enableSplit, setValue])

  useEffect(() => {
    if (enableSplit && members.length > 0) {
      setValue(
        "splitMembers",
        members.map((m) => ({ memberId: m.id, amount: splitAmount }))
      )
    }
  }, [enableSplit, members, splitAmount, setValue])

  const formId = "expense-form"

  const onSubmit = async (data: ExpenseFormData) => {
    await onSave(data, editingId || undefined)
    reset()
  }

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{editingId ? "Editar" : "Nova"} despesa</DialogTitle>
      </DialogHeader>
      <form id={formId} onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-2 col-span-2">
            <Label>Descrição</Label>
            <Controller name="description" control={control} render={({ field }) => (
              <Input {...field} placeholder="Ex: Mercado" />
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
            <Label>Valor (R$)</Label>
            <Controller name="amount" control={control} render={({ field }) => (
              <Input {...field} type="number" step="0.01" placeholder="0,00" />
            )} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Data de pagamento</Label>
            <Controller name="paidDate" control={control} render={({ field }) => (
              <Input {...field} type="date" />
            )} />
          </div>

          <div className="space-y-2">
            <Label>Forma de pagamento</Label>
            <Controller name="paymentMethodId" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>

          <div className="space-y-2">
            <Label>Pagamento via</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setValue("paymentType", "account")}
                className={`flex flex-1 items-center justify-center gap-1 rounded-lg border p-2 text-xs ${paymentType === "account" ? "border-primary bg-primary/5" : "border-input"}`}
              >
                <Building2 className="h-3 w-3" /> Conta
              </button>
              <button
                type="button"
                onClick={() => setValue("paymentType", "credit")}
                className={`flex flex-1 items-center justify-center gap-1 rounded-lg border p-2 text-xs ${paymentType === "credit" ? "border-primary bg-primary/5" : "border-input"}`}
              >
                <CreditCard className="h-3 w-3" /> Cartão
              </button>
            </div>
            {paymentType === "account" ? (
              <Controller name="accountId" control={control} render={({ field }) => (
                <div className="space-y-1">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.bank}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {field.value && (() => {
                    const acc = accounts.find((a) => a.id === field.value)
                    return acc ? (
                      <p className={`text-xs ${Number(acc.balance) >= 0 ? "text-green-600" : "text-red-600"}`}>
                        Saldo: R$ {Number(acc.balance).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    ) : null
                  })()}
                </div>
              )} />
            ) : (
              <Controller name="creditCardId" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {creditCards.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            )}
          </div>

          <div className="space-y-2">
            <Label>Parcelas</Label>
            <Controller name="installments" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}x {n === 1 ? "(à vista)" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          <div className="col-span-2 border-t pt-3">
            <label className="flex items-center gap-2 text-sm mb-2">
              <input
                type="checkbox"
                checked={enableSplit}
                onChange={(e) => setEnableSplit(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              Ratear entre membros da família
            </label>

            {enableSplit && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Valor total: R$ {totalAmount.toFixed(2)} — {members.length} membro(s) — R$ {splitAmount.toFixed(2)} cada
                </p>
                {members.map((m, idx) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <span className="text-sm flex-1">{m.name}</span>
                    <Controller
                      name={`splitMembers.${idx}.amount`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          className="w-28 h-8 text-xs"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      )}
                    />
                  </div>
                ))}
              </div>
            )}
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
