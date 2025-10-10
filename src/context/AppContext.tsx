import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, LostItem, Claim, ActivityLog } from '../types';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  items: LostItem[];
  setItems: (items: LostItem[]) => void;
  claims: Claim[];
  setClaims: (claims: Claim[]) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  selectedItem: LostItem | null;
  setSelectedItem: (item: LostItem | null) => void;
  activityLogs: ActivityLog[];
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const [items, setItems] = useState<LostItem[]>([
    {
      id: '1',
      itemType: 'Wallet',
      location: 'Library - 2nd Floor',
      dateFound: '2025-10-01',
      timeFound: '14:30',
      photoUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
      securityQuestions: [
        { question: 'What color is the wallet?', answer: 'brown' },
        { question: 'What brand is it?', answer: 'fossil' }
      ],
      reportedBy: 'user1',
      status: 'verified',
      reportedAt: '2025-10-01T14:35:00Z'
    },
    {
      id: '2',
      itemType: 'Phone',
      location: 'Cafeteria',
      dateFound: '2025-10-02',
      timeFound: '10:15',
      photoUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
      securityQuestions: [
        { question: 'What is the phone model?', answer: 'iphone 13' },
        { question: 'What color is the phone case?', answer: 'blue' }
      ],
      reportedBy: 'user2',
      status: 'verified',
      reportedAt: '2025-10-02T10:20:00Z'
    },
    {
      id: '3',
      itemType: 'ID Card',
      location: 'Gym',
      dateFound: '2025-10-02',
      timeFound: '16:00',
      photoUrl: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=400',
      securityQuestions: [
        { question: 'What is your student number?', answer: '2021-00123' }
      ],
      reportedBy: 'user1',
      status: 'verified',
      reportedAt: '2025-10-02T16:05:00Z'
    }
  ]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      timestamp: '2025-10-01T14:35:00Z',
      userId: 'user1',
      userName: 'John Doe',
      action: 'item_reported',
      itemId: '1',
      itemType: 'Wallet',
      details: 'Reported found item: Wallet at Library - 2nd Floor'
    },
    {
      id: '2',
      timestamp: '2025-10-01T14:40:00Z',
      userId: 'admin1',
      userName: 'Guard Admin',
      action: 'item_verified',
      itemId: '1',
      itemType: 'Wallet',
      details: 'Verified item report for Wallet'
    },
    {
      id: '3',
      timestamp: '2025-10-02T10:20:00Z',
      userId: 'user2',
      userName: 'Jane Smith',
      action: 'item_reported',
      itemId: '2',
      itemType: 'Phone',
      details: 'Reported found item: Phone at Cafeteria'
    }
  ]);

  const addActivityLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        items,
        setItems,
        claims,
        setClaims,
        currentPage,
        setCurrentPage,
        selectedItem,
        setSelectedItem,
        activityLogs,
        addActivityLog
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
