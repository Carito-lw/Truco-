import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export type GameCallType = 'Truco' | 'Envido' | 'Flor';

export interface GameTelemetryEvent {
  id: string;
  type: GameCallType;
  callName: string;
  caller: 'Vos' | 'ElTape_99';
  winner: 'Vos' | 'ElTape_99' | 'Pendiente';
  points: number;
  timestamp: string;
  detail: string;
}

interface MesaTelemetryProps {
  events: GameTelemetryEvent[];
  onAddEvent?: (event: GameTelemetryEvent) => void;
}

export const MesaTelemetry: React.FC<MesaTelemetryProps> = ({ events, onAddEvent }) => {
  const chartRef = useRef<SVGSVGElement | null>(null);
  const barChartRef = useRef<SVGSVGElement | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'All' | GameCallType>('All');
  const [activeTab, setActiveTab] = useState<'chart' | 'log'>('chart');

  // Compute metrics
  const vosWins = events.filter((e) => e.winner === 'Vos').length;
  const ellosWins = events.filter((e) => e.winner === 'ElTape_99').length;
  const totalDecided = vosWins + ellosWins;
  const vosWinPct = totalDecided > 0 ? Math.round((vosWins / totalDecided) * 100) : 50;

  // Breakdown by call type
  const typeMetrics = (type: GameCallType) => {
    const ofType = events.filter((e) => e.type === type);
    const vos = ofType.filter((e) => e.winner === 'Vos').length;
    const ellos = ofType.filter((e) => e.winner === 'ElTape_99').length;
    const pointsWonVos = ofType.filter((e) => e.winner === 'Vos').reduce((sum, e) => sum + e.points, 0);
    const pointsWonEllos = ofType.filter((e) => e.winner === 'ElTape_99').reduce((sum, e) => sum + e.points, 0);
    return { total: ofType.length, vos, ellos, pointsWonVos, pointsWonEllos };
  };

  const trucoStats = typeMetrics('Truco');
  const envidoStats = typeMetrics('Envido');
  const florStats = typeMetrics('Flor');

  // D3 Donut Chart: Win Distribution between Vos and Rival
  useEffect(() => {
    if (!chartRef.current) return;

    const svg = d3.select(chartRef.current);
    svg.selectAll('*').remove();

    const width = 220;
    const height = 220;
    const margin = 10;
    const radius = Math.min(width, height) / 2 - margin;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const data: { label: string; value: number; color: string }[] = [
      { label: 'Vos', value: vosWins, color: '#a5d0b7' },
      { label: 'ElTape_99', value: ellosWins, color: '#ffb95f' },
    ];

    // If zero games decided yet, provide a neutral slice
    const plotData = totalDecided === 0 ? [{ label: 'En juego', value: 1, color: '#303633' }] : data;

    const pie = d3
      .pie<{ label: string; value: number; color: string }>()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<{ label: string; value: number; color: string }>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius)
      .cornerRadius(4)
      .padAngle(0.04);

    const arcs = g
      .selectAll('.arc')
      .data(pie(plotData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => d.data.color)
      .attr('stroke', '#0f1512')
      .attr('stroke-width', 2)
      .style('opacity', 0.9)
      .on('mouseenter', function () {
        d3.select(this).style('opacity', 1).attr('stroke', '#ffffff');
      })
      .on('mouseleave', function () {
        d3.select(this).style('opacity', 0.9).attr('stroke', '#0f1512');
      });

    // Center text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('fill', '#a5d0b7')
      .attr('font-size', '26px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Plus Jakarta Sans, sans-serif')
      .text(`${vosWinPct}%`);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.3em')
      .attr('fill', '#dee4df')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('text-transform', 'uppercase')
      .attr('letter-spacing', '0.08em')
      .text('Eficacia Vos');
  }, [vosWins, ellosWins, totalDecided, vosWinPct]);

  // D3 Grouped Bar Chart: Points won by Call Type (Truco, Envido, Flor)
  useEffect(() => {
    if (!barChartRef.current) return;

    const svg = d3.select(barChartRef.current);
    svg.selectAll('*').remove();

    const width = 320;
    const height = 180;
    const margin = { top: 20, right: 15, bottom: 30, left: 35 };

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const categories: GameCallType[] = ['Truco', 'Envido', 'Flor'];
    const barData = categories.map((cat) => {
      const stats = typeMetrics(cat);
      return {
        category: cat,
        Vos: stats.pointsWonVos,
        Rival: stats.pointsWonEllos,
      };
    });

    const x0 = d3.scaleBand().domain(categories).rangeRound([0, chartWidth]).paddingInner(0.25);
    const x1 = d3.scaleBand().domain(['Vos', 'Rival']).rangeRound([0, x0.bandwidth()]).padding(0.1);

    const maxVal = d3.max(barData, (d) => Math.max(d.Vos, d.Rival)) || 4;
    const y = d3.scaleLinear().domain([0, Math.max(maxVal, 4)]).nice().rangeRound([chartHeight, 0]);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x0).tickSize(0))
      .call((axis) => axis.select('.domain').attr('stroke', '#414943'))
      .call((axis) =>
        axis
          .selectAll('text')
          .attr('fill', '#dee4df')
          .attr('font-size', '11px')
          .attr('font-weight', '600')
          .attr('dy', '10px')
      );

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickSize(-chartWidth))
      .call((axis) => axis.select('.domain').remove())
      .call((axis) => axis.selectAll('.tick line').attr('stroke', '#1b211e').attr('stroke-dasharray', '2,2'))
      .call((axis) => axis.selectAll('text').attr('fill', '#8b938c').attr('font-size', '10px'));

    // Bars
    const categoryGroup = g
      .selectAll('.cat-group')
      .data(barData)
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${x0(d.category)},0)`);

    // Vos Bars
    categoryGroup
      .append('rect')
      .attr('x', x1('Vos') || 0)
      .attr('y', (d) => y(d.Vos))
      .attr('width', x1.bandwidth())
      .attr('height', (d) => chartHeight - y(d.Vos))
      .attr('fill', '#a5d0b7')
      .attr('rx', 3);

    // Vos Value Labels
    categoryGroup
      .append('text')
      .attr('x', (x1('Vos') || 0) + x1.bandwidth() / 2)
      .attr('y', (d) => y(d.Vos) - 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#a5d0b7')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text((d) => (d.Vos > 0 ? `${d.Vos}p` : ''));

    // Rival Bars
    categoryGroup
      .append('rect')
      .attr('x', x1('Rival') || 0)
      .attr('y', (d) => y(d.Rival))
      .attr('width', x1.bandwidth())
      .attr('height', (d) => chartHeight - y(d.Rival))
      .attr('fill', '#ffb95f')
      .attr('rx', 3);

    // Rival Value Labels
    categoryGroup
      .append('text')
      .attr('x', (x1('Rival') || 0) + x1.bandwidth() / 2)
      .attr('y', (d) => y(d.Rival) - 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffb95f')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text((d) => (d.Rival > 0 ? `${d.Rival}p` : ''));
  }, [events]);

  const filteredEvents = selectedFilter === 'All' ? events : events.filter((e) => e.type === selectedFilter);

  return (
    <div className="w-full bg-surface-container-low rounded-2xl p-space-md shadow-2xl border border-surface-container-high/60 mt-space-md">
      {/* Telemetry Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-sm mb-space-sm border-b border-surface-container-high gap-2">
        <div className="flex items-center gap-space-xs">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-primary border border-primary/30">
            <span className="material-symbols-outlined text-title-md">query_stats</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline-md text-headline-md text-primary tracking-tight leading-none">
                Telemetría de Cantes &amp; Distribución
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm uppercase font-bold text-[10px] border border-secondary/30">
                En Vivo (D3)
              </span>
            </div>
            <p className="font-label-sm text-on-surface-variant text-[11px] mt-0.5">
              Registro analítico en tiempo real de 'Truco', 'Envido' y 'Flor' con cálculo de victorias relativas.
            </p>
          </div>
        </div>

        {/* View switcher tabs */}
        <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-surface-container-high">
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'chart'
                ? 'bg-primary-container text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            Gráficos D3
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'log'
                ? 'bg-primary-container text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            <span>Historial</span>
            <span className="w-4 h-4 rounded-full bg-secondary text-on-secondary text-[9px] flex items-center justify-center font-bold">
              {events.length}
            </span>
          </button>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs mb-space-md">
        <div className="p-space-xs px-3 bg-surface-container rounded-lg border border-surface-container-high/40">
          <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider block">
            Victorias Vos
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-title-lg font-bold text-primary">{vosWins}</span>
            <span className="text-xs text-on-surface-variant">de {totalDecided} cantes</span>
          </div>
        </div>

        <div className="p-space-xs px-3 bg-surface-container rounded-lg border border-surface-container-high/40">
          <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider block">
            Victorias Rival
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-title-lg font-bold text-secondary">{ellosWins}</span>
            <span className="text-xs text-on-surface-variant">de {totalDecided} cantes</span>
          </div>
        </div>

        <div className="p-space-xs px-3 bg-surface-container rounded-lg border border-surface-container-high/40">
          <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider block">
            Puntos Truco
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-title-lg font-bold text-primary">{trucoStats.pointsWonVos}</span>
            <span className="text-xs text-on-surface-variant">/ {trucoStats.pointsWonEllos} rival</span>
          </div>
        </div>

        <div className="p-space-xs px-3 bg-surface-container rounded-lg border border-surface-container-high/40">
          <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider block">
            Puntos Envido &amp; Flor
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-title-lg font-bold text-secondary">
              {envidoStats.pointsWonVos + florStats.pointsWonVos}
            </span>
            <span className="text-xs text-on-surface-variant">
              / {envidoStats.pointsWonEllos + florStats.pointsWonEllos} rival
            </span>
          </div>
        </div>
      </div>

      {activeTab === 'chart' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-center bg-surface-container-lowest/60 p-space-md rounded-xl border border-surface-container-high/40">
          {/* Donut Chart: Overall Win Share */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-2">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm text-secondary">donut_large</span>
              <span>Distribución de Victorias</span>
            </div>
            <div className="relative flex items-center justify-center">
              <svg ref={chartRef}></svg>
            </div>
            <div className="flex items-center gap-space-md mt-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="text-on-surface font-semibold">Vos ({vosWins})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-secondary"></span>
                <span className="text-on-surface font-semibold">ElTape_99 ({ellosWins})</span>
              </div>
            </div>
          </div>

          {/* Grouped Bar Chart: Points won per Call Type */}
          <div className="md:col-span-7 flex flex-col items-center justify-center p-2 border-t md:border-t-0 md:border-l border-surface-container-high/60">
            <div className="flex items-center justify-between w-full mb-1 text-xs font-bold text-on-surface-variant uppercase tracking-wider px-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">bar_chart</span>
                <span>Puntos Ganados por Cante</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] normal-case">
                <span className="flex items-center gap-1 text-primary">
                  <span className="w-2.5 h-2.5 rounded bg-primary"></span> Vos
                </span>
                <span className="flex items-center gap-1 text-secondary">
                  <span className="w-2.5 h-2.5 rounded bg-secondary"></span> Rival
                </span>
              </div>
            </div>
            <div className="w-full flex items-center justify-center overflow-x-auto">
              <svg ref={barChartRef}></svg>
            </div>
            <div className="grid grid-cols-3 w-full text-center gap-2 mt-2 pt-2 border-t border-surface-container-high/40 text-[11px]">
              <div>
                <span className="text-on-surface-variant block">Efectividad Truco</span>
                <span className="font-bold text-primary">
                  {trucoStats.total > 0 ? `${Math.round((trucoStats.vos / trucoStats.total) * 100)}%` : '0%'}
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant block">Efectividad Envido</span>
                <span className="font-bold text-secondary">
                  {envidoStats.total > 0 ? `${Math.round((envidoStats.vos / envidoStats.total) * 100)}%` : '0%'}
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant block">Efectividad Flor</span>
                <span className="font-bold text-primary">
                  {florStats.total > 0 ? `${Math.round((florStats.vos / florStats.total) * 100)}%` : '100%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Event Log Feed */
        <div className="flex flex-col gap-space-xs">
          {/* Type filters */}
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-on-surface-variant font-bold uppercase mr-2">Filtrar Cante:</span>
            {(['All', 'Truco', 'Envido', 'Flor'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === filter
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                {filter === 'All' ? 'Todos' : filter}
              </button>
            ))}
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors border border-surface-container-high/40 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
                      evt.type === 'Truco'
                        ? 'bg-secondary-container/30 text-secondary border border-secondary/40'
                        : evt.type === 'Envido'
                        ? 'bg-primary-container text-primary border border-primary/40'
                        : 'bg-tertiary-container/40 text-tertiary border border-tertiary/40'
                    }`}
                  >
                    {evt.type}
                  </span>
                  <div>
                    <span className="font-bold text-on-surface">{evt.callName}</span>
                    <span className="text-on-surface-variant ml-1.5">({evt.detail})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-on-surface-variant text-[11px]">{evt.timestamp}</span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      evt.winner === 'Vos'
                        ? 'bg-primary text-on-primary'
                        : evt.winner === 'ElTape_99'
                        ? 'bg-secondary text-on-secondary'
                        : 'bg-surface-container-highest text-on-surface'
                    }`}
                  >
                    {evt.winner === 'Vos'
                      ? `+${evt.points} Vos`
                      : evt.winner === 'ElTape_99'
                      ? `+${evt.points} Rival`
                      : 'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
