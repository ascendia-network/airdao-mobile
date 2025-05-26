import { useErrorStore } from '@entities/global-error/model/store';

export function showCriticalError({
  title,
  message
}: {
  title: string;
  message: string;
}) {
  useErrorStore.getState().setError({ title, message });
}
