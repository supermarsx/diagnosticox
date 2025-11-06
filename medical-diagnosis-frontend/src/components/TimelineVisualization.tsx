import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TimelineEvent } from '../types/medical';

interface TimelineVisualizationProps {
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  'symptom_onset': 'bg-red-100 text-red-800 border-red-300',
  'diagnosis': 'bg-blue-100 text-blue-800 border-blue-300',
  'treatment_start': 'bg-green-100 text-green-800 border-green-300',
  'test_result': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'milestone': 'bg-purple-100 text-purple-800 border-purple-300',
  'other': 'bg-gray-100 text-gray-800 border-gray-300',
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  'symptom_onset': 'Symptom Onset',
  'diagnosis': 'Diagnosis',
  'treatment_start': 'Treatment Start',
  'test_result': 'Test Result',
  'milestone': 'Milestone',
  'other': 'Other',
};

export function TimelineVisualization({ events, onEventClick }: TimelineVisualizationProps) {
  if (!events || events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Timeline</CardTitle>
          <CardDescription>No timeline events recorded yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Patient Timeline</CardTitle>
          <CardDescription>
            Chronological view of medical events and milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedEvents.map((event, index) => (
              <div
                key={event.id}
                onClick={() => onEventClick && onEventClick(event)}
                className={`relative pl-8 pb-6 ${
                  index !== sortedEvents.length - 1 ? 'border-l-2 border-gray-200' : ''
                } ${onEventClick ? 'cursor-pointer hover:bg-gray-50 p-4 rounded-lg -ml-4' : ''}`}
              >
                {/* Timeline dot */}
                <div className={`absolute left-0 top-0 w-4 h-4 rounded-full border-4 ${
                  EVENT_TYPE_COLORS[event.event_type]?.replace('bg-', 'bg-') || 'bg-gray-500'
                } border-white`} style={{ marginLeft: '-0.5rem' }} />

                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{event.event_title}</h3>
                      <p className="text-sm text-gray-600">
                        {format(parseISO(event.event_date), 'PPP')}
                      </p>
                    </div>
                    <Badge className={EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS.other}>
                      {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                    </Badge>
                  </div>

                  {event.event_description && (
                    <p className="text-sm text-gray-700">{event.event_description}</p>
                  )}

                  {event.severity && (
                    <Badge 
                      variant={
                        event.severity === 'high' ? 'destructive' :
                        event.severity === 'medium' ? 'default' : 'secondary'
                      }
                    >
                      Severity: {event.severity}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
              <Badge key={type} className={EVENT_TYPE_COLORS[type]}>
                {label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
