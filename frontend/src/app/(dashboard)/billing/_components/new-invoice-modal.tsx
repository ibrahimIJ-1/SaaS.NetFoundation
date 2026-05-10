"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientsService } from "@/services/patients.service";
import { billingService } from "@/services/billing.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Search, User, Plus, X, Receipt } from "lucide-react";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewInvoiceModal({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; fullName: string } | null>(null);
  const [newItem, setNewItem] = useState({ description: "", unitPrice: "" });
  const [invoiceItems, setInvoiceItems] = useState<{ description: string; quantity: number; unitPrice: number }[]>([]);

  const { data: patients } = useQuery({
    queryKey: ["patients", patientSearch],
    queryFn: () => patientsService.getAll(),
    enabled: step === 1 && patientSearch.length > 2,
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (data: any) => billingService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-summary"] });
      queryClient.invalidateQueries({ queryKey: ["billing-invoices"] });
      toast.success("Invoice created successfully");
      handleClose();
    },
  });

  const handleClose = () => {
    setStep(1);
    setPatientSearch("");
    setSelectedPatient(null);
    setInvoiceItems([]);
    setNewItem({ description: "", unitPrice: "" });
    onClose();
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

  const handleCreate = () => {
    if (!selectedPatient || invoiceItems.length === 0) return;
    createInvoiceMutation.mutate({
      patientId: selectedPatient.id,
      items: invoiceItems,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-500" />
            Create New Invoice
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {step === 1 ? "Search and select a patient to bill." : `Adding items for ${selectedPatient?.fullName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Patient Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Type name, phone or ID..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="pl-8 bg-slate-950 border-slate-800 focus-visible:ring-teal-500"
                  />
                </div>
              </div>

              {patients && patients.length > 0 && (
                <div className="border border-slate-800 rounded-md bg-slate-950 max-h-48 overflow-y-auto divide-y divide-slate-800">
                  {patients
                    .filter(p => p.fullName.toLowerCase().includes(patientSearch.toLowerCase()))
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-3 cursor-pointer hover:bg-slate-800 flex items-center justify-between group transition-colors"
                        onClick={() => {
                          setSelectedPatient({ id: p.id, fullName: p.fullName });
                          setStep(2);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400 font-bold group-hover:bg-teal-500/20 group-hover:text-teal-400">
                            {p.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-200">{p.fullName}</p>
                            <p className="text-xs text-slate-500">{p.phoneNumber || "No phone"}</p>
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-slate-600 group-hover:text-teal-500" />
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs uppercase font-bold tracking-wider">Description</Label>
                  <Input 
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="e.g. Consultation"
                    className="bg-slate-950 border-slate-800 h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs uppercase font-bold tracking-wider">Price ($)</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number"
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                      placeholder="0.00"
                      className="bg-slate-950 border-slate-800 h-9"
                    />
                    <Button type="button" size="icon" onClick={addItem} className="bg-teal-600 hover:bg-teal-500 h-9 w-9 shrink-0">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 bg-slate-900/50">
                      <TableHead className="h-9 text-xs">Item</TableHead>
                      <TableHead className="text-right h-9 text-xs">Price</TableHead>
                      <TableHead className="h-9 w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoiceItems.map((item, i) => (
                      <TableRow key={i} className="border-slate-800">
                        <TableCell className="py-2 text-sm text-slate-300">{item.description}</TableCell>
                        <TableCell className="py-2 text-right text-sm text-slate-100 font-medium">${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="py-2 text-right">
                          <button 
                            type="button"
                            className="text-slate-600 hover:text-red-400 transition-colors"
                            onClick={() => setInvoiceItems(invoiceItems.filter((_, idx) => idx !== i))}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {invoiceItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-slate-600 text-sm italic">
                          No items added yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-sm text-slate-400 font-medium">Total Balance Due:</span>
                <span className="text-xl font-bold text-teal-400">
                  ${invoiceItems.reduce((sum, i) => sum + i.unitPrice, 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {step === 2 && (
            <Button 
              variant="outline" 
              onClick={() => setStep(1)} 
              className="border-slate-800 text-slate-300"
              disabled={createInvoiceMutation.isPending}
            >
              Back
            </Button>
          )}
          <Button variant="ghost" onClick={handleClose} className="text-slate-400 hover:text-slate-200">
            Cancel
          </Button>
          {step === 2 && (
            <Button 
              onClick={handleCreate}
              disabled={invoiceItems.length === 0 || createInvoiceMutation.isPending}
              className="bg-teal-600 hover:bg-teal-500 text-white min-w-[120px]"
            >
              {createInvoiceMutation.isPending ? "Generating..." : "Create Invoice"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
