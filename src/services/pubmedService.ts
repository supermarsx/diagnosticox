/**
 * PubMed E-utilities Integration Service
 * 
 * Provides access to NCBI PubMed and PMC literature databases using E-utilities API.
 * Implements ESearch, EFetch, ESummary, and ELink utilities for comprehensive
 * biomedical literature retrieval and citation management.
 * 
 * @module services/pubmedService
 * @see {@link https://www.ncbi.nlm.nih.gov/books/NBK25501/|E-utilities API Documentation}
 * 
 * Key Features:
 * - Text search across PubMed and PMC databases
 * - Article metadata and abstract retrieval
 * - Citation information and related articles
 * - History server support for efficient batch operations
 * - Rate limiting compliance (10 req/sec with API key)
 * 
 * Rate Limits:
 * - Without API key: 3 requests/second
 * - With API key: 10 requests/second (default)
 * - Higher rates available by request to NCBI
 * 
 * @example
 * // Search for articles
 * const results = await pubmedService.search('diabetes treatment');
 * 
 * @example
 * // Fetch article details
 * const articles = await pubmedService.fetchArticles(['12345678', '23456789']);
 */

/**
 * PubMed article metadata
 */
export interface PubMedArticle {
  pmid: string;
  title: string;
  abstract?: string;
  authors: string[];
  journal: string;
  pubDate: string;
  doi?: string;
  pmcid?: string;
  articleUrl: string;
  citationCount?: number;
  meshTerms?: string[];
  keywords?: string[];
}

/**
 * PubMed search result
 */
export interface PubMedSearchResult {
  count: number;
  retmax: number;
  retstart: number;
  idList: string[];
  translationSet?: any;
  translationStack?: any;
  queryTranslation?: string;
  webEnv?: string;
  queryKey?: string;
}

/**
 * Article summary from ESummary
 */
export interface PubMedSummary {
  uid: string;
  pubdate: string;
  epubdate: string;
  source: string;
  authors: Array<{ name: string; authtype: string }>;
  title: string;
  volume: string;
  issue: string;
  pages: string;
  articleids: Array<{ idtype: string; value: string }>;
  fulljournalname: string;
  sortpubdate: string;
}

/**
 * Evidence level classification for articles
 */
export enum EvidenceLevel {
  SYSTEMATIC_REVIEW = 'Systematic Review/Meta-Analysis',
  RANDOMIZED_TRIAL = 'Randomized Controlled Trial',
  COHORT_STUDY = 'Cohort Study',
  CASE_CONTROL = 'Case-Control Study',
  CASE_SERIES = 'Case Series',
  EXPERT_OPINION = 'Expert Opinion',
  OTHER = 'Other',
}

/**
 * PubMed Service Configuration
 */
interface PubMedConfig {
  baseUrl: string;
  apiKey?: string;
  tool: string;
  email: string;
  retries: number;
  retryDelay: number;
}

/**
 * PubMed Service Class
 */
export class PubMedService {
  private config: PubMedConfig;
  private requestQueue: Array<() => Promise<any>> = [];
  private lastRequestTime: number = 0;
  private readonly minRequestInterval: number = 100; // 10 requests/second with API key

  /**
   * Initialize PubMed service
   * 
   * @param {string} apiKey - NCBI API key (optional but recommended)
   * @param {string} email - Contact email (required)
   * @param {string} tool - Tool name for identification
   */
  constructor(apiKey?: string, email: string = 'noreply@medicalapp.com', tool: string = 'MedicalDiagnosisApp') {
    this.config = {
      baseUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
      apiKey,
      tool,
      email,
      retries: 3,
      retryDelay: 1000,
    };
  }

