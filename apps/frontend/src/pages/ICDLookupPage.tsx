/**
 * ICD-10/ICD-11 Code Lookup Page
 * 
 * Provides comprehensive interface for searching and browsing ICD codes
 * with support for both ICD-10-CM and ICD-11 MMS.
 * 
 * @component
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { icdService, ICDSearchResult, ICDConcept, searchLocalICD, getLocalICD } from '../services/icdService';
import { Search, BookOpen, ArrowRight, AlertCircle, Stethoscope, Activity } from 'lucide-react';
import { searchICD10Local, getICD10Local } from '../lib/icd10Local';

interface SearchState {
  query: string;
  version: 'icd10' | 'icd11';
  results: ICDSearchResult['destinationEntities'];
  loading: boolean;
  error: string | null;
}

interface ConceptDetailState {
  concept: ICDConcept | null;
  icd10Detail?: ReturnType<typeof getICD10Local>;
  loading: boolean;
  error: string | null;
}

export const ICDLookupPage: React.FC = () => {
  const { t } = useTranslation();
  
  const [search, setSearch] = useState<SearchState>({
    query: '',
    version: 'icd11',
    results: [],
    loading: false,
    error: null,
  });

  const [conceptDetail, setConceptDetail] = useState<ConceptDetailState>({
    concept: null,
    loading: false,
    error: null,
  });

  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  /**
   * Handle ICD code search
   */
  const handleSearch = async () => {
    if (!search.query.trim()) return;

    setSearch(prev => ({ ...prev, loading: true, error: null, results: [] }));

    try {
      if (search.version === 'icd11') {
        // Use local index if populated, otherwise fallback to WHO API
        const local = await searchLocalICD('icd11', search.query);
        const results = local.results?.length
          ? local.results
          : (await icdService.searchICD11(search.query, { flatResults: true, useFlexisearch: true })).destinationEntities;
        setSearch(prev => ({
          ...prev,
          results,
          loading: false,
        }));
      } else {
        // Prefer local ICD-10 index if available
        const local = await searchLocalICD('icd10', search.query);
        const baseResults =
          local.results?.length > 0
            ? local.results
            : searchICD10Local(search.query).map((entry) => ({
                id: entry.code,
                title: entry.title,
                theCode: entry.code,
                chapter: entry.chapter,
                score: 1,
                titleIsASearchResult: true,
                titleIsTopScore: true,
              }));
        const results = baseResults.map((r: any) => ({
          ...r,
          theCode: r.theCode || r.code || r.id,
        }));
        setSearch(prev => ({
          ...prev,
          results,
          loading: false,
        }));
      }
    } catch (error) {
      setSearch(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Search failed',
        loading: false,
      }));
    }
  };

  /**
   * Load detailed concept information
   */
  const handleViewDetails = async (entityId: string) => {
    setSelectedEntity(entityId);
    setConceptDetail({ concept: null, icd10Detail: undefined, loading: true, error: null });

    try {
      if (search.version === 'icd11') {
        let concept: ICDConcept | null = null;
        try {
          const local = await getLocalICD('icd11', entityId);
          concept = {
            '@id': local.entry?.id || entityId,
            '@context': '',
            title: { '@language': 'en', '@value': local.entry?.title || '' },
            fullySpecifiedName: { '@language': 'en', '@value': local.entry?.title || '' },
          } as ICDConcept;
        } catch {
          concept = await icdService.getICD11Concept(entityId);
        }
        setConceptDetail({ concept, icd10Detail: undefined, loading: false, error: null });
      } else {
        let detail = getICD10Local(entityId) || undefined;
        if (!detail) {
          try {
            const local = await getLocalICD('icd10', entityId);
            detail = {
              code: local.entry?.code || entityId,
              title: local.entry?.title || '',
              chapter: local.entry?.chapter,
              synonyms: [],
              commonSymptoms: [],
            };
          } catch {
            // ignore
          }
        }
        setConceptDetail({ concept: null, icd10Detail: detail, loading: false, error: null });
      }
    } catch (error) {
      setConceptDetail({
        concept: null,
        icd10Detail: undefined,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load details',
      });
    }
  };

  /**
   * Handle Enter key press in search
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {t('icd.title')}
          </h1>
          <p className="text-gray-300">
            Search WHO International Classification of Diseases codes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Search */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Box */}
            <div className="glass-card-strong p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold">{t('icd.searchCodes')}</h2>
              </div>

              {/* Version Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSearch(prev => ({ ...prev, version: 'icd11' }))}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    search.version === 'icd11'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {t('icd.icd11')}
                </button>
                <button
                  onClick={() => setSearch(prev => ({ ...prev, version: 'icd10' }))}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    search.version === 'icd10'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {t('icd.icd10')}
                </button>
              </div>

              {/* Search Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={search.query}
                  onChange={(e) => setSearch(prev => ({ ...prev, query: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter diagnosis, symptom, or code..."
                  className="glass-input flex-1"
                />
                <button
                  onClick={handleSearch}
                  disabled={search.loading || !search.query.trim()}
                  className="glass-button-primary px-6"
                >
                  {search.loading ? t('common.loading') : t('common.search')}
                </button>
              </div>

              {/* Error Display */}
              {search.error && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-red-300 font-semibold">Error</p>
                    <p className="text-red-200 text-sm">{search.error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {search.results.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Search Results ({search.results.length})
                </h3>
                <div className="space-y-3">
                  {search.results.map((entity) => (
                    <div
                      key={entity.id}
                      className={`p-4 rounded-lg transition-all cursor-pointer hover-lift ${
                        selectedEntity === entity.id
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => handleViewDetails(entity.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {entity.theCode && (
                              <span className="px-2 py-1 text-xs font-mono bg-blue-500/30 text-blue-300 rounded">
                                {entity.theCode}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              Score: {(entity.score * 100).toFixed(0)}%
                            </span>
                          </div>
                          <h4 className="font-semibold text-white">{entity.title}</h4>
                          {entity.chapter && (
                            <p className="text-sm text-gray-400 mt-1">
                              Chapter: {entity.chapter}
                            </p>
                          )}
                        </div>
                        {search.version === 'icd10' && (
                          <span className="glass-badge text-2xs text-emerald-200">Symptoms linked</span>
                        )}
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-1">
            <div className="glass-card-strong p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold">{t('icd.codeDetails')}</h2>
              </div>

              {conceptDetail.loading && (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-400">{t('common.loading')}</p>
                </div>
              )}

              {conceptDetail.error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-sm">{conceptDetail.error}</p>
                </div>
              )}

              {conceptDetail.concept && (
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {conceptDetail.concept.title['@value']}
                    </h3>
                    {conceptDetail.concept.fullySpecifiedName && (
                      <p className="text-sm text-gray-300">
                        {conceptDetail.concept.fullySpecifiedName['@value']}
                      </p>
                    )}
                  </div>

                  {/* Definition */}
                  {conceptDetail.concept.definition && (
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">Definition</h4>
                      <p className="text-sm text-gray-300">
                        {conceptDetail.concept.definition['@value']}
                      </p>
                    </div>
                  )}

                  {/* Long Definition */}
                  {conceptDetail.concept.longDefinition && (
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">
                        Detailed Description
                      </h4>
                      <p className="text-sm text-gray-300">
                        {conceptDetail.concept.longDefinition['@value']}
                      </p>
                    </div>
                  )}

                  {/* Synonyms */}
                  {conceptDetail.concept.synonym && conceptDetail.concept.synonym.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2">Synonyms</h4>
                      <div className="flex flex-wrap gap-2">
                        {conceptDetail.concept.synonym.map((syn, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded"
                          >
                            {syn.label['@value']}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inclusions */}
                  {conceptDetail.concept.inclusion && conceptDetail.concept.inclusion.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-300 mb-2">Includes</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {conceptDetail.concept.inclusion.map((inc, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-400">•</span>
                            {inc.label['@value']}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Exclusions */}
                  {conceptDetail.concept.exclusion && conceptDetail.concept.exclusion.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-300 mb-2">Excludes</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {conceptDetail.concept.exclusion.map((exc, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-red-400">•</span>
                            {exc.label['@value']}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Browser URL */}
                  {conceptDetail.concept.browserUrl && (
                    <div>
                      <a
                        href={conceptDetail.concept.browserUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-button w-full text-center"
                      >
                        View in WHO Browser →
                      </a>
                    </div>
                  )}
                </div>
              )}

              {!conceptDetail.concept && conceptDetail.icd10Detail && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {conceptDetail.icd10Detail.title}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {conceptDetail.icd10Detail.code} · {conceptDetail.icd10Detail.chapter}
                    </p>
                  </div>

                  {conceptDetail.icd10Detail.commonSymptoms && (
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Linked symptoms
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {conceptDetail.icd10Detail.commonSymptoms.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-200 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {conceptDetail.icd10Detail.synonyms && conceptDetail.icd10Detail.synonyms.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        Synonyms
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {conceptDetail.icd10Detail.synonyms.map((syn) => (
                          <span
                            key={syn}
                            className="px-2 py-1 text-xs bg-purple-500/20 text-purple-200 rounded"
                          >
                            {syn}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!conceptDetail.concept && !conceptDetail.icd10Detail && !conceptDetail.loading && !conceptDetail.error && (
                <div className="text-center py-8 text-gray-400">
                  <p>Select a code to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ICDLookupPage;
