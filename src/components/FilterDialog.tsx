import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import WellDataFilter from "../components/WellDataFilter";
import type { Well, WellDataRow } from "../types/well";
import { useState } from "react";

interface FilterDialogProps {
  well: Well;
  onFilterChange: (filtered: WellDataRow[]) => void;
  onClose?: (filter: {
    selectedColumn: keyof WellDataRow | '';
    minValue: number | '';
    maxValue: number | '';
  }) => void; // optional callback when dialog closes
}
export function FilterDialog({ well, onFilterChange, onClose }: FilterDialogProps) {
const [selectedColumn, setSelectedColumn] = useState<keyof WellDataRow | ''>('');
  const [minValue, setMinValue] = useState<number | ''>('');
  const [maxValue, setMaxValue] = useState<number | ''>('');
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
    // Pass filter values to parent or ORM
    onClose?.({ selectedColumn, minValue, maxValue });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Filter</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Well Data</DialogTitle>
          <p className="text-sm text-gray-500">
            Use the filter to display specific data from the selected well.
          </p>
        </DialogHeader>

        <div className="mt-2">
          <WellDataFilter
            well={well}
            onFilterChange={onFilterChange}
            selectedColumn={selectedColumn}
            setSelectedColumn={setSelectedColumn}
            minValue={minValue}
            setMinValue={setMinValue}
            maxValue={maxValue}
            setMaxValue={setMaxValue}
            onClose={handleClose} // pass handleClose
          />
        </div>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
