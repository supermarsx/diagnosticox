import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { symptomService } from '@/services/symptomService';
import type { Symptom, SymptomReport, AssessmentResult, RedFlag } from '@/types';
import { Search, AlertTriangle, Stethoscope, FileText, Clock, MapPin } from 'lucide-react';

interface SymptomAssessment {
  symptomId: string;
  severity: number;
  duration: string;
  location?: string;
  associatedSymptoms: string[];
  description?: string;
}

const ORGAN_SYSTEMS = [
  'Cardiovascular',
  'Respiratory', 
  'Gastrointestinal',
  'Neurological',
  'Musculoskeletal',
  'Dermatological',
  'Genitourinary',
  'Endocrine',
  'Hematological',
  'Psychiatric'
];

const DURATION_OPTIONS = [
  { value: 'less_than_1_hour', label: 'Less than 1 hour' },
  { value: '1_to_6_hours', label: '1-6 hours' },
  { value: '6_to_24_hours', label: '6-24 hours' },
  { value: '1_to_7_days', label: '1-7 days' },
  { value: '1_to_4_weeks', label: '1-4 weeks' },
  { value: 'more_than_1_month', label: 'More than 1 month' }
];

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrganSystem, setSelectedOrganSystem] = useState<string>('');
  const [assessments, setAssessments] = useState<SymptomAssessment[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<SymptomAssessment | null>(null);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssessing, setIsAssessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSymptoms();
  }, []);

  useEffect(() => {
    if (currentAssessment) {
      searchAssociatedSymptoms();
    }
  }, [currentAssessment?.symptomId]);

  const loadSymptoms = async () => {
    try {
      setIsLoading(true);
      const symptomsData = await symptomService.getSymptoms();
      setSymptoms(symptomsData);
    } catch (error) {
      console.error('Failed to load symptoms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load symptoms',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchSymptoms = async (query: string, organSystem?: string) => {
    try {
      const results = await symptomService.searchSymptoms(query, organSystem);
      return results;
    } catch (error) {
      console.error('Failed to search symptoms:', error);
      toast({
        title: 'Error',
        description: 'Failed to search symptoms',
        variant: 'destructive'
      });
      return [];
    }
  };

  const searchAssociatedSymptoms = async () => {
    if (!currentAssessment?.symptomId) return;
    
    try {
      const associated = await symptomService.getAssociatedSymptoms(currentAssessment.symptomId);
      setCurrentAssessment(prev => prev ? {
        ...prev,
        associatedSymptoms: associated.map(s => s.id)
      } : null);
    } catch (error) {
      console.error('Failed to load associated symptoms:', error);
    }
  };

  const addSymptomAssessment = (symptom: Symptom) => {
    if (assessments.find(a => a.symptomId === symptom.id)) {
      toast({
        title: 'Warning',
        description: 'This symptom is already being assessed',
        variant: 'destructive'
      });
      return;
    }

    const newAssessment: SymptomAssessment = {
      symptomId: symptom.id,
      severity: 1,
      duration: '',
      associatedSymptoms: []
    };

    setCurrentAssessment(newAssessment);
  };

  const saveAssessment = () => {
    if (!currentAssessment) return;

    if (!currentAssessment.duration) {
      toast({
        title: 'Error',
        description: 'Please specify the duration of the symptom',
        variant: 'destructive'
      });
      return;
    }

    setAssessments(prev => [...prev.filter(a => a.symptomId !== currentAssessment.symptomId), currentAssessment]);
    setCurrentAssessment(null);
    
    toast({
      title: 'Success',
      description: 'Symptom assessment saved'
    });
  };

  const removeAssessment = (symptomId: string) => {
    setAssessments(prev => prev.filter(a => a.symptomId !== symptomId));
  };

  const performAssessment = async () => {
    if (assessments.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one symptom for assessment',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsAssessing(true);
      
      const report: SymptomReport = {
        id: `report_${Date.now()}`,
        patientId: 'current', // This would be actual patient ID in real app
        symptoms: assessments,
        timestamp: new Date()
      };

      const results = await symptomService.assessSymptoms(report);
      setAssessmentResults(results);
      
      toast({
        title: 'Assessment Complete',
        description: 'Symptom assessment has been completed'
      });
    } catch (error) {
      console.error('Failed to perform assessment:', error);
      toast({
        title: 'Error',
        description: 'Failed to perform symptom assessment',
        variant: 'destructive'
      });
    } finally {
      setIsAssessing(false);
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 2) return 'text-green-500';
    if (severity <= 4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity <= 2) return 'Mild';
    if (severity <= 4) return 'Moderate';
    return 'Severe';
  };

  const filteredSymptoms = symptoms.filter(symptom => {
    const matchesSearch = symptom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         symptom.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrganSystem = !selectedOrganSystem || symptom.organSystem === selectedOrganSystem;
    return matchesSearch && matchesOrganSystem;
  });

  const getSymptomName = (symptomId: string) => {
    const symptom = symptoms.find(s => s.id === symptomId);
    return symptom ? symptom.name : 'Unknown Symptom';
  };

  const hasRedFlags = () => {
    return assessmentResults?.redFlags && assessmentResults.redFlags.length > 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading symptoms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Symptom Checker</h1>
          <p className="text-muted-foreground mt-2">
            Search and assess symptoms for differential diagnosis
          </p>
        </div>
      </div>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">Search Symptoms</TabsTrigger>
          <TabsTrigger value="assess">Assess Symptoms</TabsTrigger>
          <TabsTrigger value="results">Assessment Results</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Symptom Search</CardTitle>
              <CardDescription>Search for symptoms by name or organ system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Symptoms</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Enter symptom name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-64">
                  <Label>Organ System</Label>
                  <Select value={selectedOrganSystem} onValueChange={setSelectedOrganSystem}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All systems" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Systems</SelectItem>
                      {ORGAN_SYSTEMS.map(system => (
                        <SelectItem key={system} value={system}>
                          {system}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {filteredSymptoms.slice(0, 20).map(symptom => (
              <Card key={symptom.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => addSymptomAssessment(symptom)}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{symptom.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{symptom.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">{symptom.organSystem}</Badge>
                        {symptom.severity && (
                          <Badge variant="secondary" className={getSeverityColor(symptom.severity)}>
                            {getSeverityLabel(symptom.severity)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button size="sm">Add</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSymptoms.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No symptoms found matching your criteria</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assess" className="space-y-4">
          {currentAssessment ? (
            <Card>
              <CardHeader>
                <CardTitle>Assess Symptom: {getSymptomName(currentAssessment.symptomId)}</CardTitle>
                <CardDescription>Provide details about this symptom</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Severity (1-10)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[currentAssessment.severity]}
                      onValueChange={([value]) => setCurrentAssessment(prev => prev ? { ...prev, severity: value } : null)}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Mild (1-3)</span>
                      <span>Moderate (4-6)</span>
                      <span>Severe (7-10)</span>
                    </div>
                    <p className="text-center font-medium">Severity: {currentAssessment.severity} - {getSeverityLabel(currentAssessment.severity)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select
                    value={currentAssessment.duration}
                    onValueChange={(value) => setCurrentAssessment(prev => prev ? { ...prev, duration: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Location (Optional)</Label>
                  <Input
                    value={currentAssessment.location || ''}
                    onChange={(e) => setCurrentAssessment(prev => prev ? { ...prev, location: e.target.value } : null)}
                    placeholder="e.g., left chest, right side of head"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Additional Description (Optional)</Label>
                  <Textarea
                    value={currentAssessment.description || ''}
                    onChange={(e) => setCurrentAssessment(prev => prev ? { ...prev, description: e.target.value } : null)}
                    placeholder="Additional details about the symptom"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={saveAssessment} className="flex-1">
                    Save Assessment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentAssessment(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Current Assessments</CardTitle>
                <CardDescription>Review and manage symptom assessments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {assessments.length === 0 ? (
                  <div className="text-center py-8">
                    <Stethoscope className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No symptoms assessed yet</p>
                    <p className="text-sm text-muted-foreground mt-2">Go to the Search tab to add symptoms</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assessments.map((assessment, index) => {
                      const symptom = symptoms.find(s => s.id === assessment.symptomId);
                      return (
                        <div key={assessment.symptomId} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex-1">
                            <h4 className="font-medium">{symptom?.name || 'Unknown Symptom'}</h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                              <span>Severity: {assessment.severity}/10</span>
                              <span>Duration: {DURATION_OPTIONS.find(d => d.value === assessment.duration)?.label}</span>
                              {assessment.location && <span>Location: {assessment.location}</span>}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeAssessment(assessment.symptomId)}
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })}
                    
                    <Button
                      onClick={performAssessment}
                      disabled={isAssessing}
                      className="w-full"
                      size="lg"
                    >
                      {isAssessing ? 'Assessing...' : 'Perform Assessment'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {assessmentResults ? (
            <div className="space-y-4">
              {/* Red Flags */}
              {hasRedFlags() && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold">Red Flag Symptoms Detected!</p>
                      {assessmentResults.redFlags?.map(flag => (
                        <div key={flag.id} className="text-sm">
                          <p className="font-medium">{flag.symptom}</p>
                          <p className="text-muted-foreground">{flag.description}</p>
                          <p className="text-xs mt-1">Recommended: {flag.recommendedAction}</p>
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Differential Diagnoses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Stethoscope className="h-5 w-5" />
                    <span>Differential Diagnoses</span>
                  </CardTitle>
                  <CardDescription>Possible conditions based on reported symptoms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assessmentResults.differentialDiagnoses?.map((diagnosis, index) => (
                      <div key={index} className="p-3 border rounded">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{diagnosis.condition}</h4>
                          <Badge variant={index < 3 ? 'default' : 'secondary'}>
                            {Math.round(diagnosis.probability * 100)}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{diagnosis.description}</p>
                        <div className="text-xs text-muted-foreground">
                          <p><strong>Matching symptoms:</strong> {diagnosis.matchingSymptoms.join(', ')}</p>
                          <p><strong>Recommended tests:</strong> {diagnosis.recommendedTests?.join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              {assessmentResults.recommendations && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Recommendations</span>
                    </CardTitle>
                    <CardDescription>Suggested next steps based on assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {assessmentResults.recommendations.immediate?.length > 0 && (
                        <div>
                          <h4 className="font-medium text-red-600 mb-2">Immediate Action Required</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {assessmentResults.recommendations.immediate.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {assessmentResults.recommendations.general?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">General Recommendations</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {assessmentResults.recommendations.general.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {assessmentResults.recommendations.followUp?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Follow-up Recommendations</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {assessmentResults.recommendations.followUp.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Assessment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Summary</CardTitle>
                  <CardDescription>Overview of the symptom assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Assessment Date: {assessmentResults.assessmentDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Symptoms Assessed: {assessments.length}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="h-4 w-4" />
                        <span>Possible Diagnoses: {assessmentResults.differentialDiagnoses?.length || 0}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Red Flags: {assessmentResults.redFlags?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No assessment results available</p>
                <p className="text-sm text-muted-foreground mt-2">Complete symptom assessment to see results</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}