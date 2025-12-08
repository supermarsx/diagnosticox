# DiagnosticoX Cache System Testing Guide

## Overview
This guide provides step-by-step instructions for testing the new intelligent caching system, pre-emptive crawler, and expanded symptom database features in DiagnosticoX.

---

## Test Environment
- **Production URL**: https://4mp4he1jy6pa.space.minimax.io
- **Login Credentials**:
  - Email: `dr.smith@clinic.com`
  - Password: `demo123`

---

## Test Suite 1: Cache Metrics Dashboard

### Objective
Verify the Cache Metrics Dashboard displays real-time performance statistics.

### Steps
1. **Access Dashboard**
   - Navigate to `/settings/cache-metrics`
   - Verify page loads without errors

2. **Check Initial State**
   - **Expected**: Cache metrics showing 0% hit rate (first visit)
   - **Verify**:
     - Cache Hit Rate: 0.0%
     - Total Cached Entries: 0
     - Memory Hits: 0
     - Persistent Hits: 0
     - Crawler Queue: 0 (initially)

3. **Auto-Refresh Feature**
   - **Verify**: Auto-refresh checkbox is checked
   - **Expected**: Dashboard updates every 5 seconds
   - **Action**: Watch metrics for 30 seconds

4. **Manual Refresh**
   - **Action**: Click "Refresh" button
   - **Expected**: Metrics reload immediately

### Success Criteria
- ✅ Dashboard loads successfully
- ✅ All metric cards display values
- ✅ Storage usage shown with percentage bar
- ✅ Crawler status visible
- ✅ Auto-refresh and manual refresh both work

---

## Test Suite 2: Cache Population

### Objective
Verify cache system captures and stores API responses.

### Steps
1. **Initial Cache State**
   - Visit `/settings/cache-metrics`
   - Note baseline metrics (likely 0% hit rate)

2. **Trigger API Calls - Symptom Search**
   - Navigate to `/clinical/symptom-checker`
   - Search for common symptoms:
     - "chest pain"
     - "headache"  
     - "fever"
     - "fatigue"
     - "cough"
   - **Expected**: Results display for each search

3. **Verify Cache Population**
   - Return to `/settings/cache-metrics`
   - **Expected Changes**:
     - Total Cached Entries: >0 (should increase)
     - Memory Cache Size: 5 entries (or more)
     - Total Requests: >0
     - Hit Rate: Still 0% (first searches are misses)

4. **Trigger Cache Hits**
   - Go back to `/clinical/symptom-checker`
   - Search AGAIN for "chest pain" (same query)
   - **Expected**: Instant results (<10ms)

5. **Verify Cache Hits**
   - Return to `/settings/cache-metrics`
   - **Expected Changes**:
     - Memory Hits: ≥1
     - Cache Hit Rate: >0% (improved)
     - Response Time: Faster

### Success Criteria
- ✅ Cache populates after first searches
- ✅ Subsequent identical searches served from cache
- ✅ Hit rate increases after repeated searches
- ✅ Response times <10ms for cached queries

### Console Log Verification
Open browser DevTools Console and look for:
```
[CacheService] Initialized successfully
[CacheIntegration] Cache MISS: symptoms:search:chest pain
[CacheIntegration] Cached: symptoms:search:chest pain
[CacheIntegration] Cache HIT: symptoms:search:chest pain
```

---

## Test Suite 3: Pre-emptive Crawler

### Objective
Verify background crawler prefetches common medical queries.

### Steps
1. **Initial Crawler State**
   - Visit `/settings/cache-metrics`
   - Note "Crawler Queue" value (should be >0 after 2-3 minutes)

2. **Wait for Auto-Start**
   - **Note**: Crawler auto-starts 2 seconds after page load
   - **Expected**: Queue size increases to 20-30 tasks within 1 minute

3. **Monitor Crawler Activity**
   - Watch "Active Tasks" field
   - **Expected**: Shows 1-2 (concurrent task limit)
   - Watch "Queue Size" decrease over time

4. **Verify Crawler Status**
   - **Expected**: Status shows "Running" (green)
   - **Queue Size**: Decreases as tasks complete
   - **Search History**: Increases as patterns analyzed

5. **Check Cache Warming**
   - After 3-5 minutes, check "Total Cached Entries"
   - **Expected**: 20-50 entries prefetched automatically
   - Common queries like "chest pain", "headache", "I21", "E11" should be cached

### Success Criteria
- ✅ Crawler starts automatically (2s delay)
- ✅ Queue populates with 20-30 tasks
- ✅ Active tasks show 1-2 concurrent
- ✅ Cache entries increase from background fetching
- ✅ Crawler status shows "Running"

