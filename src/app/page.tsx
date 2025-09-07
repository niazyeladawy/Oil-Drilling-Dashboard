'use client';
import { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import type { Well, WellDataRow } from '../types/well';
import WellDetails from '../components/WellDetails';
import Controls from '@/components/Controls';
import { FilterDialog } from '@/components/FilterDialog';
import { SidebarTrigger } from '@/components/ui/sidebar';
import ChatbotSidebar from '@/components/ChatbotSidebar';

export default function DashboardPage() {
  const [openTabs, setOpenTabs] = useState<Well[]>([]);
  const [activeTabId, setActiveTabId] = useState<number | null>(null);

  const [filterKey, setFilterKey] = useState<keyof WellDataRow | ''>('');
  const [filterValue, setFilterValue] = useState('');
  const [filteredData, setFilteredData] = useState<WellDataRow[] | null>(null);

  const handleSelectWell = (well: Well) => {
    const parsedWell: Well = {
      ...well,
      data: Array.isArray(well.data) ? well.data : JSON.parse(well.data || '[]'),
    };

    if (!openTabs.find(t => t.id === parsedWell.id)) {
      setOpenTabs([...openTabs, parsedWell]);
    }
    setActiveTabId(parsedWell.id);
  };

  const closeTab = (id: number) => {
    setOpenTabs(prev => prev.filter(t => t.id !== id));
    if (activeTabId === id) {
      setActiveTabId(openTabs.length ? openTabs[0].id : null);
    }
  };


  const activeWell = openTabs.find(t => t.id === activeTabId);
  const displayedWell = useMemo(() => {
    if (!activeWell) return null;
    return {
      ...activeWell,
      data: filteredData ?? activeWell.data
    };
  }, [activeWell, filteredData]);
  const filteredWell = useMemo(() => {
    if (!activeWell || !filterKey || !filterValue) return activeWell;
    return {
      ...activeWell,
      data: activeWell.data.filter(item => {
        const itemValue = item[filterKey];
        return itemValue != null && itemValue.toString().includes(filterValue);
      }),
    };
  }, [activeWell, filterKey, filterValue]);

  return (
    <div className="flex min-h-[calc(100vh-60px)] overflow-clip w-full">
      {/* Sidebar */}
      <Sidebar onSelect={handleSelectWell} />
      <SidebarTrigger />
      {/* Main content (tabs + charts) */}
      <div className="flex-1 flex flex-col px-4 overflow-auto">
        {/* Tabs */}
        <div className="flex space-x-2 border-b items-center py-2">
          <div className='flex items-center whitespace-nowrap overflow-auto gap-2'>
            {openTabs.map(tab => (
              <div
                key={tab.id}
                className="flex items-center  cursor-pointer"
                onClick={() => setActiveTabId(tab.id)}
              >
                <span
                  className={`border-b-2 block px-4 py-2 ${activeTabId === tab.id ? 'border-blue-500 font-bold text-blue-600' : 'border-transparent text-gray-700'
                    }`}
                >
                  {tab.name}
                </span>
                <button
                  className="ml-2 text-red-500 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                >
                  ×
                </button>
              </div>


            ))}
          </div>

          <div className="ms-auto flex items-center space-x-2">

            {activeWell && (
              <FilterDialog
                well={activeWell}
                onFilterChange={(filtered) => setFilteredData(filtered)}
              />
            )}
            <Controls />
          </div>
        </div>

        {/* Active tab content */}
        <div className="mt-4 flex-1 overflow-auto">
          {activeTabId && filteredWell ? (
            <WellDetails well={displayedWell} />
          ) : (
            <p className="text-gray-500">Select a well from the sidebar to view details.</p>
          )}
        </div>
      </div>

      {/* Chatbot as direct child of flex container */}
      {/* {activeTabId && filteredWell && (
        <div className="w-80 bg-gray-50 p-4 rounded shadow sticky top-4 h-[calc(100vh-80px)] overflow-auto ">
          <Chatbot wellData={filteredWell.data} />
        </div>
      )} */}
      <ChatbotSidebar activeTabId={activeTabId} filteredWell={filteredWell} />
    </div>
  );
}
