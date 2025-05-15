
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatItem {
  value: number;
  label: string;
  change: number;
}

export interface DashboardStatsProps {
  stats?: StatItem[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  // Default stats data when no stats are provided
  const defaultStats: StatItem[] = [
    { value: 12, label: 'Active Jobs', change: 2 },
    { value: 48, label: 'Applications', change: -5 },
    { value: 8, label: 'Interviews', change: 3 },
    { value: 92, label: 'Completion Rate', change: 5 },
  ];

  const displayStats = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {displayStats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{stat.value}</span>
              <div className={`flex items-center ${stat.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change > 0 ? 
                  <ArrowUpRight className="h-4 w-4 mr-1" /> : 
                  <ArrowDownRight className="h-4 w-4 mr-1" />}
                <span>{Math.abs(stat.change)}%</span>
              </div>
            </div>
            <span className="text-sm text-muted-foreground mt-1">{stat.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
