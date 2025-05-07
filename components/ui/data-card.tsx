import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from './card';
import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

// Discriminated union type para diferentes estados de carregamento
type DataCardStatus<T> = 
  | { status: 'loading' }
  | { status: 'error', error: Error }
  | { status: 'success', data: T };

// Usando generics para tipagem flexível de dados
export interface DataCardProps<T> {
  title: string;
  description?: string;
  className?: string;
  dataState: DataCardStatus<T>;
  renderData: (data: T) => React.ReactNode;
  renderFooter?: (data: T) => React.ReactNode;
  onRefresh?: () => void;
}

// Componente DataCard com tipagem genérica
export function DataCard<T>({ 
  title,
  description,
  className,
  dataState,
  renderData,
  renderFooter,
  onRefresh
}: DataCardProps<T>) {
  // Determine o que renderizar com base no estado
  const renderContent = () => {
    switch (dataState.status) {
      case 'loading':
        return (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        );
      case 'error':
        return (
          <div className="text-destructive flex flex-col items-center py-4">
            <p>Failed to load data</p>
            <p className="text-sm text-muted-foreground">{dataState.error.message}</p>
            {onRefresh && (
              <button 
                onClick={onRefresh}
                className="mt-2 text-sm underline"
              >
                Try again
              </button>
            )}
          </div>
        );
      case 'success':
        return renderData(dataState.data);
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
      {dataState.status === 'success' && renderFooter && (
        <CardFooter className="border-t px-6 py-4">
          {renderFooter(dataState.data)}
        </CardFooter>
      )}
    </Card>
  );
} 