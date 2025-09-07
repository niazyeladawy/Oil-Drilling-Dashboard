'use client';
import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface UploadSheetDetail {
  sheet: string;
  inserted: boolean;
  reason?: string;
}
export default function UploadWellData() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Upload failed');

      return data;
    },
    onMutate: () => setLoading(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['wells']);

      // Show general success toast
      toast.success(data.message || 'File uploaded successfully!');

      // Show schema-specific warnings
      if (data.details) {
        (data.details as UploadSheetDetail[]).forEach((sheet) => {
          if (!sheet.inserted) {
            toast.error(`Sheet "${sheet.sheet}" skipped: ${sheet.reason}`);
          }
        });
      }
    },
    onSettled: () => setLoading(false),
    onError: (err: unknown) => {
      if (err instanceof Error) {
        toast.error(err.message || 'Upload failed. Please try again.');
      } else {
        toast.error('Upload failed. Please try again.');
      }
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file);
  };

  const handleButtonClick = () => fileInputRef.current?.click();

  return (
    <div>
      <input
        type="file"
        accept=".xlsx"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
        disabled={loading}
      />

      <Button
        onClick={handleButtonClick}
        variant="default"
        size="default"
        className="flex items-center space-x-1"
        disabled={loading}
      >
        <Upload size={20} />
        <span>{loading ? 'Uploading...' : 'Upload'}</span>
      </Button>
    </div>
  );
}
