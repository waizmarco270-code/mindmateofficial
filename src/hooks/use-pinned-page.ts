
'use client';
import { useLocalStorage } from './use-local-storage';

const PINNED_PAGE_KEY = 'pinned-dashboard-page';

export const usePinnedPage = () => {
    const [pinnedPage, setPinnedPage] = useLocalStorage<string | null>(PINNED_PAGE_KEY, null);

    return {
        pinnedPage,
        setPinnedPage
    };
};
