import { memo, ReactNode, CSSProperties, useState, useCallback } from 'react';
import { useVirtualScroll, useVirtualScrollElement } from '@/hooks/useVirtualScroll';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  overscan?: number;
  scrollingDelay?: number;
  onScroll?: (scrollTop: number) => void;
  emptyState?: ReactNode;
  loadingState?: ReactNode;
  isLoading?: boolean;
}

function VirtualListComponent<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className = '',
  overscan = 5,
  scrollingDelay = 150,
  onScroll,
  emptyState,
  loadingState,
  isLoading = false,
}: VirtualListProps<T>) {
  const [scrollElementRef, setScrollElement] = useVirtualScrollElement();
  
  const {
    virtualItems,
    totalHeight,
    scrollTop,
    isScrolling,
    scrollToIndex,
    scrollToTop,
  } = useVirtualScroll(items, {
    itemHeight,
    containerHeight: height,
    overscan,
    scrollingDelay,
  });

  // Handle scroll events
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    onScroll?.(target.scrollTop);
  };

  // Loading state
  if (isLoading && loadingState) {
    return (
      <div 
        className={`relative ${className}`}
        style={{ height }}
      >
        {loadingState}
      </div>
    );
  }

  // Empty state
  if (items.length === 0 && emptyState) {
    return (
      <div 
        className={`relative flex items-center justify-center ${className}`}
        style={{ height }}
      >
        {emptyState}
      </div>
    );
  }

  const containerStyle: CSSProperties = {
    height,
    overflow: 'auto',
    position: 'relative',
  };

  const innerStyle: CSSProperties = {
    height: totalHeight,
    position: 'relative',
  };

  return (
    <div
      ref={setScrollElement}
      className={`virtual-list ${className} ${isScrolling ? 'scrolling' : ''}`}
      style={containerStyle}
      onScroll={handleScroll}
      data-testid="virtual-list"
    >
      <div style={innerStyle}>
        {virtualItems.map(({ index, start, item }) => (
          <div
            key={index}
            className="virtual-list-item"
            style={{
              position: 'absolute',
              top: start,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
            data-index={index}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const VirtualList = memo(VirtualListComponent) as <T>(
  props: VirtualListProps<T>
) => JSX.Element;

// Additional utility components for common use cases

interface VirtualProjectListProps {
  projects: Array<{
    id: string;
    name: string;
    status: string;
    lastDeploy: string;
  }>;
  height: number;
  onProjectSelect: (project: any) => void;
}

export const VirtualProjectList = memo(({ 
  projects, 
  height, 
  onProjectSelect 
}: VirtualProjectListProps) => {
  return (
    <VirtualList
      items={projects}
      height={height}
      itemHeight={120} // Height of ProjectCard
      renderItem={(project, index) => (
        <div 
          className="p-2 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onProjectSelect(project)}
        >
          <div className="bg-card border rounded-lg p-4">
            <div className="font-semibold">{project.name}</div>
            <div className="text-sm text-muted-foreground">
              Status: {project.status}
            </div>
            <div className="text-xs text-muted-foreground">
              Last deploy: {project.lastDeploy}
            </div>
          </div>
        </div>
      )}
      emptyState={
        <div className="text-center text-muted-foreground">
          No projects found
        </div>
      }
      className="border rounded-lg"
    />
  );
});

VirtualProjectList.displayName = 'VirtualProjectList';

// Hook for managing virtual list state
export function useVirtualListState<T>(initialItems: T[] = []) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, []);

  const removeItem = useCallback((predicate: (item: T) => boolean) => {
    setItems(prev => prev.filter(item => !predicate(item)));
  }, []);

  const updateItem = useCallback((predicate: (item: T) => boolean, updater: (item: T) => T) => {
    setItems(prev => prev.map(item => predicate(item) ? updater(item) : item));
  }, []);

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  const loadItems = useCallback(async (loader: () => Promise<T[]>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newItems = await loader();
      setItems(newItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    items,
    isLoading,
    error,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    loadItems,
    setItems,
  };
}