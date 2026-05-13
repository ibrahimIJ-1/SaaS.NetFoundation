"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LookupInputProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
}

export function LookupInput({
  options,
  value,
  onChange,
  placeholder = "اختر من القائمة...",
  emptyText = "لا توجد نتائج. اضغط Enter للإضافة كجديد",
  className,
}: LookupInputProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const filteredOptions = options.filter((o) =>
    o.toLowerCase().includes(inputValue.toLowerCase()),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-right font-normal h-10",
            className,
          )}
        >
          {value || (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command dir="rtl">
          <CommandInput
            placeholder={placeholder}
            value={inputValue}
            onValueChange={setInputValue}
            className="text-right"
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                inputValue &&
                !filteredOptions.includes(inputValue)
              ) {
                onChange(inputValue);
                setOpen(false);
              }
            }}
          />
          <CommandList>
            <CommandEmpty className="py-6 text-center text-sm">
              <p className="text-muted-foreground mb-2">{emptyText}</p>
              {inputValue && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-2"
                  onClick={() => {
                    onChange(inputValue);
                    setOpen(false);
                  }}
                >
                  <Plus className="w-3 h-3" />
                  إضافة "{inputValue}" كجديد
                </Button>
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  className="text-right flex justify-between items-center"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
