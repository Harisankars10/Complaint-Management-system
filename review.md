# Project Review I – Sample Submission

## 2. Azure Deployment Strategy – Detailed

### Architecture Model
- **Cloud Model:** Public Cloud (Microsoft Azure)  
- **Service Model:**  
  - PaaS for App Service, SQL DB  
  - SaaS for Power BI Embedded  
- **Hosting Region:**  
  - Primary: Central India  
  - DR: South India  

### System Design
- **App Tier:** Azure App Service Premium v2 (P1v2)  
- **Data Tier:** Azure SQL Database (S2) & Blob Storage (Hot Tier, GRS)  
- **Network Tier:** Azure Front Door + CDN for static content  

### Reliability
- **High Availability:**  
  - App Service SLA 99.95%  
  - Geo-replication for DB  
  - GRS for Blob Storage  
- **Disaster Recovery:**  
  - SQL DB backups every 12h (7-day retention)  
  - Blob snapshots every 24h  
  - DR failover in South India  

### Security Measures
- **Authentication:** Azure AD B2C with MFA  
- **Authorization:** RBAC for student/admin roles  
- **Encryption:** AES-256 at rest, TLS 1.2 in transit  
- **Network Security:** NSGs, private endpoints for DB & storage  

### Operational Excellence
- **DevOps:** Azure DevOps Pipelines integrated with GitHub  
- **Deployment:** Blue-Green via deployment slots  
- **Monitoring:** Azure Monitor & Application Insights with performance alerts  

### Cost Optimization
- Auto-scale App Service 1–3 instances based on CPU >70%  
- Blob Lifecycle: Move files >1 year old to Cool tier  
- Reserved Instance pricing for predictable workloads  

---

## 3. Infrastructure Requirements – Functional

| Feature | Expected Usage | Azure Spec | Scaling Method |
|--------|--------------|-----------|---------------|
| User Registration & Login | 5,000 logins/day, 100 concurrent | App Service (P1v2), Azure AD B2C (10k MAUs) | Auto-scale 1–3 instances |
| Record Achievements | 1M records/year | Azure SQL DB (S2, 50 DTUs, 250 GB) | Index optimization |
| Attach Certificates & Media | 50MB/student/year × 5,000 | Azure Blob Storage (Hot Tier, 1 TB) | Hot → Cool tier after 1 year |
| Generate Reports | 100 concurrent views | Power BI Embedded (A1 SKU) | Dataset refresh 8x/day |
| Search & Filter | <1 sec response for 1M rows | SQL Full-Text Search | Index tuning |
| Admin Approval Workflow | ~2,000 executions/month | Azure Functions (Consumption Plan) | Event-driven scaling |

---

## 3. Infrastructure Requirements – Non-Functional

| NFR | Metric Target | Azure Configuration | Reasoning |
|-----|-------------|--------------------|-----------|
| Scalability | Handle 3x load spikes | App Service Auto-scale 1–3 instances | Elastic scaling for exams/events |
| Performance | <500 ms API response | SQL indexing, caching | Smooth user experience |
| Availability | 99.9% uptime | Geo-replication, GRS | Resiliency against failure |
| Security | MFA, TLS 1.2 | Azure AD B2C, Private endpoints | Data protection |
| Cost | ₹8,000/month cap | Azure Cost Management alerts | Budget control |
| Compliance | India data residency | Central India + DR in South India | Regulatory compliance |

---

## 4. Azure Services Mapping – Expanded

| Requirement | Azure Service | SKU/Tier | Purpose | Justification | Est. Monthly Cost (₹) |
|------------|-------------|----------|---------|--------------|----------------------|
| Web App Hosting | Azure App Service | Premium v2 (P1v2) | Host UI + APIs | High performance, SLA 99.95%, supports auto-scale | 3,500 |
| Database | Azure SQL Database | Standard S2 | Achievement records | Scalable relational DB, automated backups | 1,200 |
| File Storage | Azure Blob Storage | Hot Tier, GRS | Certificates & media | High availability, redundancy | 800 |
| Authentication | Azure AD B2C | 10k MAUs | Secure login | Supports MFA, RBAC, social logins | 500 |
| Workflow Automation | Azure Functions | Consumption Plan | Approval process | Event-driven, pay-per-use | 200 |
| Reporting | Power BI Embedded | A1 SKU | Dashboards/reports | Embedded analytics, no per-user license | 1,000 |
| Load Balancing | Azure Front Door | Standard | Traffic routing | Improves latency, HA | 600 |
| Monitoring | Azure Monitor + App Insights | Standard | Track performance | Centralized monitoring | 400 |
| Backup & DR | Azure Backup | Vault (250 GB) | SQL & Blob backup | DR compliance | 300 |
| CI/CD | Azure DevOps | Basic Plan | Deployment automation | Seamless GitHub integration | Free |

---

## 5. High-Level Architecture Diagram

- End Users → Azure Front Door → App Service  
- App Service → SQL DB & Blob Storage  
- Azure Functions for workflows  
- Power BI Embedded for analytics  
- Azure Monitor for tracking  
- Azure Backup for DR  
