/**
 * ClinicalTrials.gov API v2 Integration Service
 * 
 * Provides access to clinical trial data from ClinicalTrials.gov using the modernized
 * v2 REST API. Supports complex search queries, study record retrieval, and data exports.
 * 
 * @module services/clinicalTrialsService
 * @see {@link https://clinicaltrials.gov/data-api/api|ClinicalTrials.gov API Documentation}
 * 
 * Key Features:
 * - Text search with complex query operators
 * - Study record retrieval with full details
 * - Filtering by status, phase, study type, location
 * - CSV and JSON export capabilities
 * - Version tracking with dataTimestamp
 * 
 * Refresh Schedule:
 * - Daily updates Monday-Friday, typically by 9 AM ET
 * - Check version endpoint for dataTimestamp before ingestion
 * 
 * @example
 * // Search for trials
 * const trials = await clinicalTrialsService.search('diabetes');
 * 
 * @example
 * // Get study details
 * const study = await clinicalTrialsService.getStudy('NCT00000000');
 */

/**
 * Study status types
 */
export enum StudyStatus {
  NOT_YET_RECRUITING = 'Not yet recruiting',
  RECRUITING = 'Recruiting',
  ENROLLING_BY_INVITATION = 'Enrolling by invitation',
  ACTIVE_NOT_RECRUITING = 'Active, not recruiting',
  SUSPENDED = 'Suspended',
  TERMINATED = 'Terminated',
  COMPLETED = 'Completed',
  WITHDRAWN = 'Withdrawn',
  UNKNOWN = 'Unknown status',
}

/**
 * Study phase types
 */
export enum StudyPhase {
  EARLY_PHASE_1 = 'Early Phase 1',
  PHASE_1 = 'Phase 1',
  PHASE_2 = 'Phase 2',
  PHASE_3 = 'Phase 3',
  PHASE_4 = 'Phase 4',
  NOT_APPLICABLE = 'Not Applicable',
}

/**
 * Study type
 */
export enum StudyType {
  INTERVENTIONAL = 'Interventional',
  OBSERVATIONAL = 'Observational',
  EXPANDED_ACCESS = 'Expanded Access',
}

/**
 * Clinical trial record
 */
export interface ClinicalTrial {
  nctId: string;
  title: string;
  acronym?: string;
  status: StudyStatus;
  phase?: StudyPhase[];
  studyType: StudyType;
  enrollment?: number;
  startDate?: string;
  completionDate?: string;
  primaryCompletionDate?: string;
  briefSummary: string;
  detailedDescription?: string;
  conditions: string[];
  interventions: Array<{
    type: string;
    name: string;
    description?: string;
  }>;
  outcomes: Array<{
    type: 'primary' | 'secondary';
    measure: string;
    timeFrame?: string;
    description?: string;
  }>;
  eligibility?: {
    criteria?: string;
    gender?: string;
    minimumAge?: string;
    maximumAge?: string;
    healthyVolunteers?: string;
  };
  locations?: Array<{
    facility?: string;
    city?: string;
    state?: string;
    country?: string;
    status?: string;
  }>;
  sponsor: {
    leadSponsor: string;
    collaborators?: string[];
  };
  studyUrl: string;
  resultsAvailable: boolean;
}

/**
 * Search result from API
 */
export interface ClinicalTrialsSearchResult {
  totalCount: number;
  studies: ClinicalTrial[];
  nextPageToken?: string;
}

/**
 * API version information
 */
export interface APIVersion {
  apiVersion: string;
  dataVersion: string;
  dataTimestamp: string;
}

/**
 * ClinicalTrials.gov Service Configuration
 */
interface ClinicalTrialsConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

/**
 * ClinicalTrials.gov Service Class
 */
export class ClinicalTrialsService {
  private config: ClinicalTrialsConfig;

  constructor() {
    this.config = {
      baseUrl: 'https://clinicaltrials.gov/api/v2',
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
    };
  }

