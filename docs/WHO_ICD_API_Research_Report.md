# WHO ICD API Research Report

## Overview
The WHO ICD-API is an HTTP-based REST API providing programmatic access to the International Classification of Diseases (ICD) data, including ICD-11 Foundation Component, ICD-11 Linearizations (e.g., Mortality and Morbidity Statistics - MMS), and ICD-10 (limited functionality).

## API Endpoints

### 1. Foundation Endpoints
- **GET `/icd/entity`** - Returns basic information on the latest release of ICD-11 Foundation with top-level entities
- **GET `/icd/entity/{id}`** - Provides information on a specific ICD-11 foundation entity
- **GET `/icd/entity/search`** - Search foundation component (supports GET/POST, POST recommended for large requests)
- **GET `/icd/entity/autocode`** - Provides best matching classification entity for diagnostic text

### 2. ICD-10 Endpoints
- **GET `/icd/release/10`** - Lists available ICD-10 releases
- **GET `/icd/release/10/{releaseId}`** - Returns basic information on a specific ICD-10 release
- **GET `/icd/release/10/{releaseId}/{code}`** - Returns information on a specific category within an ICD-10 release

### 3. Linearization Endpoints (ICD-11)
- **GET `/icd/release/11/{linearizationname}`** - Returns basic information on a linearization (e.g., MMS)
- **GET `/icd/release/11/{releaseId}/{linearizationname}/{id}`** - Returns information on a specific linearization entity
- **GET `/icd/release/11/{releaseId}/{linearizationname}/search`** - Search within a linearization (supports GET/POST)
- **GET `/icd/release/11/{releaseId}/{linearizationname}/autocode** - Autocoding for linearization entities
- **GET `/icd/release/11/{releaseId}/doris`** - Performs underlying cause of death detection using DORIS system

## Authentication Requirements

### OAuth 2.0 Client Credentials Flow

1. **Registration**: Register at https://icd.who.int/icdapi to obtain `clientid` and `clientsecret`
2. **Token Endpoint**: `https://icdaccessmanagement.who.int/connect/token`
3. **Token Request**: 
   - Use Basic Authentication with clientid and clientsecret
   - Request body parameters:
     - `grant_type=client_credentials`
     - `scope=icdapi_access`
4. **Token Usage**: Include acquired token as Bearer token in Authorization header
5. **Token Validity**: Approximately 1 hour

### Required Headers
- `API-Version: v2` (required for all requests)
- `Authorization: Bearer {access_token}`
- `Accept: application/json` or `application/ld+json`
- `Accept-Language: {language_code}` (for content negotiation)

## Getting Started Instructions

### Step 1: Obtain API Access
1. Visit https://icd.who.int/icdapi
2. Register for an account
3. Retrieve your `clientid` and `clientsecret` from the dashboard

### Step 2: Obtain Access Token
```csharp
// Example C# code for token acquisition
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

public class IcdApiClient
{
    private readonly HttpClient _httpClient;
    private readonly string _clientId;
    private readonly string _clientSecret;
    private readonly string _tokenEndpoint = "https://icdaccessmanagement.who.int/connect/token";
    private string _accessToken;

    public async Task<string> GetAccessTokenAsync()
    {
        var tokenRequest = new HttpRequestMessage(HttpMethod.Post, _tokenEndpoint);
        var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_clientId}:{_clientSecret}"));
        tokenRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);
        
        var content = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("grant_type", "client_credentials"),
            new KeyValuePair<string, string>("scope", "icdapi_access")
        });
        tokenRequest.Content = content;

        var response = await _httpClient.SendAsync(tokenRequest);
        var tokenResponse = await response.Content.ReadAsStringAsync();
        
        // Parse tokenResponse to extract access_token
        // Parse tokenResponse to extract expires_in
        
        return _accessToken;
    }
}
```

### Step 3: Make API Requests
All requests must include:
- HTTPS protocol
- Required headers (API-Version: v2)
- Bearer token in Authorization header

## Code Examples and Developer Resources

### Available Code Samples (GitHub Organization: https://github.com/icd-api)
- **Python Samples**: https://github.com/ICD-API/Python-samples
- **PHP Samples**: https://github.com/ICD-API/PHP-samples
- **C# Samples**: https://github.com/ICD-API/csharp-samples
- **Java Samples**: https://github.com/ICD-API/Java-samples
- **Ruby Samples**: https://github.com/ICD-API/Ruby-samples
- **R Samples**: https://github.com/ICD-API/R-samples

### Embedded Coding Tool (ECT) Integration
- **Angular**: https://github.com/ICD-API/ECT-Angular-samples
- **React**: https://github.com/ICD-API/ECT-React-samples
- **Vue.js**: https://github.com/ICD-API/ECT-Vuejs-samples
- **Vanilla JavaScript**: https://github.com/ICD-API/ECT-JavaScript-samples

### Specialized Integrations
- **DORIS Samples**: https://github.com/ICD-API/ICD-API-DORIS-Samples

## Technical Specifications

### Response Formats
- **Classification Entities**: JSON-LD format (default)
- **Search Results**: Plain JSON format
- **Content Negotiation**: Support for multiple languages via Accept-Language header

### API Version
- **Current Version**: v2.5.0
- **OpenAPI Specification**: OAS3
- **Documentation**: Available at https://id.who.int/swagger/index.html

### Special Features
- **AutoCoding**: Automatic mapping of diagnostic text to classification entities
- **DORIS Integration**: Underlying cause of death detection
- **FHIR Support**: Integration with Fast Healthcare Interoperability Resources
- **Multilingual Support**: Content negotiation for different languages

## Deployment Options
- **Local Deployment**: Docker containers, Windows Service, systemd (Linux)
- **API Distribution**: Open source and free to use
- **License**: Creative Commons Attribution-NoDerivs 3.0 IGO

## Important Notes
1. All API communication must use HTTPS
2. HTTP requests are automatically redirected to HTTPS
3. Search endpoints support both GET and POST; POST is recommended for large requests (GET has 2K size limit)
4. Tokens expire after approximately 1 hour and must be refreshed
5. For ICD-11 statistical classification, use linearization endpoints with `linearizationname=mms`

## Documentation Links
- **Main Documentation**: https://icd.who.int/docs/icd-api/
- **API Reference**: https://id.who.int/swagger/index.html
- **Authentication Guide**: https://icd.who.int/docs/icd-api/API-Authentication/
- **Release Notes**: https://icd.who.int/docs/icd-api/ReleaseNotes/
- **Supported Classifications**: https://icd.who.int/docs/icd-api/SupportedClassifications/

The WHO ICD API provides comprehensive access to international disease classification standards with extensive developer support and multiple integration options.