  /**
   * Rate limiting: Ensure minimum interval between requests
   * @private
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    
    if (elapsed < this.minRequestInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - elapsed));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Make HTTP request with retry logic
   * @private
   */
  private async makeRequest(url: string, retryCount: number = 0): Promise<any> {
    await this.rateLimit();

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 429 && retryCount < this.config.retries) {
          // Rate limited - exponential backoff
          const delay = this.config.retryDelay * Math.pow(2, retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(url, retryCount + 1);
        }
        
        throw new Error(`PubMed API error: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      return text;
    } catch (error) {
      if (retryCount < this.config.retries) {
        const delay = this.config.retryDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(url, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Build URL with common parameters
   * @private
   */
  private buildUrl(utility: string, params: Record<string, string>): string {
    const url = new URL(`${this.config.baseUrl}/${utility}.fcgi`);
    
    // Add common parameters
    if (this.config.apiKey) {
      url.searchParams.set('api_key', this.config.apiKey);
    }
    url.searchParams.set('tool', this.config.tool);
    url.searchParams.set('email', this.config.email);
    
    // Add specific parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    return url.toString();
  }

  /**
   * Parse XML response to JSON (simple parser)
   * @private
   */
  private parseXML(xmlText: string): any {
    // Simple XML parsing - in production, use DOMParser or xml2js
    // For now, extract key data using regex
    const result: any = {};
    
    // Extract ID list
    const idMatches = xmlText.match(/<Id>(\d+)<\/Id>/g);
    if (idMatches) {
      result.idList = idMatches.map(m => m.replace(/<\/?Id>/g, ''));
    }
    
    // Extract count
    const countMatch = xmlText.match(/<Count>(\d+)<\/Count>/);
    if (countMatch) {
      result.count = parseInt(countMatch[1]);
    }
    
    // Extract retmax and retstart
    const retmaxMatch = xmlText.match(/<RetMax>(\d+)<\/RetMax>/);
    if (retmaxMatch) {
      result.retmax = parseInt(retmaxMatch[1]);
    }
    
    const retstartMatch = xmlText.match(/<RetStart>(\d+)<\/RetStart>/);
    if (retstartMatch) {
      result.retstart = parseInt(retstartMatch[1]);
    }
    
    // Extract WebEnv and QueryKey for history server
    const webenvMatch = xmlText.match(/<WebEnv>([^<]+)<\/WebEnv>/);
    if (webenvMatch) {
      result.webEnv = webenvMatch[1];
    }
    
    const querykeyMatch = xmlText.match(/<QueryKey>(\d+)<\/QueryKey>/);
    if (querykeyMatch) {
      result.queryKey = querykeyMatch[1];
    }
    
    return result;
  }

  /**
   * Search PubMed for articles
   * 
   * @param {string} query - Search query (PubMed syntax)
   * @param {Object} options - Search options
   * @returns {Promise<PubMedSearchResult>} Search results with PMIDs
   * 
   * @example
   * const results = await pubmedService.search('diabetes[MeSH] AND 2023[PDAT]', {
   *   retmax: 100,
   *   usehistory: true
   * });
   */
  async search(
    query: string,
    options: {
      retmax?: number;
      retstart?: number;
      usehistory?: boolean;
      sort?: 'relevance' | 'pub_date' | 'first_author';
    } = {}
  ): Promise<PubMedSearchResult> {
    const params: Record<string, string> = {
      db: 'pubmed',
      term: query,
      retmode: 'xml',
      retmax: (options.retmax || 20).toString(),
      retstart: (options.retstart || 0).toString(),
    };

    if (options.usehistory) {
      params.usehistory = 'y';
    }

    if (options.sort) {
      params.sort = options.sort;
    }

    const url = this.buildUrl('esearch', params);
    const xmlText = await this.makeRequest(url);
    const result = this.parseXML(xmlText);

    return {
      count: result.count || 0,
      retmax: result.retmax || 0,
      retstart: result.retstart || 0,
      idList: result.idList || [],
      webEnv: result.webEnv,
      queryKey: result.queryKey,
    };
  }

  /**
   * Fetch article summaries (metadata only)
   * 
   * @param {string[]} pmids - PubMed IDs
   * @returns {Promise<PubMedArticle[]>} Article summaries
   * 
   * @example
   * const articles = await pubmedService.fetchSummaries(['12345678', '23456789']);
   */
  async fetchSummaries(pmids: string[]): Promise<PubMedArticle[]> {
    if (pmids.length === 0) return [];

    const params: Record<string, string> = {
      db: 'pubmed',
      id: pmids.join(','),
      retmode: 'json',
    };

    const url = this.buildUrl('esummary', params);
    const response = await this.makeRequest(url);
    const data = JSON.parse(response);

    const articles: PubMedArticle[] = [];
    
    if (data.result) {
      pmids.forEach(pmid => {
        const article = data.result[pmid];
        if (article && article.uid) {
          articles.push({
            pmid: article.uid,
            title: article.title || 'No title',
            authors: article.authors?.map((a: any) => a.name) || [],
            journal: article.fulljournalname || article.source || '',
            pubDate: article.pubdate || article.sortpubdate || '',
            doi: article.articleids?.find((id: any) => id.idtype === 'doi')?.value,
            pmcid: article.articleids?.find((id: any) => id.idtype === 'pmcid')?.value,
            articleUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
          });
        }
      });
    }

    return articles;
  }

  /**
   * Fetch full article details including abstracts
   * 
   * @param {string[]} pmids - PubMed IDs
   * @returns {Promise<PubMedArticle[]>} Full article details
   * 
   * @example
   * const articles = await pubmedService.fetchArticles(['12345678']);
   * console.log(articles[0].abstract);
   */
  async fetchArticles(pmids: string[]): Promise<PubMedArticle[]> {
    if (pmids.length === 0) return [];

    const params: Record<string, string> = {
      db: 'pubmed',
      id: pmids.join(','),
      retmode: 'xml',
      rettype: 'abstract',
    };

    const url = this.buildUrl('efetch', params);
    const xmlText = await this.makeRequest(url);

    // Parse XML to extract article details
    // In production, use a proper XML parser
    const articles: PubMedArticle[] = pmids.map(pmid => {
      const titleMatch = xmlText.match(/<ArticleTitle>([^<]+)<\/ArticleTitle>/);
      const abstractMatch = xmlText.match(/<AbstractText>([^<]+)<\/AbstractText>/);
      
      return {
        pmid,
        title: titleMatch ? titleMatch[1] : 'No title',
        abstract: abstractMatch ? abstractMatch[1] : undefined,
        authors: [],
        journal: '',
        pubDate: '',
        articleUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      };
    });

    return articles;
  }

  /**
   * Find related articles using ELink
   * 
   * @param {string} pmid - PubMed ID
   * @param {number} count - Number of related articles to fetch
   * @returns {Promise<string[]>} Related article PMIDs
   * 
   * @example
   * const relatedIds = await pubmedService.findRelated('12345678', 10);
   */
  async findRelated(pmid: string, count: number = 10): Promise<string[]> {
    const params: Record<string, string> = {
      dbfrom: 'pubmed',
      db: 'pubmed',
      id: pmid,
      cmd: 'neighbor',
      retmode: 'xml',
    };

    const url = this.buildUrl('elink', params);
    const xmlText = await this.makeRequest(url);
    const result = this.parseXML(xmlText);

    return (result.idList || []).slice(0, count);
  }

  /**
   * Determine evidence level from MeSH terms or publication type
   * 
   * @param {PubMedArticle} article - Article to classify
   * @returns {EvidenceLevel} Evidence level classification
   */
  classifyEvidenceLevel(article: PubMedArticle): EvidenceLevel {
    const title = article.title.toLowerCase();
    const terms = (article.meshTerms || []).map(t => t.toLowerCase());

    if (terms.includes('systematic review') || terms.includes('meta-analysis') ||
        title.includes('systematic review') || title.includes('meta-analysis')) {
      return EvidenceLevel.SYSTEMATIC_REVIEW;
    }

    if (terms.includes('randomized controlled trial') || title.includes('rct') ||
        title.includes('randomized')) {
      return EvidenceLevel.RANDOMIZED_TRIAL;
    }

    if (terms.includes('cohort study') || title.includes('cohort')) {
      return EvidenceLevel.COHORT_STUDY;
    }

    if (terms.includes('case-control') || title.includes('case-control')) {
      return EvidenceLevel.CASE_CONTROL;
    }

    if (terms.includes('case series') || terms.includes('case report')) {
      return EvidenceLevel.CASE_SERIES;
    }

    return EvidenceLevel.OTHER;
  }

  /**
   * Get total database count
   * @returns {number} Total articles in PubMed
   */
  async getDatabaseInfo(): Promise<{ count: number; lastUpdate: string }> {
    // Mock implementation - in production, use EInfo utility
    return {
      count: 35000000, // Approximate PubMed size
      lastUpdate: new Date().toISOString(),
    };
  }
}

/**
 * Default PubMed service instance
 */
export const pubmedService = new PubMedService(
  import.meta.env.VITE_NCBI_API_KEY,
  import.meta.env.VITE_CONTACT_EMAIL || 'noreply@medicalapp.com'
);

export default PubMedService;