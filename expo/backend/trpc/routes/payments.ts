import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";
import {
  getPaymentConfig,
  savePaymentConfig,
  getAllTransactions,
  createTransaction,
  updateTransactionStatus,
} from "../data-store";

const bankAccountSchema = z.object({
  bankName: z.string().min(1),
  accountNumber: z.string().min(1),
  accountHolder: z.string().min(1),
  branchCode: z.string().optional(),
  swiftCode: z.string().optional(),
});

const mobileMoneyAccountSchema = z.object({
  provider: z.string().min(1),
  number: z.string().min(1),
  accountName: z.string().min(1),
});

export const paymentsRouter = createTRPCRouter({
  // ── Payment config (admin) ──────────────────────────────────
  getConfig: publicProcedure.query(async () => {
    const config = await getPaymentConfig();
    return config ?? {
      id: "",
      operationalAccount: { bankName: "", accountNumber: "", accountHolder: "" },
      profitAccount: { bankName: "", accountNumber: "", accountHolder: "" },
      mobileMoneyAccounts: [],
      updatedAt: "",
    };
  }),

  saveConfig: publicProcedure
    .input(
      z.object({
        operationalAccount: bankAccountSchema,
        profitAccount: bankAccountSchema,
        mobileMoneyAccounts: z.array(mobileMoneyAccountSchema),
      }),
    )
    .mutation(async ({ input }) => {
      const config = await savePaymentConfig(input);
      return { success: true, config };
    }),

  // ── Transactions ───────────────────────────────────────────
  getTransactions: publicProcedure
    .input(z.object({ limit: z.number().default(50) }).optional())
    .query(async ({ input }) => {
      return getAllTransactions(input?.limit);
    }),

  createTransaction: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        userEmail: z.string(),
        userName: z.string(),
        planId: z.string(),
        planName: z.string(),
        amountUSD: z.number(),
        amountLocal: z.string(),
        currencyCode: z.string(),
        paymentMethod: z.enum(["mobile_money", "bank_transfer", "debit_card"]),
        status: z.enum(["pending", "completed", "failed", "refunded"]).default("pending"),
        details: z.string().default("{}"),
      }),
    )
    .mutation(async ({ input }) => {
      const tx = await createTransaction(input);
      return { success: true, transaction: tx };
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["pending", "completed", "failed", "refunded"]),
      }),
    )
    .mutation(async ({ input }) => {
      const ok = await updateTransactionStatus(input.id, input.status);
      if (!ok) return { success: false, error: "Transaction not found" };
      return { success: true };
    }),
});
