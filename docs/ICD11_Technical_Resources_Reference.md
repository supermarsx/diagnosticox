# ICD-11 Implementation: Technical Resources and Links

**Research Date:** November 6, 2025  
**Source:** WHO ICD-11 Implementation FAQ

## Primary Resources

### Essential Documentation
1. **ICD-11 Portal (Main Entry Point)**
   - URL: `https://icd.who.int/en`
   - Description: Primary access point for ICD-11 browser and resources

2. **ICD-11 Implementation or Transition Guide**
   - URL: `https://icd.who.int/docs/ICD-11%20Implementation%20or%20Transition%20Guide_v105.pdf`
   - Description: Comprehensive implementation guidance document (Version 1.05)

3. **ICD-11 Fact Sheet**
   - URL: `https://icd.who.int/en/docs/icd11factsheet_en.pdf`
   - Description: High-level overview document

4. **ICD-11 License**
   - URL: `https://icd.who.int/en/docs/ICD11-license.pdf`
   - Description: Licensing terms and conditions

### Technical APIs and Tools

#### ICD-11 API Services
- **Main API:** `https://icd.who.int/icdapi`
- **Description:** RESTful web services for ICD-11 integration
- **Features:** FHIR compatibility, terminology server integration

#### Embedded Coding Tool
- **Documentation:** `https://icd.who.int/docs/icd-api/icd11ect-1.7/EmbeddedCodingTool/`
- **Description:** Real-time coding assistance tool
- **Version:** 1.7

#### CodeFusion Tool
- **Documentation:** `https://icd.who.int/docs/codefusion/en/`
- **Description:** Advanced workflow management tool for coding

### Browsers and Navigation

#### ICD-11 Browser
- **URL:** `https://icd.who.int/browse`
- **Description:** Web-based browser for ICD-11 codes
- **Features:** Search functionality, code navigation, mapping tables access

#### Development Browser
- **URL:** `https://icd.who.int/dev11/f/en`
- **Description:** Development version with latest updates

#### 2025-01 Release Browser
- **URL:** `https://icd.who.int/browse/2025-01/mms/en#1581163131`
- **Description:** Latest release version (January 2025)

### Training and Educational Resources

#### ICD-11 Training Package
- **URL:** `https://icdcdn.who.int/icd11training/index.html`
- **Description:** Comprehensive training materials and courses

#### Reference Guide
- **URL:** `https://icdcdn.who.int/icd11referenceguide/en/html/index.html`
- **Description:** Detailed technical reference documentation

### Release Information

#### Release Browser
- **URL:** `https://icd.who.int/browse/releases`
- **Description:** Information about ICD-11 updates and releases

### WHO Networks and Support

#### WHO-FIC Maintenance Network
- **URL:** `https://www.who.int/standards/classifications/who-fic-maintenance`
- **Description:** Information about WHO Family of International Classifications maintenance

#### Technical Support Contact
- **Email:** `icd@who.int`
- **Description:** Direct contact for technical assistance and questions

## Key Technical Specifications

### Mapping Tables
- **Access Method:** ICD-11 browser → 'Info' tab
- **Purpose:** Data comparison only (not conversion)
- **Warning:** Not intended for direct data conversion

### Integration Capabilities
- **FHIR Compatibility:** Full support
- **openEHR:** Supported
- **Extension Codes:** Available for detailed clinical information
- **Multilingual Support:** Comprehensive terminological depth

### GitHub Integration
- **Code Snippets:** Available for offline and online integration
- **Purpose:** Software system integration

## Implementation Checklist

### Pre-Implementation
- [ ] Review Implementation Guide (v1.05)
- [ ] Download and review Fact Sheet
- [ ] Understand licensing requirements
- [ ] Assess current ICD-10 usage and requirements

### Technical Setup
- [ ] Access ICD-11 Portal (`https://icd.who.int/en`)
- [ ] Set up ICD-11 API access (`https://icd.who.int/icdapi`)
- [ ] Test API integration capabilities
- [ ] Review Embedded Coding Tool documentation

### Training and Preparation
- [ ] Access training package (`https://icdcdn.who.int/icd11training/index.html`)
- [ ] Review reference guide
- [ ] Train key personnel on ICD-11 concepts
- [ ] Plan pilot implementation

### Pilot and Testing
- [ ] Begin with limited scope pilot
- [ ] Test mapping table functionality
- [ ] Validate API integration
- [ ] Test extension codes implementation

### Full Implementation
- [ ] Scale implementation across organization
- [ ] Complete data migration strategies
- [ ] Establish maintenance procedures
- [ ] Monitor quality metrics

## Critical Limitations

### Mapping Tables
- **Purpose:** Data comparison only
- **Warning:** Not for direct conversion between ICD-10 and ICD-11
- **Limitation:** Cannot capture all differences between the systems

### Dependencies
- **No External Requirements:** ICD-11 functions independently
- **Optional Integrations:** Can work with other terminologies if needed
- **Standalone Capability:** Complete terminological depth provided

### Maintenance
- **Continuous Updates:** Regular improvements and updates
- **Open Process:** Transparent maintenance involving global experts
- **User Feedback:** Responds to implementation experiences

## Emergency Procedures

### Pandemic Response
- **Emergency Codes:** Deployed in both ICD-10 and ICD-11
- **WHO Coordination:** Global coordination for emergency classifications
- **Response Time:** Rapid deployment protocols

---

**Technical Research:** MiniMax Agent  
**Date:** November 6, 2025  
**Verification:** Direct extraction from WHO official documentation