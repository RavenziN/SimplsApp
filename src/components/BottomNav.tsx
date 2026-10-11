import React, { useEffect, useState } from 'react';
import { CalendarDays, Target, Wind, User } from 'lucide-react';
import { ActiveTab, User as UserType } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  user?: UserType;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab, user }) => {
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    setPhotoFailed(false);
  }, [user?.photoUrl]);

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'agenda',
      label: 'Agenda',
      icon: <CalendarDays className="w-5 h-5 stroke-[2]" />,
    },
    {
      id: 'foco',
      label: 'Foco',
      icon: <Target className="w-5 h-5 stroke-[2]" />,
    },
    {
      id: 'respirar',
      label: 'Respirar',
      icon: <Wind className="w-5 h-5 stroke-[2]" />,
    },
    {
      id: 'ajustes',
      label: 'Conta',
      icon: <User className="w-5 h-5 stroke-[2]" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#E5E5E5] dark:border-[#262626] pb-safe">
      <div className="max-w-2xl mx-auto grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                isActive
                  ? 'text-[#0A0A0A] dark:text-white'
                  : 'text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white'
              }`}
            >
              <div
                className={`transition-transform duration-200 flex items-center justify-center ${
                  isActive ? 'scale-110' : ''
                }`}
              >
                {tab.id === 'ajustes' && user?.photoUrl && !photoFailed ? (
                  <div className={`w-6 h-6 rounded-full overflow-hidden border-2 shadow-xs ${isActive ? 'border-[#0A0A0A] dark:border-white ring-1 ring-[#0A0A0A] dark:ring-white' : 'border-neutral-300 dark:border-neutral-700'}`}>
                    <img
                      src={user.photoUrl}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      onError={() => setPhotoFailed(true)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  tab.icon
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 transition-all ${
                  isActive ? 'font-bold text-[#0A0A0A] dark:text-white' : 'font-medium text-[#737373] dark:text-neutral-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
