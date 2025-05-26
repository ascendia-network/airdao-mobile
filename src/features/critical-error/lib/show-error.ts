import { useErrorStore } from '../model/store';

export function showCriticalError({
  title,
  message
}: {
  title: string;
  message: string;
}) {
  useErrorStore.getState().setError({ title, message });
}