  /**
   * Make HTTP request with retry logic
   * @private
   */
  private async makeRequest(url: string, retryCount: number = 0): Promise<any> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if ((response.status >= 500 || response.status === 429) && retryCount < this.config.retries) {
          const delay = this.config.retryDelay * Math.pow(2, retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(url, retryCount + 1);
        }

        throw new Error(`ClinicalTrials.gov API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (retryCount < this.config.retries && error instanceof Error && error.name !== 'AbortError') {
        const delay = this.config.retryDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(url, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Get API version and data timestamp
   * 
   * @returns {Promise<APIVersion>} Version information
   * 
   * @example
   * const version = await clinicalTrialsService.getVersion();
   * console.log(`Data as of: ${version.dataTimestamp}`);
   */
  async getVersion(): Promise<APIVersion> {
    const url = `${this.config.baseUrl}/version`;
    const data = await this.makeRequest(url);

    return {
      apiVersion: data.apiVersion || 'v2',
      dataVersion: data.dataVersion || 'unknown',
      dataTimestamp: data.dataTimestamp || new Date().toISOString(),
    };
  }

  /**
   * Search for clinical trials
   * 
   * @param {string} query - Search query
   * @param {Object} filters - Filter options
   * @returns {Promise<ClinicalTrialsSearchResult>} Search results
   * 
   * @example
   * const results = await clinicalTrialsService.search('diabetes', {
   *   status: [StudyStatus.RECRUITING],
   *   phase: [StudyPhase.PHASE_3],
   *   pageSize: 20
   * });
   */
  async search(
    query: string,
    filters: {
      status?: StudyStatus[];
      phase?: StudyPhase[];
      studyType?: StudyType[];
      country?: string;
      state?: string;
      pageSize?: number;
      pageToken?: string;
    } = {}
  ): Promise<ClinicalTrialsSearchResult> {
    const url = new URL(`${this.config.baseUrl}/studies`);

    // Add query parameter
    if (query) {
      url.searchParams.set('query.cond', query);
    }

    // Add filters
    if (filters.status && filters.status.length > 0) {
      url.searchParams.set('filter.overallStatus', filters.status.join(','));
    }

    if (filters.phase && filters.phase.length > 0) {
      url.searchParams.set('filter.phase', filters.phase.join(','));
    }

    if (filters.studyType && filters.studyType.length > 0) {
      url.searchParams.set('filter.studyType', filters.studyType.join(','));
    }

    if (filters.country) {
      url.searchParams.set('filter.geo', `COUNTRY:${filters.country}`);
    }

    if (filters.state) {
      url.searchParams.set('filter.geo', `US_STATE:${filters.state}`);
    }

    // Pagination
    url.searchParams.set('pageSize', (filters.pageSize || 20).toString());
    if (filters.pageToken) {
      url.searchParams.set('pageToken', filters.pageToken);
    }

    // Get minimal fields for search results
    url.searchParams.set('fields', 
      'NCTId,BriefTitle,OverallStatus,Phase,StudyType,Condition,InterventionType,InterventionName'
    );

    const data = await this.makeRequest(url.toString());

    const studies: ClinicalTrial[] = (data.studies || []).map((study: any) => 
      this.parseStudy(study)
    );

    return {
      totalCount: data.totalCount || 0,
      studies,
      nextPageToken: data.nextPageToken,
    };
  }

  /**
   * Get full details for a specific study
   * 
   * @param {string} nctId - NCT ID (e.g., 'NCT12345678')
   * @returns {Promise<ClinicalTrial>} Study details
   * 
   * @example
   * const study = await clinicalTrialsService.getStudy('NCT04280705');
   * console.log(study.title, study.status);
   */
  async getStudy(nctId: string): Promise<ClinicalTrial> {
    const url = `${this.config.baseUrl}/studies/${nctId}`;
    const data = await this.makeRequest(url);

    if (!data.protocolSection) {
      throw new Error(`Study ${nctId} not found`);
    }

    return this.parseFullStudy(data.protocolSection, nctId);
  }

  /**
   * Parse study from API response (minimal)
   * @private
   */
  private parseStudy(apiStudy: any): ClinicalTrial {
    const protocolSection = apiStudy.protocolSection || {};
    const idModule = protocolSection.identificationModule || {};
    const statusModule = protocolSection.statusModule || {};
    const designModule = protocolSection.designModule || {};
    const conditionsModule = protocolSection.conditionsModule || {};
    const armsInterventionsModule = protocolSection.armsInterventionsModule || {};

    return {
      nctId: idModule.nctId || '',
      title: idModule.briefTitle || 'No title',
      acronym: idModule.acronym,
      status: statusModule.overallStatus || StudyStatus.UNKNOWN,
      phase: designModule.phases || [],
      studyType: designModule.studyType || StudyType.INTERVENTIONAL,
      briefSummary: '',
      conditions: conditionsModule.conditions || [],
      interventions: (armsInterventionsModule.interventions || []).map((i: any) => ({
        type: i.type,
        name: i.name,
        description: i.description,
      })),
      outcomes: [],
      sponsor: {
        leadSponsor: '',
      },
      studyUrl: `https://clinicaltrials.gov/study/${idModule.nctId}`,
      resultsAvailable: false,
    };
  }

