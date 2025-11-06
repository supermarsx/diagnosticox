import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, FileText, Upload, Download, Trash2, Eye, Search, Filter, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ScannedDocument {
  id: string;
  type: 'prescription' | 'lab_report' | 'medical_record' | 'insurance_card' | 'referral' | 'other';
  name: string;
  date: string;
  status: 'processing' | 'completed' | 'error';
  thumbnail: string;
  extractedText?: string;
  metadata?: {
    patientName?: string;
    documentDate?: string;
    issuer?: string;
  };
}

const CameraIntegration: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [documents, setDocuments] = useState<ScannedDocument[]>([
    {
      id: 'doc-001',
      type: 'prescription',
      name: 'Prescription - Dr. Anderson',
      date: '2025-01-15',
      status: 'completed',
      thumbnail: '/images/document-thumb.png',
      extractedText: 'Amoxicillin 500mg - Take 1 capsule three times daily for 7 days',
      metadata: {
        patientName: 'Sarah Johnson',
        documentDate: '2025-01-15',
        issuer: 'Dr. Anderson'
      }
    },
    {
      id: 'doc-002',
      type: 'lab_report',
      name: 'Blood Test Results',
      date: '2025-01-10',
      status: 'completed',
      thumbnail: '/images/document-thumb.png',
      extractedText: 'Complete Blood Count (CBC) - WBC: 7.2, RBC: 4.5, Hemoglobin: 14.2',
      metadata: {
        patientName: 'Sarah Johnson',
        documentDate: '2025-01-10',
        issuer: 'City Lab'
      }
    },
    {
      id: 'doc-003',
      type: 'insurance_card',
      name: 'Health Insurance Card',
      date: '2025-01-05',
      status: 'completed',
      thumbnail: '/images/document-thumb.png',
      extractedText: 'Member ID: HC123456789, Group: CORP-001',
      metadata: {
        patientName: 'Sarah Johnson',
        issuer: 'HealthCare Plus'
      }
    }
  ]);

  const [selectedDocument, setSelectedDocument] = useState<ScannedDocument | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  const documentTypes = [
    { value: 'all', label: 'All Documents', icon: FileText },
    { value: 'prescription', label: 'Prescriptions', icon: FileText },
    { value: 'lab_report', label: 'Lab Reports', icon: FileText },
    { value: 'medical_record', label: 'Medical Records', icon: FileText },
    { value: 'insurance_card', label: 'Insurance Cards', icon: FileText },
    { value: 'referral', label: 'Referrals', icon: FileText },
    { value: 'other', label: 'Other', icon: FileText }
  ];

  const handleCapture = () => {
    setShowCamera(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Simulate document upload and processing
      const newDoc: ScannedDocument = {
        id: `doc-${Date.now()}`,
        type: 'other',
        name: files[0].name,
        date: new Date().toISOString().split('T')[0],
        status: 'processing',
        thumbnail: '/images/document-thumb.png'
      };
      
      setDocuments([newDoc, ...documents]);
      
      // Simulate OCR processing
      setTimeout(() => {
        setDocuments(docs => docs.map(doc => 
          doc.id === newDoc.id 
            ? { ...doc, status: 'completed' as const, extractedText: 'Scanned document text...' }
            : doc
        ));
      }, 2000);
    }
  };

  const handleCameraCapture = () => {
    // Simulate camera capture
    const newDoc: ScannedDocument = {
      id: `doc-${Date.now()}`,
      type: 'other',
      name: 'Camera Capture',
      date: new Date().toISOString().split('T')[0],
      status: 'processing',
      thumbnail: '/images/document-thumb.png'
    };
    
    setDocuments([newDoc, ...documents]);
    setShowCamera(false);
    
    // Simulate OCR processing
    setTimeout(() => {
      setDocuments(docs => docs.map(doc => 
        doc.id === newDoc.id 
          ? { ...doc, status: 'completed' as const, extractedText: 'Captured document text...' }
          : doc
      ));
    }, 2000);
  };

  const handleDeleteDocument = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(doc => doc.id !== id));
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
      }
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.extractedText?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      prescription: 'bg-blue-100 text-blue-700',
      lab_report: 'bg-green-100 text-green-700',
      medical_record: 'bg-purple-100 text-purple-700',
      insurance_card: 'bg-orange-100 text-orange-700',
      referral: 'bg-pink-100 text-pink-700',
      other: 'bg-gray-100 text-gray-700'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {/* Header */}
      <div className="glass-card p-4 mb-6 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/visualizations')}
              className="glass-button p-2 hover-lift"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Document Scanner</h1>
              <p className="text-sm text-gray-600">Scan & Extract Medical Documents</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCapture}
              className="glass-button-primary px-4 py-2 hover-lift"
            >
              <Camera className="w-4 h-4 mr-2 inline" />
              Scan Document
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="glass-button px-4 py-2 hover-lift"
            >
              <Upload className="w-4 h-4 mr-2 inline" />
              Upload File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar - Filters & Document List */}
        <div className="col-span-4 space-y-4">
          {/* Search */}
          <div className="glass-card p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input pl-10 w-full"
              />
            </div>
          </div>

          {/* Document Type Filter */}
          <div className="glass-card p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-600" />
              Document Types
            </h3>
            <div className="space-y-1">
              {documentTypes.map(type => {
                const Icon = type.icon;
                const count = type.value === 'all' 
                  ? documents.length 
                  : documents.filter(d => d.type === type.value).length;
                
                return (
                  <button
                    key={type.value}
                    onClick={() => setFilterType(type.value)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-all ${
                      filterType === type.value
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                        : 'hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{type.label}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      filterType === type.value
                        ? 'bg-white/20'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Document List */}
          <div className="glass-card p-4">
            <h3 className="font-semibold mb-3">Recent Scans ({filteredDocuments.length})</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredDocuments.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocument(doc)}
                  className={`p-3 rounded-lg cursor-pointer transition-all hover-lift ${
                    selectedDocument?.id === doc.id
                      ? 'bg-purple-100 border-2 border-purple-500'
                      : 'glass-card-subtle hover:bg-white/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm truncate">{doc.name}</h4>
                        {getStatusIcon(doc.status)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(doc.type)}`}>
                          {doc.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(doc.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Document Viewer */}
        <div className="col-span-8 space-y-4">
          {showCamera ? (
            /* Camera Interface */
            <div className="glass-card p-6">
              <div className="bg-black rounded-lg overflow-hidden" style={{ height: '600px' }}>
                <div className="w-full h-full flex items-center justify-center relative">
                  {/* Simulated camera view */}
                  <div className="text-center text-white">
                    <Camera className="w-24 h-24 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Camera Preview</p>
                    <p className="text-sm opacity-75">Position document within frame</p>
                  </div>
                  
                  {/* Camera controls */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                    <button
                      onClick={() => setShowCamera(false)}
                      className="glass-button px-6 py-3 hover-lift"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCameraCapture}
                      className="glass-button-primary px-8 py-3 hover-lift"
                    >
                      <Camera className="w-5 h-5 mr-2 inline" />
                      Capture
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedDocument ? (
            /* Document Viewer */
            <>
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{selectedDocument.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(selectedDocument.type)}`}>
                        {selectedDocument.type.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(selectedDocument.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="glass-button p-2 hover-lift" title="Download">
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(selectedDocument.id)}
                      className="glass-button p-2 hover-lift text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Document Preview */}
                <div className="bg-gray-100 rounded-lg p-8 mb-4" style={{ minHeight: '400px' }}>
                  <div className="bg-white shadow-lg rounded p-8 max-w-2xl mx-auto">
                    <div className="text-center mb-6">
                      <FileText className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Document Preview</p>
                    </div>
                    {selectedDocument.metadata && (
                      <div className="border-t pt-4 space-y-2 text-sm">
                        {selectedDocument.metadata.patientName && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Patient:</span>
                            <span className="font-medium">{selectedDocument.metadata.patientName}</span>
                          </div>
                        )}
                        {selectedDocument.metadata.documentDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-medium">{new Date(selectedDocument.metadata.documentDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {selectedDocument.metadata.issuer && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Issued by:</span>
                            <span className="font-medium">{selectedDocument.metadata.issuer}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Extracted Text */}
              {selectedDocument.extractedText && (
                <div className="glass-card p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    Extracted Text (OCR)
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm leading-relaxed">{selectedDocument.extractedText}</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="glass-button px-4 py-2 hover-lift text-sm">
                      Copy Text
                    </button>
                    <button className="glass-button px-4 py-2 hover-lift text-sm">
                      Edit & Correct
                    </button>
                  </div>
                </div>
              )}

              {/* AI Analysis */}
              <div className="glass-card p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  AI Document Analysis
                </h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Document Classification</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Identified as {selectedDocument.type.replace('_', ' ')} with 94% confidence
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Quality Check</p>
                        <p className="text-xs text-green-700 mt-1">
                          Document is clear and readable. OCR accuracy: 96%
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedDocument.type === 'prescription' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <FileText className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-purple-900">Medication Detected</p>
                          <p className="text-xs text-purple-700 mt-1">
                            Would you like to add this prescription to the patient's medication list?
                          </p>
                          <button className="glass-button-primary px-3 py-1 text-xs mt-2">
                            Add to Records
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="glass-card p-12 text-center">
              <Camera className="w-24 h-24 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Document Selected</h3>
              <p className="text-gray-500 mb-6">
                Select a document from the list or scan a new one to get started
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleCapture}
                  className="glass-button-primary px-6 py-3 hover-lift"
                >
                  <Camera className="w-5 h-5 mr-2 inline" />
                  Scan Document
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="glass-button px-6 py-3 hover-lift"
                >
                  <Upload className="w-5 h-5 mr-2 inline" />
                  Upload File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraIntegration;