import { Directive, ElementRef, inject, input, effect } from '@angular/core';
import * as d3 from 'd3';

@Directive({
  selector: '[appD3BarChart]',
  standalone: true,
})
export class D3BarChartDirective {
  private el = inject(ElementRef);
  data = input<{ label: string; value: number }[]>();

  constructor() {
    effect(() => {
      const chartData = this.data();
      if (chartData && chartData.length > 0) {
        this.createChart(chartData);
      }
    });
  }

  private createChart(data: { label: string; value: number }[]): void {
    d3.select(this.el.nativeElement).select('svg').remove();

    const element = this.el.nativeElement;
    const margin = { top: 20, right: 20, bottom: 70, left: 40 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X axis
    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.label))
      .padding(0.2);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end')
      .style('fill', '#9ca3af');

    // Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) ?? 0])
      .range([height, 0]);
      
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('fill', '#9ca3af');

    // Bars
    svg.selectAll('mybar')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.label) as number)
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.value))
      .attr('fill', '#4f46e5');
  }
}
