/**
 * Medical Research Hub Page
 * 
 * Comprehensive interface for accessing medical literature, clinical trials,
 * and drug information through integrated research APIs.
 * 
 * @component
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  pubmedService, 
  PubMedArticle, 
  EvidenceLevel 
} from '../services/pubmedService';
import { 
  clinicalTrialsService, 
  ClinicalTrial, 
  StudyStatus 
} from '../services/clinicalTrialsService';
import { 
  drugBankService, 
  Drug, 
  DrugInteraction, 
  InteractionSeverity 
} from '../services/drugBankService';
import { 
  Search, 
  BookOpen, 
  Beaker, 
  Pill, 
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Info,
  TrendingUp
} from 'lucide-react';

type SearchTab = 'literature' | 'trials' | 'drugs';

export const MedicalResearchHub: React.FC = () => {
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<SearchTab>('literature');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Literature state
  const [articles, setArticles] = useState<PubMedArticle[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);

  // Clinical trials state
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [totalTrials, setTotalTrials] = useState(0);

  // Drugs state
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);

  /**
   * Search PubMed literature
   */
  const searchLiterature = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const searchResult = await pubmedService.search(query, { retmax: 20 });
      setTotalArticles(searchResult.count);

      if (searchResult.idList.length > 0) {
        const articleDetails = await pubmedService.fetchSummaries(searchResult.idList);
        setArticles(articleDetails);
      } else {
        setArticles([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Literature search failed');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Search clinical trials
   */
  const searchTrials = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await clinicalTrialsService.search(query, { pageSize: 20 });
      setTrials(result.studies);
      setTotalTrials(result.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Clinical trials search failed');
      setTrials([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Search drugs
   */
  const searchDrugs = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const results = await drugBankService.search(query, { limit: 20 });
      setDrugs(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Drug search failed');
      setDrugs([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check drug interactions
   */
  const checkInteractions = async () => {
    if (selectedDrugs.length < 2) return;

    setLoading(true);
    setError(null);

    try {
      const result = await drugBankService.checkInteractions(selectedDrugs);
      setInteractions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Interaction check failed');
      setInteractions([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle search based on active tab
   */
  const handleSearch = () => {
    switch (activeTab) {
      case 'literature':
        searchLiterature();
        break;
      case 'trials':
        searchTrials();
        break;
      case 'drugs':
        searchDrugs();
        break;
    }
  };

  /**
   * Handle Enter key press
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  /**
   * Toggle drug selection for interaction checking
   */
  const toggleDrugSelection = (drugbankId: string) => {
    setSelectedDrugs(prev => 
      prev.includes(drugbankId)
        ? prev.filter(id => id !== drugbankId)
        : [...prev, drugbankId]
    );
  };

  /**
   * Get severity color
   */
  const getSeverityColor = (severity: InteractionSeverity): string => {
    switch (severity) {
      case InteractionSeverity.CONTRAINDICATED:
        return 'red';
      case InteractionSeverity.MAJOR:
        return 'orange';
      case InteractionSeverity.MODERATE:
        return 'yellow';
      case InteractionSeverity.MINOR:
        return 'blue';
      default:
        return 'gray';
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: StudyStatus): string => {
    if (status === StudyStatus.RECRUITING) return 'green';
    if (status === StudyStatus.COMPLETED) return 'blue';
    if (status === StudyStatus.TERMINATED || status === StudyStatus.WITHDRAWN) return 'red';
    return 'gray';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {t('research.title', 'Medical Research Hub')}
          </h1>
          <p className="text-gray-300">
            Access PubMed literature, clinical trials, and drug information
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="glass-card-strong mb-6">
          <div className="flex gap-2 p-2">
            <button
              onClick={() => setActiveTab('literature')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all flex-1 ${
                activeTab === 'literature'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold">PubMed Literature</span>
            </button>
            <button
              onClick={() => setActiveTab('trials')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all flex-1 ${
                activeTab === 'trials'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Beaker className="w-5 h-5" />
              <span className="font-semibold">Clinical Trials</span>
            </button>
            <button
              onClick={() => setActiveTab('drugs')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all flex-1 ${
                activeTab === 'drugs'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Pill className="w-5 h-5" />
              <span className="font-semibold">Drugs & Interactions</span>
            </button>
          </div>
        </div>

        {/* Search Box */}
        <div className="glass-card-strong p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold">
              {activeTab === 'literature' && 'Search Medical Literature'}
              {activeTab === 'trials' && 'Search Clinical Trials'}
              {activeTab === 'drugs' && 'Search Medications'}
            </h2>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                activeTab === 'literature' 
                  ? 'e.g., diabetes treatment, COVID-19, hypertension...'
                  : activeTab === 'trials'
                  ? 'e.g., breast cancer, alzheimer disease...'
                  : 'e.g., aspirin, metformin, ibuprofen...'
              }
              className="glass-input flex-1"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="glass-button-primary px-6"
            >
              {loading ? t('common.loading', 'Loading...') : t('common.search', 'Search')}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <p className="text-red-300 font-semibold">Error</p>
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Drug Interaction Checker */}
        {activeTab === 'drugs' && selectedDrugs.length >= 2 && (
          <div className="glass-card-strong p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Selected Drugs ({selectedDrugs.length})
              </h3>
              <button
                onClick={checkInteractions}
                disabled={loading}
                className="glass-button-primary"
              >
                Check Interactions
              </button>
            </div>

            {interactions.length > 0 && (
              <div className="space-y-3 mt-4">
                {interactions.map((interaction, idx) => {
                  const color = getSeverityColor(interaction.severity);
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 border-${color}-500/30 bg-${color}-500/10`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-5 h-5 text-${color}-400 flex-shrink-0 mt-1`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 text-xs font-bold bg-${color}-500/30 text-${color}-300 rounded uppercase`}>
                              {interaction.severity}
                            </span>
                            <span className="text-white font-semibold">
                              {interaction.drug1Name} + {interaction.drug2Name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{interaction.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {/* Literature Results */}
          {activeTab === 'literature' && articles.length > 0 && (
            <>
              <div className="text-sm text-gray-300 mb-2">
                Found {totalArticles.toLocaleString()} articles (showing {articles.length})
              </div>
              {articles.map((article) => (
                <div key={article.pmid} className="glass-card p-6 hover-lift">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white flex-1 pr-4">
                      {article.title}
                    </h3>
                    <a
                      href={article.articleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-all"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">
                      PMID: {article.pmid}
                    </span>
                    {article.doi && (
                      <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded">
                        DOI: {article.doi}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-300 mb-2">
                    <strong>{article.journal}</strong> • {article.pubDate}
                  </div>
                  
                  {article.authors.length > 0 && (
                    <div className="text-sm text-gray-400">
                      {article.authors.slice(0, 5).join(', ')}
                      {article.authors.length > 5 && ', et al.'}
                    </div>
                  )}
                  
                  {article.abstract && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-sm text-gray-300 line-clamp-3">{article.abstract}</p>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Clinical Trials Results */}
          {activeTab === 'trials' && trials.length > 0 && (
            <>
              <div className="text-sm text-gray-300 mb-2">
                Found {totalTrials.toLocaleString()} trials (showing {trials.length})
              </div>
              {trials.map((trial) => (
                <div key={trial.nctId} className="glass-card p-6 hover-lift">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 text-xs font-mono bg-blue-500/30 text-blue-300 rounded">
                          {trial.nctId}
                        </span>
                        <span className={`px-2 py-1 text-xs bg-${getStatusColor(trial.status)}-500/30 text-${getStatusColor(trial.status)}-300 rounded`}>
                          {trial.status}
                        </span>
                        {trial.phase && trial.phase.length > 0 && (
                          <span className="px-2 py-1 text-xs bg-purple-500/30 text-purple-300 rounded">
                            {trial.phase.join(', ')}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-white">{trial.title}</h3>
                    </div>
                    <a
                      href={trial.studyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-all ml-4"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-3">{trial.briefSummary}</p>
                  
                  {trial.conditions.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm text-gray-400">Conditions: </span>
                      <span className="text-sm text-white">{trial.conditions.join(', ')}</span>
                    </div>
                  )}
                  
                  {trial.interventions.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-400">Interventions: </span>
                      <span className="text-sm text-white">
                        {trial.interventions.map(i => i.name).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Drug Results */}
          {activeTab === 'drugs' && drugs.length > 0 && (
            <>
              <div className="text-sm text-gray-300 mb-2">
                Found {drugs.length} medications
              </div>
              {drugs.map((drug) => (
                <div key={drug.drugbankId} className="glass-card p-6 hover-lift">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 text-xs font-mono bg-blue-500/30 text-blue-300 rounded">
                          {drug.drugbankId}
                        </span>
                        <button
                          onClick={() => toggleDrugSelection(drug.drugbankId)}
                          className={`px-3 py-1 text-xs rounded transition-all ${
                            selectedDrugs.includes(drug.drugbankId)
                              ? 'bg-green-500/30 text-green-300'
                              : 'bg-gray-500/30 text-gray-300'
                          }`}
                        >
                          {selectedDrugs.includes(drug.drugbankId) ? (
                            <CheckCircle2 className="w-4 h-4 inline" />
                          ) : (
                            'Select for interaction check'
                          )}
                        </button>
                      </div>
                      <h3 className="text-lg font-semibold text-white">{drug.name}</h3>
                    </div>
                  </div>
                  
                  {drug.simpleDescription && (
                    <p className="text-sm text-gray-300 mb-3">{drug.simpleDescription}</p>
                  )}
                  
                  {drug.indication && (
                    <div className="mb-2">
                      <span className="text-sm text-gray-400">Indication: </span>
                      <span className="text-sm text-white">{drug.indication}</span>
                    </div>
                  )}
                  
                  {drug.brandNames && drug.brandNames.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-400">Brand names: </span>
                      <span className="text-sm text-white">{drug.brandNames.slice(0, 5).join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* No Results */}
          {!loading && (
            (activeTab === 'literature' && articles.length === 0 && query) ||
            (activeTab === 'trials' && trials.length === 0 && query) ||
            (activeTab === 'drugs' && drugs.length === 0 && query)
          ) && (
            <div className="glass-card p-12 text-center">
              <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">No results found. Try a different search term.</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !query && (
            <div className="glass-card p-12 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">
                {activeTab === 'literature' && 'Search millions of biomedical articles from PubMed'}
                {activeTab === 'trials' && 'Find clinical trials from ClinicalTrials.gov'}
                {activeTab === 'drugs' && 'Search comprehensive drug information from DrugBank'}
              </p>
              <p className="text-sm text-gray-400">
                Enter a search term to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalResearchHub;