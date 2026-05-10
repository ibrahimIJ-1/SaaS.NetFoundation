"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingService } from "@/services/billing.service";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Receipt, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Invoice, PaymentMethod, RecordPaymentDto } from "@/types/billing";

interface Props {
  patientId: string;
}

export default function BillingTab({ patientId }: Props) {
  const queryClient = useQueryClient();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [newItem, setNewItem] = useState({ description: "", unitPrice: "" });
  const [invoiceItems, setInvoiceItems] = useState<{ description: string; quantity: number; unitPrice: number }[]>([]);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["ledger", patientId],
    queryFn: () => billingService.getPatientLedger(patientId),
  });

  const payMutation = useMutation({
    mutationFn: (data: RecordPaymentDto) => billingService.recordPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger", patientId] });
      toast.success("Payment recorded successfully");
      setIsPayModalOpen(false);
      setPaymentAmount("");
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (data: any) => billingService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger", patientId] });
      toast.success("Invoice created successfully");
      setIsCreateModalOpen(false);
      setInvoiceItems([]);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "PartiallyPaid": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Unpaid": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const handleOpenPay = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.balance.toString());
    setIsPayModalOpen(true);
  };

  const handleRecordPayment = () => {
    if (!selectedInvoice || !paymentAmount) return;
    payMutation.mutate({
      invoiceId: selectedInvoice.id,
      amount: parseFloat(paymentAmount),
      method: paymentMethod,
    });
  };

  const addItem = () => {
    if (!newItem.description || !newItem.unitPrice) return;
    setInvoiceItems([...invoiceItems, { 
      description: newItem.description, 
      quantity: 1, 
      unitPrice: parseFloat(newItem.unitPrice) 
    }]);
    setNewItem({ description: "", unitPrice: "" });
  };

  const handleCreateInvoice = () => {
    if (invoiceItems.length === 0) return;
    createInvoiceMutation.mutate({
      patientId,
      items: invoiceItems,
    });
  };

  if (isLoading) return <div>Loading ledger...</div>;

  const { data: insurancePolicies } = useQuery({
    queryKey: ["insurance-policies", patientId],
    queryFn: () => billingService.getInsurancePolicies(patientId),
  });

  const totalOutstanding = invoices?.reduce((sum, inv) => sum + inv.balance, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Outstanding Balance</CardDescription>
            <CardTitle className="text-2xl font-bold text-red-400">
              ${totalOutstanding.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Total Billed</CardDescription>
            <CardTitle className="text-2xl font-bold text-slate-100">
              ${invoices?.reduce((sum, inv) => sum + inv.totalAmount, 0).toFixed(2) || "0.00"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Total Paid</CardDescription>
            <CardTitle className="text-2xl font-bold text-teal-400">
              ${invoices?.reduce((sum, inv) => sum + inv.paidAmount, 0).toFixed(2) || "0.00"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Insurance Credits</CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-400">
              $0.00
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Financial History - 2 Columns */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-slate-200">Financial History</h3>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </Button>
          </div>
            
          {!invoices || invoices.length === 0 ? (
            <Card className="bg-slate-900 border-slate-800 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Receipt className="w-12 h-12 text-slate-700 mb-4" />
                <p className="text-slate-400">No invoices or payments found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-800 rounded-lg">
                          <Receipt className="w-6 h-6 text-teal-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-100">{invoice.invoiceNumber}</span>
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Generated on {format(new Date(invoice.createdAt), "dd MMM yyyy")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Total</p>
                          <p className="font-bold text-slate-100 text-sm">${invoice.totalAmount.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Balance</p>
                          <p className={`font-bold text-sm ${invoice.balance > 0 ? 'text-red-400' : 'text-teal-400'}`}>
                            ${invoice.balance.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {invoice.balance > 0 && (
                            <Button 
                              size="sm" 
                              className="h-8 bg-teal-600 hover:bg-teal-500 text-white text-xs"
                              onClick={() => handleOpenPay(invoice)}
                            >
                              Pay
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="h-8 border-slate-700 text-slate-300 text-xs">
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {invoice.payments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-800">
                        <p className="text-[10px] uppercase text-slate-500 mb-2 font-bold">Recent Payments</p>
                        <div className="space-y-2">
                          {invoice.payments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between text-xs text-slate-400">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-teal-500" />
                                <span>{payment.method} Payment</span>
                                {payment.transactionId && <span className="text-[10px] text-slate-600 font-mono">({payment.transactionId})</span>}
                              </div>
                              <span>{format(new Date(payment.date), "dd MMM yyyy")} • <span className="text-slate-200">${payment.amount.toFixed(2)}</span></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Insurance & Policies - 1 Column */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-slate-200">Insurance</h3>
            <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300 text-xs p-0 h-auto">
              <Plus className="w-3 h-3 mr-1" /> Add
            </Button>
          </div>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-0">
              {!insurancePolicies || insurancePolicies.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <ShieldCheck className="w-10 h-10 text-slate-800 mx-auto" />
                  <div>
                    <p className="text-sm text-slate-300 font-medium">No Active Policy</p>
                    <p className="text-xs text-slate-500 mt-1">Add patient insurance details to track coverage and claims.</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-slate-800 text-xs">
                    Link Insurance
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {insurancePolicies.map((policy) => (
                    <div key={policy.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-500/10 rounded">
                            <Building2 className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-100">{policy.providerName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">#{policy.policyNumber}</p>
                          </div>
                        </div>
                        <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20 text-[10px]">
                          ACTIVE
                        </Badge>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-500 uppercase font-bold tracking-tight">Coverage</span>
                          <span className="text-slate-200 font-medium">{policy.coveragePercentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${policy.coveragePercentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] pt-1">
                        <div className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3 h-3" />
                          <span>Exp: {policy.endDate ? format(new Date(policy.endDate), "dd/MM/yyyy") : "No expiry"}</span>
                        </div>
                        <span className="text-slate-300">${policy.usedLimit} / ${policy.yearlyLimit} used</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-2">
            <Button variant="outline" className="w-full justify-start text-xs border-slate-800 text-slate-400 hover:text-slate-100">
              <ArrowRight className="w-3 h-3 mr-2 text-teal-500" />
              Download Financial Statement
            </Button>
            <Button variant="outline" className="w-full justify-start text-xs border-slate-800 text-slate-400 hover:text-slate-100">
              <ArrowRight className="w-3 h-3 mr-2 text-teal-500" />
              Submit Insurance Claim
            </Button>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription className="text-slate-400">
              Record a payment for invoice {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Amount to Pay ($)</Label>
              <Input 
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="bg-slate-950 border-slate-800 text-xl font-bold text-teal-400"
              />
              <p className="text-xs text-slate-500">Remaining balance: ${selectedInvoice?.balance.toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Payment Method</Label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="BankTransfer">Bank Transfer</option>
                <option value="Insurance">Insurance</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPayModalOpen(false)} className="border-slate-800 text-slate-300">
              Cancel
            </Button>
            <Button 
              onClick={handleRecordPayment}
              disabled={!paymentAmount || payMutation.isPending}
              className="bg-teal-600 hover:bg-teal-500 text-white"
            >
              {payMutation.isPending ? "Recording..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-50">
          <DialogHeader>
            <DialogTitle>Create Manual Invoice</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add custom items to generate a new invoice for this patient.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Description</Label>
                <Input 
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="e.g. Tooth Whitening"
                  className="bg-slate-950 border-slate-800"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Price ($)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                    placeholder="0.00"
                    className="bg-slate-950 border-slate-800"
                  />
                  <Button type="button" size="icon" onClick={addItem} className="bg-teal-600 hover:bg-teal-500 shrink-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Invoice Items</Label>
              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800">
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoiceItems.map((item, i) => (
                      <TableRow key={i} className="border-slate-800">
                        <TableCell className="text-slate-300">{item.description}</TableCell>
                        <TableCell className="text-right text-slate-100 font-medium">${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => setInvoiceItems(invoiceItems.filter((_, idx) => idx !== i))}
                          >
                            ×
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {invoiceItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-slate-500 text-sm italic">
                          No items added yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-slate-400">Total Amount:</span>
              <span className="text-xl font-bold text-slate-100">
                ${invoiceItems.reduce((sum, i) => sum + i.unitPrice, 0).toFixed(2)}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="border-slate-800 text-slate-300">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateInvoice}
              disabled={invoiceItems.length === 0 || createInvoiceMutation.isPending}
              className="bg-teal-600 hover:bg-teal-500 text-white"
            >
              {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
