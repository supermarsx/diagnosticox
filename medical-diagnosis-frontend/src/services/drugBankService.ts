/**
 * DrugBank Clinical API Integration Service
 * 
 * Provides access to comprehensive drug information including product details,
 * drug interactions, indications, labels, and clinical data from DrugBank.
 * 
 * @module services/drugBankService
 * @see {@link https://docs.drugbank.com/v1/|DrugBank API Documentation}
 * 
 * Key Features:
 * - Drug and product search
 * - Drug-drug interaction (DDI) checking
 * - Medication labels and indications
 * - Product concepts and formulations
 * - Multi-region support (US, CA, EU)
 * 
 * Authentication:
 * - Requires API token (Authorization: Token token="YOUR_TOKEN")
 * - Rate limits enforced per pricing tier
 * 
 * @example
 * // Search for a drug
 * const drugs = await drugBankService.search('aspirin');
 * 
 * @example
 * // Check drug interactions
 * const interactions = await drugBankService.checkInteractions(['DB00945', 'DB01050']);
 */

/**
 * Drug interaction severity levels
 */
export enum InteractionSeverity {
  CONTRAINDICATED = 'contraindicated',
  MAJOR = 'major',
  MODERATE = 'moderate',
  MINOR = 'minor',
  UNKNOWN = 'unknown',
}

/**
 * Drug product regions
 */
export enum ProductRegion {
  US = 'US',
  CA = 'CA',
  EU = 'EU',
}

/**
 * Drug entity from DrugBank
 */
export interface Drug {
  drugbankId: string;
  name: string;
  description?: string;
  simpleDescription?: string;
  clinicalDescription?: string;
  synonyms?: string[];
  brandNames?: string[];
  indication?: string;
  pharmacodynamics?: string;
  mechanismOfAction?: string;
  toxicity?: string;
  metabolism?: string;
  absorption?: string;
  halfLife?: string;
  proteinBinding?: string;
  routeOfElimination?: string;
  volumeOfDistribution?: string;
  clearance?: string;
  categories?: string[];
  atcCodes?: string[];
}

/**
 * Drug product (formulation)
 */
export interface DrugProduct {
  productId: string;
  name: string;
  drugbankId: string;
  ingredients: Array<{
    drugbankId: string;
    name: string;
    strength?: string;
  }>;
  route?: string;
  dosageForm?: string;
  strength?: string;
  labeller?: string;
  approvalStatus?: string;
  region: ProductRegion;
  ndc?: string; // National Drug Code (US)
  din?: string; // Drug Identification Number (Canada)
}

/**
 * Drug-drug interaction
 */
export interface DrugInteraction {
  drugbankId1: string;
  drugbankId2: string;
  drug1Name: string;
  drug2Name: string;
  severity: InteractionSeverity;
  description: string;
  extendedDescription?: string;
  management?: string;
  references?: Array<{
    pubmedId?: string;
    citation?: string;
  }>;
}

/**
 * Drug indication
 */
export interface DrugIndication {
  drugbankId: string;
  indication: string;
  snomedConcept?: string;
  level: 'approved' | 'off-label' | 'investigational';
}

/**
 * DrugBank Service Configuration
 */
interface DrugBankConfig {
  baseUrl: string;
  apiToken?: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

/**
 * DrugBank Service Class
 */
export class DrugBankService {
  private config: DrugBankConfig;

  /**
   * Initialize DrugBank service
   * 
   * @param {string} apiToken - DrugBank API token
   */
  constructor(apiToken?: string) {
    this.config = {
      baseUrl: 'https://api.drugbank.com/v1',
      apiToken: apiToken || import.meta.env.VITE_DRUGBANK_API_TOKEN,
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
    };
  }

