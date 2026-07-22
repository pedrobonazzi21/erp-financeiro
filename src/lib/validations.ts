import { z } from "zod"

export const incomeSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  subcategoryId: z.string().optional(),
  amount: z.string().min(1, "Valor é obrigatório"),
  receivedDate: z.string().optional(),
  accountId: z.string().min(1, "Conta é obrigatória"),
  memberId: z.string().min(1, "Responsável é obrigatório"),
  costCenterId: z.string().optional(),
  recurring: z.boolean().optional(),
})

export type IncomeFormData = z.infer<typeof incomeSchema>

export const expenseSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  amount: z.string().min(1, "Valor é obrigatório"),
  paidDate: z.string().optional(),
  accountId: z.string().optional(),
  creditCardId: z.string().optional(),
  paymentMethodId: z.string().min(1, "Forma de pagamento é obrigatória"),
  memberId: z.string().min(1, "Responsável é obrigatório"),
  costCenterId: z.string().optional(),
  installments: z.string(),
  paymentType: z.enum(["account", "credit"]),
  splitMembers: z.array(z.object({
    memberId: z.string(),
    amount: z.number().min(0),
  })).optional(),
})

export type ExpenseFormData = z.infer<typeof expenseSchema>
