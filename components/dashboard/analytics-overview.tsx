import React from 'react';
import { DataCard, DataCardProps } from '@/components/ui/data-card';
import { useDataFetch, FetchState } from '@/hooks/use-data-fetch';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Tipos para os dados de analytics
interface AnalyticsData {
  dailyActiveUsers: number[];
  revenuePerWeek: number[];
  conversionRate: number;
  dates: string[];
}

// Função mock para buscar dados
const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  // Simulando um atraso de rede
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Dados de exemplo
  return {
    dailyActiveUsers: [120, 145, 132, 158, 180, 176, 190],
    revenuePerWeek: [1200, 1350, 1420, 1680, 1790, 1820, 1950],
    conversionRate: 3.2,
    dates: [
      '2023-09-01', '2023-09-02', '2023-09-03', 
      '2023-09-04', '2023-09-05', '2023-09-06', '2023-09-07'
    ]
  };
};

// Função auxiliar para converter FetchState para DataCardStatus
function mapStateToDataCardState<T>(state: FetchState<T>): DataCardProps<T>['dataState'] {
  if (state.status === 'idle') {
    return { status: 'loading' };
  }
  return state;
}

export function AnalyticsOverview() {
  const [analyticsState, refreshAnalytics] = useDataFetch<AnalyticsData>(fetchAnalyticsData);
  
  // Converter para o formato esperado pelo Recharts
  const getChartData = (data: AnalyticsData) => {
    return data.dates.map((date, index) => ({
      date,
      users: data.dailyActiveUsers[index],
      revenue: data.revenuePerWeek[index],
    }));
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Usuários Ativos Card */}
      <DataCard
        title="Usuários Ativos"
        description="Últimos 7 dias"
        dataState={mapStateToDataCardState(analyticsState)}
        className="md:col-span-2"
        renderData={(data) => (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={getChartData(data)}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )}
        onRefresh={refreshAnalytics}
      />

      {/* Conversão Card */}
      <DataCard
        title="Taxa de Conversão"
        description="Média dos últimos 7 dias"
        dataState={mapStateToDataCardState(analyticsState)}
        renderData={(data) => (
          <div className="flex flex-col items-center justify-center h-[250px]">
            <span className="text-5xl font-bold">{data.conversionRate}%</span>
            <span className="text-muted-foreground mt-2">
              de visitantes para clientes
            </span>
          </div>
        )}
        onRefresh={refreshAnalytics}
      />

      {/* Receita Card */}
      <DataCard
        title="Receita"
        description="Análise semanal"
        dataState={mapStateToDataCardState(analyticsState)}
        className="md:col-span-3"
        renderData={(data) => (
          <Tabs defaultValue="chart">
            <TabsList className="mb-4">
              <TabsTrigger value="chart">Gráfico</TabsTrigger>
              <TabsTrigger value="table">Tabela</TabsTrigger>
            </TabsList>
            <TabsContent value="chart">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={getChartData(data)}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="table">
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left">Data</th>
                      <th className="p-2 text-left">Receita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.dates.map((date, i) => (
                      <tr key={date} className="border-b">
                        <td className="p-2">{date}</td>
                        <td className="p-2">${data.revenuePerWeek[i]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        )}
        onRefresh={refreshAnalytics}
      />
    </div>
  );
} 