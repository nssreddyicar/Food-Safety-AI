import { DashboardMetrics, ActionDashboardData, ActionCategory } from '@/types';

interface ReportData {
  timePeriod: string;
  dateRange: { startDate: string; endDate: string };
  actionData: ActionDashboardData;
  metrics: DashboardMetrics;
  officerName: string;
  jurisdictionName: string;
  generatedAt: string;
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `Rs ${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `Rs ${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000) return `Rs ${(amount / 1000).toFixed(2)} K`;
  return `Rs ${amount}`;
};

const getCategoryIcon = (code: string): string => {
  const icons: Record<string, string> = {
    court_cases: '&#9878;',
    adjudication_files: '&#128221;',
    penalty_recovery: '&#8377;',
    pending_inspections: '&#128269;',
    follow_up_inspections: '&#128260;',
    seized_articles: '&#128274;',
    improvement_notices: '&#9888;',
    prohibition_orders: '&#128683;',
    samples_pending: '&#128218;',
    lab_reports_awaited: '&#9201;',
    unsafe_samples: '&#9888;',
    substandard_samples: '&#128203;',
    grievances: '&#128172;',
    special_drives: '&#127919;',
    workshops: '&#128218;',
    license_applications: '&#128196;',
    vvip_duties: '&#11088;',
  };
  return icons[code] || '&#128194;';
};

const getGroupName = (group: string): string => {
  const names: Record<string, string> = {
    legal: 'Legal & Court',
    inspection: 'Inspections & Enforcement',
    sampling: 'Sampling & Laboratory',
    administrative: 'Administrative',
    protocol: 'Protocol & Duties',
  };
  return names[group] || group;
};