### Console Log Verification
```
[CrawlerService] Started
[CrawlerService] Warming cache with common queries...
[CrawlerService] Completed: symptoms:chest pain
[CrawlerService] Cached: symptoms:chest pain
```

---

## Test Suite 4: Expanded Symptom Database

### Objective
Verify 2000+ symptom framework with enhanced features.

### Steps
1. **Access Symptom Checker**
   - Navigate to `/clinical/symptom-checker`
   - Verify page loads with search interface

2. **Test Basic Search**
   - Search for common symptoms:
     - "chest pain" - Should show cardiovascular symptoms
     - "cough" - Should show respiratory symptoms
     - "headache" - Should show neurological symptoms
   - **Expected**: Multiple relevant results

3. **Test Multi-System Symptoms**
   - Search for "dyspnea" (affects cardiovascular + respiratory)
   - **Expected**: Results showing multiple organ systems

4. **Verify Urgency Ratings**
   - Search for "chest pain"
   - **Expected**: Results show EMERGENT urgency
   - Look for red flag warnings

5. **Test Symptom Correlations**
   - Select a symptom with known correlations
   - **Expected**: Related symptoms suggested
   - Example: "chest pain" → suggests "palpitations", "dyspnea"

6. **Check Rare Disease Patterns**
   - Search for multiple symptoms matching rare diseases:
     - "facial swelling" + "throat swelling" + "abdominal pain"
   - **Expected**: May trigger rare disease pattern alert

### Success Criteria
- ✅ Search returns multiple relevant symptoms
- ✅ Urgency ratings display correctly
- ✅ Multi-system symptoms show both systems
- ✅ Red flags appear for emergency symptoms
- ✅ Correlation suggestions display
- ✅ Rare disease patterns detected (if applicable)

---

## Test Suite 5: ICD Code Caching

### Objective
Verify ICD code lookups use 30-day cache TTL.

### Steps
1. **First ICD Lookup**
   - Navigate to `/clinical/icd-lookup`
   - Search for ICD code "I21" (Myocardial Infarction)
   - **Expected**: Results load (may take 1-2 seconds)

2. **Verify Cache Miss**
   - Check console for: `[CacheIntegration] Cache MISS: icd:search:I21`
   - **Expected**: First search is a miss

3. **Second ICD Lookup**
   - Search AGAIN for "I21"
   - **Expected**: Instant results (<10ms)

4. **Verify Cache Hit**
   - Check console for: `[CacheIntegration] Cache HIT: icd:search:I21`
   - **Expected**: Second search is a hit

5. **Check Cache Metrics**
   - Visit `/settings/cache-metrics`
   - **Expected**:
     - ICD category shows cached entries
     - Hit rate improved
     - Response time <10ms

### Success Criteria
- ✅ First ICD search takes normal time (API call)
- ✅ Subsequent identical searches are instant
- ✅ Console shows MISS then HIT pattern
- ✅ Cache metrics reflect ICD usage

---

## Test Suite 6: Cache Management

### Objective
Verify cache clearing and maintenance functions.

### Steps
1. **Populate Cache**
   - Perform several searches across different pages
   - Verify cache has entries (check `/settings/cache-metrics`)

2. **Clear Specific Category**
   - On cache metrics page, find "Cache Management" section
   - Click "Clear symptoms" button
   - Confirm action
   - **Expected**: Symptom cache entries removed

3. **Verify Category Clear**
   - Check "Total Cached Entries" decreased
   - Symptom searches now result in cache misses

4. **Clean Expired Entries**
   - Click "Clean Expired" button
   - **Expected**: Alert shows "Cleaned X expired entries"
   - Note: May be 0 if all entries still valid

5. **Clear All Caches** (Use with caution!)
   - Click "Clear All Caches" button (red button)
   - Confirm action
   - **Expected**:
     - Total Cached Entries: 0
     - Hit Rate: 0%
     - All metrics reset

### Success Criteria
- ✅ Category-specific clearing works
- ✅ Expired entry cleanup functions
- ✅ Clear all resets everything
- ✅ Metrics update immediately after clearing

---

## Test Suite 7: Performance Validation

### Objective
Measure actual performance improvements from caching.

### Steps
1. **Baseline Measurement (No Cache)**
   - Clear all caches
   - Open browser DevTools → Network tab
   - Search for "chest pain"
   - **Record**: Response time from Network tab

