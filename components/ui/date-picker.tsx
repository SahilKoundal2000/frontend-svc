"use client";

import * as React from "react";
import { format, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DateValue = Date | string | undefined;

export function DatePicker({
  value,
  onChange,
}: {
  value: DateValue;
  onChange: (date: DateValue) => void;
}) {
  const getDateValue = (val: DateValue): Date | undefined => {
    if (!val) return undefined;
    if (val instanceof Date) return val;

    const parsedDate = new Date(val);
    return isValid(parsedDate) ? parsedDate : undefined;
  };

  const dateValue = getDateValue(value);

  const handleSelect = (date: Date | undefined) => {
    if (typeof value === "string" && date) {
      try {
        const formatStr = value.includes("T")
          ? "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
          : "yyyy-MM-dd";
        onChange(format(date, formatStr));
      } catch {
        onChange(date.toISOString());
      }
    } else {
      onChange(date);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !dateValue && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? format(dateValue, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
