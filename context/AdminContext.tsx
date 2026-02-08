import React, { createContext, useContext, useRef, useState } from 'react';
import { Alert } from 'react-native';
import AdminPinModal from '../components/AdminPinModel';

type AdminContextType = {
  requireAdmin: (action: () => void | Promise<void>) => void;
};

const AdminContext = createContext<AdminContextType | null>(null);

const ADMIN_PIN = '1234';

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const pendingAction = useRef<null | (() => void | Promise<void>)>(null);

  const requireAdmin = (action: () => void | Promise<void>) => {
    pendingAction.current = action;
    setVisible(true);
  };

  const handleConfirm = async (pin: string) => {
    if (pin === ADMIN_PIN) {
      setVisible(false);
      await pendingAction.current?.();
      pendingAction.current = null;
    } else {
      Alert.alert('Access denied', 'Incorrect PIN');
    }
  };

  return (
    <AdminContext.Provider value={{ requireAdmin }}>
      {children}

      <AdminPinModal
        visible={visible}
        onCancel={() => setVisible(false)}
        onConfirm={handleConfirm}
      />
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider');
  return ctx;
}
