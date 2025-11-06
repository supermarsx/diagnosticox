import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { analyticsService } from '@/services/analyticsService';
import type { TreatmentOutcome, CostAnalysis, AdherenceMetrics, SuccessRate } from '@/types';
import { TrendingUp, DollarSign, Users, Target, Calendar, Award } from 'lucide-react';

interface TreatmentEfficacyData {
  treatmentOutcomes: TreatmentOutcome[];
  costAnalysis: CostAnalysis[];
  adherenceMetrics: AdherenceMetrics[];
  successRates: SuccessRate[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function TreatmentEfficacyCenter() {
  const [data, setData] = useState<TreatmentEfficacyData | null>(null);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<string>('6months');
  const [selectedTreatment, setSelectedTreatment] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEfficacyData();
  }, [selectedTimeFrame]);

  const loadEfficacyData = async () => {
    try {
      setIsLoading(true);
      const efficacyData = await analyticsService.getTreatmentEfficacy(selectedTimeFrame);
      setData(efficacyData);
      
      // Set default treatment selection if available
      if (efficacyData.successRates && efficacyData.successRates.length > 0) {
        setSelectedTreatment(efficacyData.successRates[0].treatment);
      }
    } catch (error) {
      console.error('Failed to load treatment efficacy data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load treatment efficacy data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.8) return 'text-green-600';
    if (rate >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessRateBadge = (rate: number) => {
    if (rate >= 0.8) return 'default';
    if (rate >= 0.6) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading treatment efficacy data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No treatment efficacy data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Treatment Efficacy Center</h1>
          <p className="text-muted-foreground mt-2">
            Analyze treatment outcomes, cost-effectiveness, and success rates
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedTimeFrame} onValueChange={setSelectedTimeFrame}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadEfficacyData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.successRates.length > 0 
                ? formatPercentage(data.successRates.reduce((acc, rate) => acc + rate.successRate, 0) / data.successRates.length)
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Average across all treatments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients Treated</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.treatmentOutcomes.reduce((acc, outcome) => acc + outcome.patientsTreated, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              In selected time period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Treatment Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.costAnalysis.length > 0
                ? formatCurrency(data.costAnalysis.reduce((acc, cost) => acc + cost.averageCost, 0) / data.costAnalysis.length)
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Per patient
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treatment Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.treatmentOutcomes.length > 0
                ? Math.round(data.treatmentOutcomes.reduce((acc, outcome) => acc + outcome.averageDuration, 0) / data.treatmentOutcomes.length)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Average days
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="outcomes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="outcomes">Treatment Outcomes</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="adherence">Adherence</TabsTrigger>
          <TabsTrigger value="success">Success Rates</TabsTrigger>
        </TabsList>

        <TabsContent value="outcomes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Outcomes Overview</CardTitle>
              <CardDescription>Success rates and patient counts by treatment type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.treatmentOutcomes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="treatment" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'successRate') {
                          return [formatPercentage(value as number), 'Success Rate'];
                        }
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="successRate" fill="#8884d8" name="successRate" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {data.treatmentOutcomes.map((outcome, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{outcome.treatment}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Patients: {outcome.patientsTreated.toLocaleString()}</span>
                        <span>Success Rate: {formatPercentage(outcome.successRate)}</span>
                        <span>Avg Duration: {outcome.averageDuration} days</span>
                      </div>
                    </div>
                    <Badge variant={getSuccessRateBadge(outcome.successRate)} className="text-sm">
                      {formatPercentage(outcome.successRate)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis</CardTitle>
              <CardDescription>Treatment costs and cost-effectiveness metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={data.costAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="averageCost" 
                      name="Average Cost"
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <YAxis 
                      dataKey="costPerSuccess" 
                      name="Cost per Success"
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        return [formatCurrency(value as number), name];
                      }}
                      labelFormatter={(label) => `Treatment: ${label}`}
                    />
                    <Scatter dataKey="costPerSuccess" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {data.costAnalysis.map((cost, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Treatment</p>
                      <p className="font-semibold">{cost.treatment}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Average Cost</p>
                      <p className="font-semibold">{formatCurrency(cost.averageCost)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Cost per Success</p>
                      <p className="font-semibold">{formatCurrency(cost.costPerSuccess)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">ROI</p>
                      <p className="font-semibold">{formatPercentage(cost.roi)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="adherence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Adherence Metrics</CardTitle>
              <CardDescription>Medication adherence and treatment compliance rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.adherenceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <Tooltip formatter={(value) => [formatPercentage(value as number), 'Adherence Rate']} />
                    <Line type="monotone" dataKey="adherenceRate" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {data.adherenceMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Month</p>
                      <p className="font-semibold">{metric.month}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Adherence Rate</p>
                      <p className={`font-semibold ${getSuccessRateColor(metric.adherenceRate)}`}>
                        {formatPercentage(metric.adherenceRate)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Patients</p>
                      <p className="font-semibold">{metric.patientsCount.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Compliance</p>
                      <p className="font-semibold">{formatPercentage(metric.complianceRate)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="success" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Success Rate Trends</CardTitle>
              <CardDescription>Treatment success rates over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Select value={selectedTreatment} onValueChange={setSelectedTreatment}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select treatment" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.successRates.map((rate, index) => (
                        <SelectItem key={index} value={rate.treatment}>
                          {rate.treatment}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.successRates.filter(rate => rate.treatment === selectedTreatment)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timeframe" />
                      <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <Tooltip formatter={(value) => [formatPercentage(value as number), 'Success Rate']} />
                      <Line type="monotone" dataKey="successRate" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {data.successRates
              .filter(rate => !selectedTreatment || rate.treatment === selectedTreatment)
              .map((rate, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{rate.treatment}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Timeframe: {rate.timeframe}</span>
                        <span>Success Rate: {formatPercentage(rate.successRate)}</span>
                        <span>Total Cases: {rate.totalCases.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getSuccessRateBadge(rate.successRate)} className="mb-1">
                        {formatPercentage(rate.successRate)}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {rate.successfulCases.toLocaleString()} successful
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}