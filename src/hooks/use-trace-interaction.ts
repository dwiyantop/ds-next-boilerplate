'use client';

import { useTraceInteraction as useTraceInteractionContext } from '@/app/providers';

export const useTraceInteraction = () => useTraceInteractionContext();
