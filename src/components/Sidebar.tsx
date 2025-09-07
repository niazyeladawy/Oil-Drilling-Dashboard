import { useQuery } from '@tanstack/react-query';
import { Well, WellDataRow } from '../types/well';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'; // replace with your actual imports
import { Loader2 } from 'lucide-react';

interface SidebarProps {
  onSelect: (well: Well) => void;
  selectedWellId?: number;
}

export default function AppSidebar({ onSelect, selectedWellId }: SidebarProps) {
  const { data: wells = [], isLoading } = useQuery<Well[]>({
    queryKey: ['wells'],
    queryFn: async () => {
      const res = await fetch('/api/wells');
      const data: Well[] = await res.json();

      return data.map((well) => {
        // Parse the data string safely
        let wellData: WellDataRow[] = [];
        try {
          wellData = JSON.parse(well.data as unknown as string);
        } catch (err) {
          console.error('Failed to parse well data:', err);
        }

        const depths = wellData.map((row) => row.DEPTH ?? 0);
        const maxDepth = depths.length ? Math.max(...depths) : 0;

        return { ...well, depth: maxDepth };
      });
    },
  });

  return (
    <Sidebar className="w-64 border-r border-gray-200 mt-16">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Well List</SidebarGroupLabel>
          <SidebarGroupContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="animate-spin mr-2 h-5 w-5 text-gray-500" />
                <span>Loading wells...</span>
              </div>
            ) : (
              <SidebarMenu>
                {wells.map((well) => {
                  let maxDepth = 0;
                  try {
                    const wellData: WellDataRow[] = JSON.parse(well.data as unknown as string);
                    if (wellData.length > 0) {
                      maxDepth = Math.max(...wellData.map((row) => row.DEPTH ?? 0));
                    }
                  } catch (err) {
                    console.error('Failed to parse well data:', err);
                  }

                  return (
                    <SidebarMenuItem key={well.id}>
                      <SidebarMenuButton
                        asChild
                        className={`justify-between ${selectedWellId === well.id ? 'bg-gray-200 rounded' : 'rounded'
                          } px-2 py-1`}
                        onClick={() => onSelect(well)}
                      >
                        <button className="w-full text-left flex flex-col items-start">
                          <span className="block">{well.name}</span>
                          <span className="text-sm block text-gray-500">{maxDepth} Feat</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