export function generateReportHTML(data: ReportData): string {
  const { timePeriod, dateRange, actionData, metrics, officerName, jurisdictionName, generatedAt } = data;

  const groupedCategories: Record<string, ActionCategory[]> = {};
  actionData.categories.forEach((cat) => {
    if (!groupedCategories[cat.group]) {
      groupedCategories[cat.group] = [];
    }
    groupedCategories[cat.group].push(cat);
  });

  const groupOrder = ['legal', 'inspection', 'sampling', 'administrative', 'protocol'];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Food Safety Performance Report - ${timePeriod}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      color: #1f2937;
      background: #ffffff;
    }
    
    .page {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      padding-bottom: 16px;
      border-bottom: 3px solid #1E40AF;
      margin-bottom: 20px;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    
    .logo {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: bold;
    }
    
    .org-name {
      font-size: 18px;
      font-weight: 700;
      color: #1E40AF;
    }
    
    .report-title {
      font-size: 22px;
      font-weight: 700;
      color: #111827;
      margin: 12px 0 4px;
    }
    
    .report-period {
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
    }
    
    .meta-info {
      display: flex;
      justify-content: space-between;
      background: #f8fafc;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 10px;
    }
    
    .meta-item {
      text-align: center;
    }
    
    .meta-label {
      color: #6b7280;
      margin-bottom: 2px;
    }
    
    .meta-value {
      font-weight: 600;
      color: #1f2937;
    }
    
    .section {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #1E40AF;
      padding: 8px 12px;
      background: linear-gradient(90deg, #EFF6FF 0%, #ffffff 100%);
      border-left: 4px solid #1E40AF;
      margin-bottom: 12px;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .summary-card {
      padding: 14px;
      border-radius: 10px;
      text-align: center;
    }
    
    .summary-card.overdue {
      background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
    }
    
    .summary-card.due-today {
      background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
    }
    
    .summary-card.this-week {
      background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);
    }
    
    .summary-card.total {
      background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
    }
    
    .summary-value {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 2px;
    }
    
    .summary-card.overdue .summary-value { color: #DC2626; }
    .summary-card.due-today .summary-value { color: #92400E; }
    .summary-card.this-week .summary-value { color: #1E40AF; }
    .summary-card.total .summary-value { color: #065F46; }
    
    .summary-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .summary-card.overdue .summary-label { color: #B91C1C; }
    .summary-card.due-today .summary-label { color: #78350F; }
    .summary-card.this-week .summary-label { color: #1E3A8A; }
    .summary-card.total .summary-label { color: #047857; }
    
    .category-group {
      margin-bottom: 16px;
    }
    
    .group-header {
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 6px 0;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 8px;
    }
    
    .category-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    
    .category-table th {
      background: #f9fafb;
      padding: 8px 10px;
      text-align: left;
      font-weight: 600;
      color: #4b5563;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .category-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .category-table tr:hover {
      background: #f9fafb;
    }
    
    .category-name {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .category-icon {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }
    
    .count-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 10px;
    }
    
    .count-badge.overdue {
      background: #FEE2E2;
      color: #DC2626;
    }
    
    .count-badge.pending {
      background: #FEF3C7;
      color: #92400E;
    }
    
    .count-badge.total {
      background: #E5E7EB;
      color: #374151;
    }
    
    .stats-section {
      page-break-before: auto;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    
    .stats-card {
      background: #f8fafc;
      border-radius: 10px;
      padding: 14px;
      border: 1px solid #e5e7eb;
    }
    
    .stats-card-title {
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .stats-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px dashed #e5e7eb;
    }
    
    .stats-row:last-child {
      border-bottom: none;
    }
    
    .stats-label {
      color: #4b5563;
    }
    
    .stats-value {
      font-weight: 600;
      color: #1f2937;
    }
    
    .stats-value.highlight {
      color: #1E40AF;
    }
    
    .stats-value.success {
      color: #059669;
    }
    
    .stats-value.warning {
      color: #D97706;
    }
    
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      font-size: 9px;
      color: #9ca3af;
    }
    
    .footer-note {
      margin-bottom: 4px;
    }
    
    .watermark {
      font-weight: 500;
      color: #6b7280;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page {
        padding: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="logo-section">
        <div class="logo">FS</div>
        <div class="org-name">Food Safety Department</div>
      </div>
      <div class="report-title">Performance Report</div>
      <div class="report-period">${timePeriod} (${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)})</div>
    </div>
    
    <div class="meta-info">
      <div class="meta-item">
        <div class="meta-label">Officer</div>
        <div class="meta-value">${officerName}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Jurisdiction</div>
        <div class="meta-value">${jurisdictionName}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Report Period</div>
        <div class="meta-value">${timePeriod}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Generated</div>
        <div class="meta-value">${generatedAt}</div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Action Dashboard Summary</div>
      <div class="summary-grid">
        <div class="summary-card overdue">
          <div class="summary-value">${actionData.totals.overdueItems}</div>
          <div class="summary-label">Overdue</div>
        </div>
        <div class="summary-card due-today">
          <div class="summary-value">${actionData.totals.dueToday}</div>
          <div class="summary-label">Due Today</div>
        </div>
        <div class="summary-card this-week">
          <div class="summary-value">${actionData.totals.dueThisWeek}</div>
          <div class="summary-label">This Week</div>
        </div>
        <div class="summary-card total">
          <div class="summary-value">${actionData.totals.totalItems}</div>
          <div class="summary-label">Total</div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Action Categories Breakdown</div>
      ${groupOrder.map(group => {
        const categories = groupedCategories[group];
        if (!categories || categories.length === 0) return '';
        return `
        <div class="category-group">
          <div class="group-header">${getGroupName(group)}</div>
          <table class="category-table">
            <thead>
              <tr>
                <th style="width: 45%">Category</th>
                <th style="width: 18%; text-align: center;">Overdue</th>
                <th style="width: 18%; text-align: center;">Pending</th>
                <th style="width: 18%; text-align: center;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${categories.map(cat => `
              <tr>
                <td>
                  <div class="category-name">
                    <span class="category-icon" style="background: ${cat.color}20; color: ${cat.color};">${getCategoryIcon(cat.code)}</span>
                    ${cat.name}
                  </div>
                </td>
                <td style="text-align: center;">
                  ${cat.counts.overdue > 0 ? `<span class="count-badge overdue">${cat.counts.overdue}</span>` : '-'}
                </td>
                <td style="text-align: center;">
                  ${cat.counts.pending > 0 ? `<span class="count-badge pending">${cat.counts.pending}</span>` : '-'}
                </td>
                <td style="text-align: center;">
                  <span class="count-badge total">${cat.counts.total}</span>
                </td>
              </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        `;
      }).join('')}
    </div>
    
    <div class="section stats-section">
      <div class="section-title">Statistics Overview</div>
      <div class="stats-grid">
        <div class="stats-card">
          <div class="stats-card-title">&#127942; Licenses & Registrations</div>
          <div class="stats-row">
            <span class="stats-label">Total Licenses</span>
            <span class="stats-value">${metrics.licenses.total}</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Active Licenses</span>
            <span class="stats-value success">${metrics.licenses.active}</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">License Fees Collected</span>
            <span class="stats-value highlight">${formatCurrency(metrics.licenses.amount)}</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Total Registrations</span>
            <span class="stats-value">${metrics.registrations.total}</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Active Registrations</span>
            <span class="stats-value success">${metrics.registrations.active}</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Registration Fees</span>
            <span class="stats-value highlight">${formatCurrency(metrics.registrations.amount)}</span>
          </div>
        </div>
        
        <div class="stats-card">
          <div class="stats-card-title">&#128269; Inspections</div>
          <div class="stats-row">
            <span class="stats-label">License Inspections</span>
            <span class="stats-value">${metrics.inspections.license}</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Registration Inspections</span>
            <span class="stats-value">${metrics.inspections.registration}</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Total Inspections</span>
            <span class="stats-value highlight">${metrics.inspections.license + metrics.inspections.registration}</span>
          </div>
        </div>
        
        <div class="stats-card">
          <div class="stats-card-title">&#128172; Grievances</div>
          <div class="stats-row">
            <span class="stats-label">Online Complaints</span>
            <span class="stats-value">${metrics.grievances.online}</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Offline Complaints</span>
            <span class="stats-value">${metrics.grievances.offline}</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Pending</span>
            <span class="stats-value warning">${metrics.grievances.pending}</span>
          </div>
        </div>
        
        <div class="stats-card">
          <div class="stats-card-title">&#128101; FSW Activities</div>
          <div class="stats-row">
            <span class="stats-label">Testing Programs</span>
            <span class="stats-value">${metrics.fsw.testing}</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Training Sessions</span>
            <span class="stats-value">${metrics.fsw.training}</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Awareness Camps</span>
            <span class="stats-value">${metrics.fsw.awareness}</span>
          </div>
        </div>
        
        <div class="stats-card">
          <div class="stats-card-title">&#9878; Adjudication & Prosecution</div>
          <div class="stats-row">
            <span class="stats-label">Adjudication Total</span>
            <span class="stats-value">${metrics.adjudication.total}</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Adjudication Pending</span>
            <span class="stats-value warning">${metrics.adjudication.pending}</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Prosecution Total</span>
            <span class="stats-value">${metrics.prosecution.total}</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Prosecution Pending</span>
            <span class="stats-value warning">${metrics.prosecution.pending}</span>
          </div>
        </div>
        
        <div class="stats-card">
          <div class="stats-card-title">&#128176; Financial Summary</div>
          <div class="stats-row">
            <span class="stats-label">License Fees</span>
            <span class="stats-value">${formatCurrency(metrics.licenses.amount)}</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Registration Fees</span>
            <span class="stats-value">${formatCurrency(metrics.registrations.amount)}</span>
          </div>
          <div class="stats-row">
            <span class="stats-label">Total Revenue</span>
            <span class="stats-value highlight">${formatCurrency(metrics.licenses.amount + metrics.registrations.amount)}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-note">This report is auto-generated from the Food Safety Inspector App</div>
      <div class="watermark">Food Safety Department | Government of India</div>
    </div>
  </div>
</body>
</html>
  `;
}
