import { MaterialIcons } from '@expo/vector-icons';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Text, View } from 'react-native';

const ToastContext = createContext<(message: string) => void>(() => undefined);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((next: string) => {
    setMessage(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2600);
  }, []);

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      <View className="flex-1">
        {children}
        {message ? (
          <View pointerEvents="none" className="absolute left-6 right-6 top-24 z-50 items-center">
            <View className="flex-row items-center gap-2 rounded-full bg-inverse px-4 py-2.5">
              <MaterialIcons color="#a2f3d6" name="check-circle" size={16} />
              <Text className="max-w-[260px] text-[13px] text-inverse-ink">{message}</Text>
            </View>
          </View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}
