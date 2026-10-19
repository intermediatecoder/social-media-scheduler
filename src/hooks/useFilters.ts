import { useSearchParams } from 'react-router-dom';
import { ALL_PLATFORMS, Platform, PostStatus } from '../types';

export interface Filters {
  platforms: Platform[];
  statuses: PostStatus[];
  query: string;
}

const ALL_STATUSES: PostStatus[] = ['scheduled', 'published', 'failed'];

function getValidValues<T extends string>(values: string[], allowedValues: T[]): T[] {
  if (values.length === 0) return [];
  const allowed = new Set<string>(allowedValues);
  return [...new Set(
    values
      .flatMap((value) => value.split(','))
      .filter((item): item is T => allowed.has(item))
  )];
}

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const platforms = getValidValues(searchParams.getAll('platform'), ALL_PLATFORMS);
  const statuses = getValidValues(searchParams.getAll('status'), ALL_STATUSES);

  const query = searchParams.get('q') || '';

  const setFilters = (updates: Partial<Filters>) => {
    setSearchParams(
      (prev: URLSearchParams) => {
        const params = new URLSearchParams(prev);

        if (updates.platforms !== undefined) {
          const selectedPlatforms = [...new Set(updates.platforms)];
          params.delete('platform');
          selectedPlatforms.forEach((platform) => params.append('platform', platform));
        }

        if (updates.statuses !== undefined) {
          const selectedStatuses = [...new Set(updates.statuses)];
          params.delete('status');
          selectedStatuses.forEach((status) => params.append('status', status));
        }

        if (updates.query !== undefined) {
          if (updates.query) {
            params.set('q', updates.query);
          } else {
            params.delete('q');
          }
        }

        return params;
      },
      { replace: true }
    );
  };

  const clearFilters = () => {
    setSearchParams(
      (prev: URLSearchParams) => {
        const params = new URLSearchParams(prev);
        params.delete('platform');
        params.delete('status');
        params.delete('q');
        return params;
      },
      { replace: true }
    );
  };

  const hasActiveFilters = platforms.length > 0 || statuses.length > 0 || query.length > 0;

  return { platforms, statuses, query, setFilters, clearFilters, hasActiveFilters };
}
