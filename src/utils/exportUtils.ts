import type { AnnualSummary, MonthlyBreakdown, SalaryInput } from '../types/salary';

export async function exportAsImage(elementId: string, filename = 'cashcalc-result.png') {
  const el = document.getElementById(elementId);
  if (!el) return;

  const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--c-page').trim() || '#ffffff';

  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(el, {
    backgroundColor: bgColor,
    scale: 2,
    logging: false,
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function exportAsPDF(elementId: string, filename = 'cashcalc-report.pdf') {
  const el = document.getElementById(elementId);
  if (!el) return;

  const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--c-page').trim() || '#ffffff';

  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const canvas = await html2canvas(el, {
    backgroundColor: bgColor,
    scale: 2,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  const pdfWidth = 210; // A4 mm
  const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

  const pdf = new jsPDF('p', 'mm', 'a4');
  let yOffset = 0;
  const pageHeight = 297; // A4 mm

  while (yOffset < pdfHeight) {
    if (yOffset > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, -yOffset, pdfWidth, pdfHeight);
    yOffset += pageHeight;
  }

  pdf.save(filename);
}

export async function exportAsExcel(summary: AnnualSummary, filename = 'cashcalc-detail.xlsx') {
  const XLSX = await import('xlsx');

  const monthlyData = summary.monthlyDetails.map((m: MonthlyBreakdown) => ({
    '月份': `${m.month}月`,
    '应发工资': m.grossSalary,
    '社保基数': m.socialInsuranceBase,
    '公积金基数': m.housingFundBase,
    '养老保险(个人)': m.personalInsurance.pension,
    '医疗保险(个人)': m.personalInsurance.medical,
    '失业保险(个人)': m.personalInsurance.unemployment,
    '公积金(个人)': m.personalInsurance.housingFund,
    '五险一金合计(个人)': m.personalInsurance.total,
    '当月应纳税所得': m.taxableIncome,
    '累计应纳税所得': m.cumulativeTaxableIncome,
    '当月个税': m.monthlyTax,
    '到手现金': m.netSalary,
  }));

  const annualData = [{
    '项目': '税前总收入',
    '金额': summary.totalGrossIncome,
  }, {
    '项目': '工资总额(12个月)',
    '金额': summary.totalSalaryGross,
  }, {
    '项目': '年终奖',
    '金额': summary.bonusGross,
  }, {
    '项目': '五险一金个人(全年)',
    '金额': summary.totalPersonalInsurance,
  }, {
    '项目': '工资个税(全年)',
    '金额': summary.salaryTax,
  }, {
    '项目': '年终奖个税',
    '金额': summary.bonusTax,
  }, {
    '项目': '全年到手现金',
    '金额': summary.totalNetCash,
  }, {
    '项目': '养老金(个人+单位)',
    '金额': summary.totalPension,
  }, {
    '项目': '公积金(个人+单位)',
    '金额': summary.totalHousingFund,
  }, {
    '项目': '综合到手价值',
    '金额': summary.totalValue,
  }];

  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.json_to_sheet(annualData);
  XLSX.utils.book_append_sheet(wb, ws1, '年度汇总');

  const ws2 = XLSX.utils.json_to_sheet(monthlyData);
  XLSX.utils.book_append_sheet(wb, ws2, '月度明细');

  XLSX.writeFile(wb, filename);
}

export async function generateShareCard(summary: AnnualSummary, input: SalaryInput): Promise<void> {
  const canvas = document.createElement('canvas');
  const dpr = 2;
  const w = 375;
  const h = 520;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  const isDark = document.documentElement.classList.contains('dark');
  const bg = isDark ? '#09090b' : '#ffffff';
  const cardBg = isDark ? '#18181b' : '#f8f8f8';
  const textPrimary = isDark ? '#e4e4e7' : '#18181b';
  const textSecondary = isDark ? '#a1a1aa' : '#52525b';
  const textTertiary = isDark ? '#71717a' : '#71717a';
  const amber = '#f59e0b';
  const emerald = '#10b981';
  const violet = '#8b5cf6';
  const orange = '#f97316';
  const borderColor = isDark ? '#27272a' : '#e4e4e7';

  const fmt = (n: number) => n.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
  const fmtW = (n: number) => (n / 10000).toFixed(2) + '万';

  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Top gradient bar
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, '#d97706');
  grad.addColorStop(0.5, '#f59e0b');
  grad.addColorStop(1, '#d97706');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, 4);

  // Header
  let y = 32;
  ctx.font = 'bold 22px -apple-system, sans-serif';
  ctx.fillStyle = amber;
  ctx.fillText('Cash', 24, y);
  const cashWidth = ctx.measureText('Cash').width;
  ctx.fillStyle = textSecondary;
  ctx.fillText('Calc', 24 + cashWidth, y);

  ctx.font = '12px -apple-system, sans-serif';
  ctx.fillStyle = textTertiary;
  ctx.fillText(`月Base ${fmt(input.monthlyBase)} · ${input.totalMonths}薪 · 公积金${input.housingFundRate}%`, 24, y + 20);

  // Divider
  y += 36;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, y);
  ctx.lineTo(w - 24, y);
  ctx.stroke();

  // Main value card
  y += 16;
  roundedRect(ctx, 24, y, w - 48, 80, 12, cardBg);
  ctx.font = '10px -apple-system, sans-serif';
  ctx.fillStyle = textTertiary;
  ctx.fillText('年到手现金', 40, y + 22);
  ctx.font = 'bold 28px -apple-system, sans-serif';
  ctx.fillStyle = emerald;
  ctx.fillText(fmtW(summary.totalNetCash), 40, y + 56);
  ctx.font = '11px -apple-system, sans-serif';
  ctx.fillStyle = textTertiary;
  ctx.fillText(fmt(summary.totalNetCash) + ' 元', 40, y + 72);

  // Stats grid
  y += 96;
  const statW = (w - 48 - 12) / 2;
  const stats = [
    { label: '综合价值', value: fmtW(summary.totalValue), color: amber },
    { label: '全年个税', value: fmtW(summary.totalTax), color: orange },
    { label: '公积金(双边)', value: fmtW(summary.totalHousingFund), color: violet },
    { label: '月均到手', value: fmt(summary.totalNetCash / 12) + '元', color: emerald },
  ];

  for (let i = 0; i < stats.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 24 + col * (statW + 12);
    const sy = y + row * 72;

    roundedRect(ctx, x, sy, statW, 60, 10, cardBg);

    ctx.font = '10px -apple-system, sans-serif';
    ctx.fillStyle = textTertiary;
    ctx.fillText(stats[i].label, x + 14, sy + 20);

    ctx.font = 'bold 18px -apple-system, sans-serif';
    ctx.fillStyle = stats[i].color;
    ctx.fillText(stats[i].value, x + 14, sy + 46);
  }

  // Income breakdown
  y += 160;
  const breakdownItems = [
    { label: '税前总收入', value: fmtW(summary.totalGrossIncome), color: textPrimary },
    { label: '五险一金(个人)', value: '-' + fmtW(summary.totalPersonalInsurance), color: '#f43f5e' },
    { label: '个税合计', value: '-' + fmtW(summary.totalTax), color: orange },
    { label: '年终奖', value: fmtW(summary.bonusGross), color: textSecondary },
  ];

  roundedRect(ctx, 24, y, w - 48, breakdownItems.length * 28 + 20, 12, cardBg);
  for (let i = 0; i < breakdownItems.length; i++) {
    const item = breakdownItems[i];
    const iy = y + 18 + i * 28;
    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillStyle = textSecondary;
    ctx.fillText(item.label, 40, iy);
    ctx.font = '12px monospace';
    ctx.fillStyle = item.color;
    const valW = ctx.measureText(item.value).width;
    ctx.fillText(item.value, w - 40 - valW, iy);
  }

  // Footer watermark
  y = h - 28;
  ctx.font = '10px -apple-system, sans-serif';
  ctx.fillStyle = textTertiary;
  const footerText = 'cashcalc.cn · 专业薪资计算器';
  const footerW = ctx.measureText(footerText).width;
  ctx.fillText(footerText, (w - footerW) / 2, y);

  // Download
  const link = document.createElement('a');
  link.download = 'cashcalc-share.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * 竖版海报（1080×1440, 3:4 比例，小红书/抖音友好）
 */
export async function generateVerticalPoster(summary: AnnualSummary, input: SalaryInput): Promise<void> {
  const { getCityPolicy } = await import('../data/cityPolicies');
  const policy = getCityPolicy(input.city);

  const canvas = document.createElement('canvas');
  const dpr = 2;
  const w = 540;
  const h = 720;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  const isDark = document.documentElement.classList.contains('dark');
  const bg = isDark ? '#09090b' : '#fafaf9';
  const cardBg = isDark ? '#18181b' : '#ffffff';
  const textPrimary = isDark ? '#e4e4e7' : '#18181b';
  const textSecondary = isDark ? '#a1a1aa' : '#52525b';
  const textTertiary = isDark ? '#71717a' : '#a1a1aa';
  const amber = '#f59e0b';
  const emerald = '#10b981';
  const violet = '#8b5cf6';
  const orange = '#f97316';
  const sky = '#0ea5e9';
  const rose = '#f43f5e';
  const borderColor = isDark ? '#27272a' : '#e5e5e5';

  const fmt = (n: number) => n.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
  const fmtW = (n: number) => (n / 10000).toFixed(2) + '万';

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Top gradient bar
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, '#d97706');
  grad.addColorStop(0.5, '#f59e0b');
  grad.addColorStop(1, '#d97706');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, 5);

  // Header
  let y = 40;
  ctx.font = 'bold 28px -apple-system, sans-serif';
  ctx.fillStyle = amber;
  ctx.fillText('Cash', 32, y);
  const cashW = ctx.measureText('Cash').width;
  ctx.fillStyle = textSecondary;
  ctx.fillText('Calc', 32 + cashW, y);
  ctx.font = '14px -apple-system, sans-serif';
  ctx.fillStyle = textTertiary;
  ctx.textAlign = 'right';
  ctx.fillText('薪资计算器', w - 32, y);
  ctx.textAlign = 'left';

  // Title line
  y += 28;
  ctx.font = '13px -apple-system, sans-serif';
  ctx.fillStyle = textSecondary;
  ctx.fillText(`${policy.shortName} · 月Base ${fmt(input.monthlyBase)} · ${input.totalMonths}薪 · 公积金${input.housingFundRate}%`, 32, y);

  // Divider
  y += 16;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(32, y);
  ctx.lineTo(w - 32, y);
  ctx.stroke();

  // Big hero number
  y += 32;
  ctx.font = '12px -apple-system, sans-serif';
  ctx.fillStyle = textTertiary;
  ctx.fillText('月均到手', 32, y);
  y += 36;
  ctx.font = 'bold 42px -apple-system, sans-serif';
  ctx.fillStyle = emerald;
  ctx.fillText(fmt(Math.round(summary.totalNetCash / 12)) + ' 元', 32, y);

  y += 20;
  ctx.font = '13px -apple-system, sans-serif';
  ctx.fillStyle = textSecondary;
  ctx.fillText(`全年到手 ${fmtW(summary.totalNetCash)}`, 32, y);

  // Main stats cards (2x2)
  y += 28;
  const cw = (w - 64 - 16) / 2;
  const ch = 72;
  const mainStats = [
    { label: '综合价值', value: fmtW(summary.totalValue), color: amber },
    { label: '全年个税', value: fmtW(summary.totalTax), color: orange },
    { label: '公积金(双边)', value: fmtW(summary.totalHousingFund), color: violet },
    { label: '养老金(双边)', value: fmtW(summary.totalPension), color: sky },
  ];

  for (let i = 0; i < mainStats.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 32 + col * (cw + 16);
    const cy = y + row * (ch + 12);

    roundedRect(ctx, cx, cy, cw, ch, 12, cardBg);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.roundRect(cx, cy, cw, ch, 12);
    ctx.stroke();

    ctx.font = '11px -apple-system, sans-serif';
    ctx.fillStyle = textTertiary;
    ctx.fillText(mainStats[i].label, cx + 16, cy + 24);
    ctx.font = 'bold 22px -apple-system, sans-serif';
    ctx.fillStyle = mainStats[i].color;
    ctx.fillText(mainStats[i].value, cx + 16, cy + 54);
  }

  // Breakdown section
  y += ch * 2 + 12 + 24;
  roundedRect(ctx, 32, y, w - 64, 180, 12, cardBg);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.roundRect(32, y, w - 64, 180, 12);
  ctx.stroke();

  ctx.font = '11px -apple-system, sans-serif';
  ctx.fillStyle = amber;
  ctx.fillText('收支明细', 48, y + 24);

  const items = [
    { label: '税前总收入', value: fmtW(summary.totalGrossIncome), color: textPrimary },
    { label: '  工资(12个月)', value: fmtW(summary.totalSalaryGross), color: textSecondary },
    { label: '  年终奖', value: fmtW(summary.bonusGross), color: textSecondary },
    { label: '五险一金(个人)', value: '-' + fmtW(summary.totalPersonalInsurance), color: rose },
    { label: '个税合计', value: '-' + fmtW(summary.totalTax), color: orange },
    { label: '全年到手', value: fmtW(summary.totalNetCash), color: emerald },
  ];

  for (let i = 0; i < items.length; i++) {
    const iy = y + 46 + i * 22;
    const isLast = i === items.length - 1;

    if (isLast) {
      ctx.strokeStyle = borderColor;
      ctx.beginPath();
      ctx.moveTo(48, iy - 10);
      ctx.lineTo(w - 48, iy - 10);
      ctx.stroke();
    }

    ctx.font = isLast ? 'bold 12px -apple-system, sans-serif' : '12px -apple-system, sans-serif';
    ctx.fillStyle = isLast ? textPrimary : textSecondary;
    ctx.fillText(items[i].label, 48, iy);

    ctx.font = isLast ? 'bold 13px monospace' : '12px monospace';
    ctx.fillStyle = items[i].color;
    const valWidth = ctx.measureText(items[i].value).width;
    ctx.fillText(items[i].value, w - 48 - valWidth, iy);
  }

  // Footer
  y = h - 40;
  ctx.font = '11px -apple-system, sans-serif';
  ctx.fillStyle = textTertiary;
  const footerText = 'cashcalc.cn';
  const footerW2 = ctx.measureText(footerText).width;
  ctx.fillText(footerText, (w - footerW2) / 2, y);

  y += 16;
  ctx.font = '10px -apple-system, sans-serif';
  ctx.fillStyle = textTertiary;
  const subText = '扫码试算你的薪资 ↗';
  const subW = ctx.measureText(subText).width;
  ctx.fillText(subText, (w - subW) / 2, y);

  const link = document.createElement('a');
  link.download = 'cashcalc-poster.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}
