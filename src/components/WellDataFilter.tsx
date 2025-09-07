'use client';
import { useState, useEffect } from 'react';
import type { Well, WellDataRow } from '../types/well';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface WellDataFilterProps {
  well: Well;
  onFilterChange: (filteredData: WellDataRow[]) => void;
  selectedColumn: keyof WellDataRow | '';
  setSelectedColumn: React.Dispatch<React.SetStateAction<keyof WellDataRow | ''>>;
  minValue: number | '';
  setMinValue: React.Dispatch<React.SetStateAction<number | ''>>;
  maxValue: number | '';
  setMaxValue: React.Dispatch<React.SetStateAction<number | ''>>;
  onClose?: () => void;
}

export default function WellDataFilter({
  well,
  onFilterChange,
  selectedColumn,
  setSelectedColumn,
  minValue,
  setMinValue,
  maxValue,
  setMaxValue,
  onClose,
}: WellDataFilterProps) {
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    if (well?.data?.length) {
      const firstRow = well.data.find((row) => row && Object.keys(row).length > 1);
      if (firstRow) {
        const keys = Object.keys(firstRow)
          .filter((k) => k !== 'DEPTH')
          .map((k) => k.trim().replace('%', ''));
        setColumns(keys);
        if (!selectedColumn) setSelectedColumn((keys[0] || '') as keyof WellDataRow | '');
      }
    }
  }, [well, selectedColumn, setSelectedColumn]);

  const handleFilter = () => {
    if (!selectedColumn) {
      toast.error('Please select a column to filter.');
      return;
    }
    if (minValue === '' && maxValue === '') {
      toast.error('Please enter at least Min or Max value.');
      return;
    }
    if (minValue !== '' && maxValue !== '' && minValue > maxValue) {
      toast.error('Min cannot be greater than Max.');
      return;
    }

    const dataArray = Array.isArray(well.data) ? well.data : JSON.parse(well.data || '[]');

const filtered = dataArray.filter((d: WellDataRow) => {
      const val = Number(d[selectedColumn]);
      if (isNaN(val)) return false;
      const minCheck = minValue !== '' ? val >= minValue : true;
      const maxCheck = maxValue !== '' ? val <= maxValue : true;
      return minCheck && maxCheck;
    });

    onFilterChange(filtered);
    onClose?.();
  };

  const handleReset = () => {
  setSelectedColumn((columns[0] as keyof WellDataRow) || '');
  setMinValue('');
  setMaxValue('');
  onFilterChange(well.data || []);
};


  return (
    <div className="flex flex-col gap-4">
      {/* First row: Select */}
      <div className="w-full">
        <Select value={selectedColumn} onValueChange={(val) => setSelectedColumn(val as keyof WellDataRow)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent>
            {columns.length === 0 ? (
              <SelectItem value="">No columns</SelectItem>
            ) : (
              columns.map((col) => <SelectItem key={col} value={col}>{col}</SelectItem>)
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Second row: Min/Max inputs */}
      <div className="flex gap-2 w-full">
        <Input
          type="number"
          placeholder="Min"
          value={minValue}
          onChange={(e) => setMinValue(e.target.value ? Number(e.target.value) : '')}
          className="w-1/2"
        />
        <Input
          type="number"
          placeholder="Max"
          value={maxValue}
          onChange={(e) => setMaxValue(e.target.value ? Number(e.target.value) : '')}
          className="w-1/2"
        />
      </div>

      {/* Third row: Buttons */}
      <div className="flex gap-2 w-full">
        <Button onClick={handleFilter} className="flex-1">
          Apply
        </Button>
        <Button onClick={handleReset} variant="outline" className="flex-1">
          Reset
        </Button>
      </div>
    </div>

  );
}