  /**
   * Parse full study details
   * @private
   */
  private parseFullStudy(protocolSection: any, nctId: string): ClinicalTrial {
    const idModule = protocolSection.identificationModule || {};
    const statusModule = protocolSection.statusModule || {};
    const designModule = protocolSection.designModule || {};
    const conditionsModule = protocolSection.conditionsModule || {};
    const armsInterventionsModule = protocolSection.armsInterventionsModule || {};
    const outcomesModule = protocolSection.outcomesModule || {};
    const eligibilityModule = protocolSection.eligibilityModule || {};
    const contactsLocationsModule = protocolSection.contactsLocationsModule || {};
    const sponsorCollaboratorsModule = protocolSection.sponsorCollaboratorsModule || {};
    const descriptionModule = protocolSection.descriptionModule || {};

    return {
      nctId: idModule.nctId || nctId,
      title: idModule.briefTitle || 'No title',
      acronym: idModule.acronym,
      status: statusModule.overallStatus || StudyStatus.UNKNOWN,
      phase: designModule.phases || [],
      studyType: designModule.studyType || StudyType.INTERVENTIONAL,
      enrollment: statusModule.expandedAccessInfo?.enrollment?.value,
      startDate: statusModule.startDateStruct?.date,
      completionDate: statusModule.completionDateStruct?.date,
      primaryCompletionDate: statusModule.primaryCompletionDateStruct?.date,
      briefSummary: descriptionModule.briefSummary || '',
      detailedDescription: descriptionModule.detailedDescription,
      conditions: conditionsModule.conditions || [],
      interventions: (armsInterventionsModule.interventions || []).map((i: any) => ({
        type: i.type,
        name: i.name,
        description: i.description,
      })),
      outcomes: [
        ...(outcomesModule.primaryOutcomes || []).map((o: any) => ({
          type: 'primary' as const,
          measure: o.measure,
          timeFrame: o.timeFrame,
          description: o.description,
        })),
        ...(outcomesModule.secondaryOutcomes || []).map((o: any) => ({
          type: 'secondary' as const,
          measure: o.measure,
          timeFrame: o.timeFrame,
          description: o.description,
        })),
      ],
      eligibility: {
        criteria: eligibilityModule.eligibilityCriteria,
        gender: eligibilityModule.sex,
        minimumAge: eligibilityModule.minimumAge,
        maximumAge: eligibilityModule.maximumAge,
        healthyVolunteers: eligibilityModule.healthyVolunteers,
      },
      locations: (contactsLocationsModule.locations || []).map((loc: any) => ({
        facility: loc.facility,
        city: loc.city,
        state: loc.state,
        country: loc.country,
        status: loc.status,
      })),
      sponsor: {
        leadSponsor: sponsorCollaboratorsModule.leadSponsor?.name || '',
        collaborators: (sponsorCollaboratorsModule.collaborators || []).map((c: any) => c.name),
      },
      studyUrl: `https://clinicaltrials.gov/study/${nctId}`,
      resultsAvailable: !!protocolSection.resultsSection,
    };
  }

  /**
   * Get studies by condition
   * 
   * @param {string} condition - Medical condition
   * @param {number} limit - Maximum results
   * @returns {Promise<ClinicalTrial[]>} Matching studies
   */
  async getStudiesByCondition(condition: string, limit: number = 20): Promise<ClinicalTrial[]> {
    const result = await this.search(condition, { pageSize: limit });
    return result.studies;
  }

  /**
   * Get active recruiting trials
   * 
   * @param {string} condition - Medical condition
   * @param {number} limit - Maximum results
   * @returns {Promise<ClinicalTrial[]>} Active recruiting trials
   */
  async getRecruitingTrials(condition: string, limit: number = 20): Promise<ClinicalTrial[]> {
    const result = await this.search(condition, {
      status: [StudyStatus.RECRUITING],
      pageSize: limit,
    });
    return result.studies;
  }
}

/**
 * Default ClinicalTrials service instance
 */
export const clinicalTrialsService = new ClinicalTrialsService();

export default ClinicalTrialsService;