  /**
   * Make HTTP request with authentication and retry logic
   * @private
   */
  private async makeRequest(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<any> {
    if (!this.config.apiToken) {
      throw new Error('DrugBank API token not configured');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const headers: HeadersInit = {
        'Authorization': `Token token="${this.config.apiToken}"`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      };

      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if ((response.status >= 500 || response.status === 429) && retryCount < this.config.retries) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter 
            ? parseInt(retryAfter) * 1000 
            : this.config.retryDelay * Math.pow(2, retryCount);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(endpoint, options, retryCount + 1);
        }

        const errorText = await response.text();
        throw new Error(`DrugBank API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      if (retryCount < this.config.retries && error instanceof Error && error.name !== 'AbortError') {
        const delay = this.config.retryDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(endpoint, options, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Search for drugs
   * 
   * @param {string} query - Search query (drug name, synonym, or identifier)
   * @param {Object} options - Search options
   * @returns {Promise<Drug[]>} Matching drugs
   * 
   * @example
   * const drugs = await drugBankService.search('aspirin', { limit: 10 });
   */
  async search(
    query: string,
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Drug[]> {
    const params = new URLSearchParams({
      q: query,
      limit: (options.limit || 20).toString(),
      offset: (options.offset || 0).toString(),
    });

    const data = await this.makeRequest(`/drugs?${params.toString()}`);
    
    return (data.drugs || []).map((drug: any) => this.parseDrug(drug));
  }

  /**
   * Get drug details by DrugBank ID
   * 
   * @param {string} drugbankId - DrugBank ID (e.g., 'DB00945')
   * @returns {Promise<Drug>} Drug details
   * 
   * @example
   * const drug = await drugBankService.getDrug('DB00945');
   * console.log(drug.name, drug.indication);
   */
  async getDrug(drugbankId: string): Promise<Drug> {
    const data = await this.makeRequest(`/drugs/${drugbankId}`);
    return this.parseDrug(data);
  }

  /**
   * Check drug-drug interactions
   * 
   * @param {string[]} drugbankIds - Array of DrugBank IDs
   * @returns {Promise<DrugInteraction[]>} Drug interactions
   * 
   * @example
   * const interactions = await drugBankService.checkInteractions(['DB00945', 'DB01050']);
   * interactions.forEach(i => {
   *   console.log(`${i.drug1Name} + ${i.drug2Name}: ${i.severity}`);
   * });
   */
  async checkInteractions(drugbankIds: string[]): Promise<DrugInteraction[]> {
    if (drugbankIds.length < 2) {
      return [];
    }

    const params = new URLSearchParams({
      drugbank_ids: drugbankIds.join(','),
    });

    const data = await this.makeRequest(`/ddi?${params.toString()}`);
    
    return (data.interactions || []).map((interaction: any) => ({
      drugbankId1: interaction.drugbank_id_1,
      drugbankId2: interaction.drugbank_id_2,
      drug1Name: interaction.drug_1_name,
      drug2Name: interaction.drug_2_name,
      severity: this.parseSeverity(interaction.severity),
      description: interaction.description || '',
      extendedDescription: interaction.extended_description,
      management: interaction.management,
      references: interaction.references || [],
    }));
  }

  /**
   * Get drug products (formulations)
   * 
   * @param {string} drugbankId - DrugBank ID
   * @param {ProductRegion} region - Product region
   * @returns {Promise<DrugProduct[]>} Drug products
   * 
   * @example
   * const products = await drugBankService.getProducts('DB00945', ProductRegion.US);
   */
  async getProducts(drugbankId: string, region?: ProductRegion): Promise<DrugProduct[]> {
    const params = new URLSearchParams();
    if (region) {
      params.set('region', region);
    }

    const endpoint = `/drugs/${drugbankId}/products${params.toString() ? '?' + params.toString() : ''}`;
    const data = await this.makeRequest(endpoint);
    
    return (data.products || []).map((product: any) => ({
      productId: product.product_id,
      name: product.name,
      drugbankId,
      ingredients: (product.ingredients || []).map((ing: any) => ({
        drugbankId: ing.drugbank_id,
        name: ing.name,
        strength: ing.strength,
      })),
      route: product.route,
      dosageForm: product.dosage_form,
      strength: product.strength,
      labeller: product.labeller,
      approvalStatus: product.approval_status,
      region: product.region || ProductRegion.US,
      ndc: product.ndc,
      din: product.din,
    }));
  }

  /**
   * Get drug indications
   * 
   * @param {string} drugbankId - DrugBank ID
   * @returns {Promise<DrugIndication[]>} Drug indications
   * 
   * @example
   * const indications = await drugBankService.getIndications('DB00945');
   */
  async getIndications(drugbankId: string): Promise<DrugIndication[]> {
    const data = await this.makeRequest(`/drugs/${drugbankId}/indications`);
    
    return (data.indications || []).map((indication: any) => ({
      drugbankId,
      indication: indication.indication,
      snomedConcept: indication.snomed_concept,
      level: indication.level || 'approved',
    }));
  }

  /**
   * Get drug label information
   * 
   * @param {string} drugbankId - DrugBank ID
   * @returns {Promise<any>} Drug label
   */
  async getLabel(drugbankId: string): Promise<any> {
    return await this.makeRequest(`/drugs/${drugbankId}/label`);
  }

  /**
   * Parse drug from API response
   * @private
   */
  private parseDrug(apiDrug: any): Drug {
    return {
      drugbankId: apiDrug.drugbank_id || apiDrug.id,
      name: apiDrug.name,
      description: apiDrug.description,
      simpleDescription: apiDrug.simple_description,
      clinicalDescription: apiDrug.clinical_description,
      synonyms: apiDrug.synonyms,
      brandNames: apiDrug.brand_names,
      indication: apiDrug.indication,
      pharmacodynamics: apiDrug.pharmacodynamics,
      mechanismOfAction: apiDrug.mechanism_of_action,
      toxicity: apiDrug.toxicity,
      metabolism: apiDrug.metabolism,
      absorption: apiDrug.absorption,
      halfLife: apiDrug.half_life,
      proteinBinding: apiDrug.protein_binding,
      routeOfElimination: apiDrug.route_of_elimination,
      volumeOfDistribution: apiDrug.volume_of_distribution,
      clearance: apiDrug.clearance,
      categories: apiDrug.categories,
      atcCodes: apiDrug.atc_codes,
    };
  }

  /**
   * Parse interaction severity
   * @private
   */
  private parseSeverity(severity: string): InteractionSeverity {
    const normalized = (severity || '').toLowerCase();
    
    if (normalized.includes('contraindicated')) return InteractionSeverity.CONTRAINDICATED;
    if (normalized.includes('major')) return InteractionSeverity.MAJOR;
    if (normalized.includes('moderate')) return InteractionSeverity.MODERATE;
    if (normalized.includes('minor')) return InteractionSeverity.MINOR;
    
    return InteractionSeverity.UNKNOWN;
  }

  /**
   * Get recommended alternative medications
   * 
   * @param {string} drugbankId - DrugBank ID
   * @param {string[]} contraindications - Contraindicated DrugBank IDs
   * @returns {Promise<Drug[]>} Alternative medications
   */
  async getAlternatives(drugbankId: string, contraindications: string[] = []): Promise<Drug[]> {
    // First get the drug categories
    const drug = await this.getDrug(drugbankId);
    
    if (!drug.categories || drug.categories.length === 0) {
      return [];
    }

    // Search for drugs in same categories
    const alternatives: Drug[] = [];
    
    for (const category of drug.categories.slice(0, 2)) {
      const results = await this.search(category, { limit: 5 });
      
      // Filter out original drug and contraindications
      const filtered = results.filter(d => 
        d.drugbankId !== drugbankId && 
        !contraindications.includes(d.drugbankId)
      );
      
      alternatives.push(...filtered);
      
      if (alternatives.length >= 10) break;
    }

    return alternatives.slice(0, 10);
  }
}

/**
 * Default DrugBank service instance
 */
export const drugBankService = new DrugBankService();

export default DrugBankService;