2. **Cached Measurement**
   - Search for "chest pain" AGAIN (same query)
   - **Record**: Response time from Network tab
   - **Expected**: Significantly faster (<10ms)

3. **Hit Rate Analysis**
   - Perform 20 searches (10 unique, 10 repeats)
   - Check `/settings/cache-metrics`
   - **Expected**: Hit rate ~50% (10 hits / 20 requests)

4. **Storage Usage**
   - Check "Storage Used" metric
   - **Expected**: <50 MB for normal usage
   - **Quota**: Should be <10% of available

5. **Crawler Efficiency**
   - Wait 5 minutes after initial load
   - Check "Total Cached Entries"
   - **Expected**: 30-60 entries from background crawling

### Success Criteria
- ✅ Cached responses <10ms (vs 200-800ms uncached)
- ✅ Hit rate reaches 50%+ with repeated searches
- ✅ Storage usage remains reasonable (<50 MB)
- ✅ Crawler populates 30-60 entries in background

### Performance Targets
| Metric | Target | Measured |
|--------|--------|----------|
| Cache Hit Rate | >70% | ___ |
| Memory Hit Rate | >85% | ___ |
| Cached Response Time | <10ms | ___ |
| API Reduction | 70%+ | ___ |
| Storage Usage | <50 MB | ___ |
| Crawler Queue Size | 20-30 tasks | ___ |

---

## Console Log Reference

### Successful Cache Operation
```
[CacheService] Initialized successfully
[CrawlerService] Started
[CrawlerService] Warming cache with common queries...
[CacheIntegration] Cache MISS: symptoms:search:chest pain
[CacheIntegration] Fetched in 245ms: symptoms:search:chest pain
[CacheIntegration] Cached: symptoms:search:chest pain
[CacheIntegration] Cache HIT: symptoms:search:chest pain
[CrawlerService] Completed: symptoms:chest pain
```

### Error Indicators (Should NOT Appear)
```
[CacheService] Initialization failed: ...
[CrawlerService] Fetch error for ...
[CacheIntegration] Cache error: ...
```

---

## Troubleshooting

### Issue: Cache Hit Rate Stays at 0%
**Cause**: Not searching for same queries twice  
**Solution**: Repeat searches for same symptoms/codes

### Issue: Crawler Queue is 0
**Cause**: Crawler not started or completed all tasks  
**Solution**: Wait 2-3 minutes or refresh page to restart

### Issue: Storage Usage Undefined
**Cause**: Browser doesn't support Storage Estimate API  
**Solution**: Use Chrome/Edge/Firefox latest versions

### Issue: Console Shows Cache Errors
**Cause**: IndexedDB initialization failed  
**Solution**:
1. Check browser supports IndexedDB
2. Clear browser data
3. Disable private/incognito mode
4. Check storage quota not exceeded

---

## Expected Results Summary

### After 5 Minutes of Normal Usage:
- **Cache Hit Rate**: 30-50%
- **Total Cached Entries**: 30-60
- **Memory Cache Size**: 20-40 entries
- **Crawler Queue**: 0-5 pending tasks
- **Storage Used**: 5-15 MB
- **Response Times**: <10ms for cached, 200-800ms for uncached

### After 30 Minutes of Normal Usage:
- **Cache Hit Rate**: 60-80%
- **Total Cached Entries**: 80-150
- **Memory Cache Size**: ~100 entries (near limit)
- **Crawler Queue**: 0 (all common queries cached)
- **Storage Used**: 20-40 MB
- **API Call Reduction**: 70%+

---

## Test Completion Checklist

- [ ] Cache Metrics Dashboard displays correctly
- [ ] Cache populates with symptom searches
- [ ] Cache hits occur on repeated searches
- [ ] Pre-emptive crawler starts automatically
- [ ] Crawler populates cache in background
- [ ] Hit rate increases over time
- [ ] Storage usage remains reasonable
- [ ] Category clearing works
- [ ] Clean expired functions
- [ ] Clear all resets cache
- [ ] Console shows cache operation logs
- [ ] Performance improvements measurable
- [ ] Symptom database shows 2000+ framework
- [ ] Urgency ratings display
- [ ] Correlation suggestions work
- [ ] Multi-system symptoms detected

---

## Reporting Issues

If any test fails, please report with:
1. **Test Suite**: Which test failed
2. **Steps**: Exact steps to reproduce
3. **Expected**: What should happen
4. **Actual**: What actually happened
5. **Console Logs**: Relevant error messages
6. **Screenshots**: Cache metrics or error screens
7. **Browser**: Browser name and version

---

**Happy Testing!**

For additional support, refer to the main README.md documentation.
