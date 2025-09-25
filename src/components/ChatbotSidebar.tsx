'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Chatbot from './Chatbot';
import { Menu } from 'lucide-react';
import { DialogHeader, DialogTitle } from './ui/dialog';
import { Well } from '@/types/well';

interface ChatbotSidebarProps {
  activeTabId?: number | null;
  filteredWell?: Well | null; // use the Well type
}

export default function ChatbotSidebar({ activeTabId, filteredWell }: ChatbotSidebarProps) {
  const [open, setOpen] = useState(false);

  if (!activeTabId || !filteredWell) return null;

  return (
    <>
      {/* Desktop Chatbot */}
      <div className="hidden lg:block w-80 bg-gray-50 p-4 rounded shadow sticky top-4 h-[calc(100vh-80px)] overflow-auto">
        <Chatbot wellData={filteredWell.data} />
      </div>

      {/* Mobile Chatbot as Sheet */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="default" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent  >
            <DialogHeader>
              <DialogTitle className='p-4' >Chatbot</DialogTitle>
            </DialogHeader>
            <div className="p-4 h-full flex flex-col">
              
              <div className="flex-1 overflow-auto">
                <Chatbot wellData={filteredWell.data} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
