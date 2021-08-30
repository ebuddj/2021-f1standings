import React, {Component} from 'react';
import style from './../styles/styles.less';

// https://d3js.org/
import * as d3 from 'd3';

// https://github.com/Tarkeasy/round-flags
import { BH,IT,PT,ES,MC,AZ,FR,AT,GB,HU,BE} from 'round-flags';

let interval1,
    interval2,
    flags = {};
// https://www.iban.com/country-codes
flags['BHR'] = BH;
flags['ITA'] = IT;
flags['PRT'] = PT;
flags['ESP'] = ES;
flags['MCO'] = MC;
flags['AZE'] = AZ;
flags['FRA'] = FR;
flags['AUT'] = AT;
flags['AUT2'] = AT;
flags['GBR'] = GB;
flags['HUN'] = HU;
flags['BEL'] = BE;


const getHashValue = (key) => {
  let matches = location.hash.match(new RegExp(key+'=([^&]*)'));
  return matches ? matches[1] : null;
}

const data_type = getHashValue('type') ? getHashValue('type') : 'drivers',
      title = getHashValue('title') ? (getHashValue('title') === 'false') ? '' : '<h1>' + getHashValue('title').replace(/%20/g, ' ') + '</h1>' : '<h1>Title battle 2021</h1>';

const max_y_axis_value = (data_type === 'drivers') ? 225 : 350,
      max_y_axis_step = (data_type === 'drivers') ? 25 : 50,
      title_offset = (data_type === 'drivers') ? 2 : 4,
      title_html = (data_type === 'drivers') ? '<div class="' + style.title_container + '">' + title + '<div><h3 class="' + style.mercedes + '"><span class="' + style.position + '">1</span><span class="' + style.name + '">Hamilton #44</span><span class="' + style.team + '">Mercedes</span></h3></div><div><h3 class="' + style.redbull + '"><span class="' + style.position + '">2</span><span class="' + style.name + '">Verstappen #33</span><span class="' + style.team + '">Red Bull</span></h3></div></div>' : '<div class="' + style.title_container + '">' + title + '<div><h3 class="' + style.mercedes + '"><span class="' + style.position + '">1</span><span class="' + style.name + '">Mercedes AMG Petronas</span></h3></div><div><h3 class="' + style.redbull + '"><span class="' + style.position + '">2</span><span class="' + style.name + '">Red Bull Racing Honda</span></h3></div></div>',
      races = ['','BHR','ITA','PRT','ESP','MCO','AZE','FRA','AUT','AUT2','GBR','HUN','BEL'];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
    }
  }
  componentDidMount() {
    setTimeout(() => {
      this.createChart();
    }, 500);
  }
  componentDidUpdate(prevProps, prevState, snapshot) {

  }
  componentWillUnMount() {
    clearInterval(interval1);
    clearInterval(interval2);
  }
  createChart() {
    const width = 600,
          height = 600,
          adj = 50;

    let div = d3.select('.' + style.app)
                .append('div')
                .attr('class', style.tooltip)
                .style('opacity', 0);

    // We are appending SVG first.
    const svg = d3.select('.' + style.chart_container).append('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', '-' + adj + ' -' + adj + ' ' + (width + adj * 3) + ' ' + (height + adj * 3))
      .classed('svg-content', true);

    // Fetch the data.
    d3.csv('./data/data - ' + data_type + ' - data.csv').then((data) => {
      let data_points = [];
      let slices = data.map((values, i) => {
        return {
          color:(i === 0) ? '#00d2be' : (i === 1) ? '#0600ef' : 'rgba(0, 0, 0, 0.1)', 
          current_pos: i + 1,
          highlighted:(i < 2) ? true : false,
          name:values.name,
          values:races.map((race, j) => {
            let max = d3.max(data, (d) => +d[race]);
            if (race !== '') {
              data_points.push({
                color:(i === 0) ? '#00d2be' : (i === 1) ? '#0600ef' : 'rgba(0, 0, 0, 0.1)', 
                dot_line_class:'dot_line_' + i,
                highlighted:(i < 2) ? true : false,
                position:(parseFloat(values[race]) >= max) ? 'top' : (i >= 2) ? 'top' : 'bottom',
                x:j,
                y:+values[race]
              });
            }
            return {
              points:(values[race]) ? +values[race] : 0,
              race:race
            }
          })
        }
      })

      // Prepare the initial data and store the rest for later use.
      let to_be_added_slices = {};
      slices = slices.map((slice, i) => {
        to_be_added_slices[i] = slice.values.splice(-slice.values.length + 1);
        return slice;
      });

      // Scales.
      const xScale = d3.scaleLinear().range([0, width]);
      const yScale = d3.scaleLinear().range([height, 0]);
      xScale.domain([0, races.length - 1]);
      yScale.domain([0, max_y_axis_value]);

      // Grid lines.
      const make_y_gridlines = () => d3.axisLeft(yScale).ticks(parseInt(max_y_axis_value / max_y_axis_step) - 1).tickValues(d3.range(0, max_y_axis_value, max_y_axis_step));
      // Add the Y gridlines
      svg.append('g')
        .attr('class', style.grid)
        .call(make_y_gridlines()
          .tickSize(-width - 20)
          .tickFormat('')
        );

      // Grid Axes.
      svg.append('g')
        .attr('class', style.axis + ' ' + style.xaxis)
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom()
          .ticks(races.length - 1)
          .tickFormat(i => races[i])
          .scale(xScale))
        .append('text')
        .attr('y', 43)
        .attr('x', 3)
        .attr('text-anchor', 'middle')
        .text('Races');

      svg.select('.' + style.axis)
        .selectAll('.tick')
        .data(races)
        .append('svg:image')
        .attr('class', style.axis_image)
        .attr('xlink:href', (d) => { return flags[d]; })
        .attr('height', 30).attr('width', 30).attr('x', -15).attr('y', 25);

      svg.append('g')
        .attr('class', style.axis)
        .call(d3.axisLeft()
          .ticks(parseInt(max_y_axis_value / max_y_axis_step))
          .tickValues(d3.range(0, max_y_axis_value + max_y_axis_step, max_y_axis_step))
          .scale(yScale))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('dy', '1em')
        .attr('y', 6)
        .style('text-anchor', 'end')
        .text('Points');


      // Create the lines with current data.
      const lines = svg.selectAll('lines').data(slices).enter().append('g');
      const line = d3.line()
        .x((d, i) => xScale(i))
        .y((d, i) => yScale(d.points));
      const updateData = () => {
        // Remove any old lines.
        svg.selectAll('.' + style.line).remove();

        // Add the lines.
        lines.append('path')
            .attr('class', (d, i) => style.line + ' line_' + i)
            .attr('stroke', (d) => d.color)
            .attr('stroke-width', (d) => (d.highlighted === true) ? '4px': '1px')
            .attr('d', (d) => line(d.values))
            .on('mouseover', (event, d) => {
              if (d.highlighted === true) {
                d3.selectAll('.' + style.dot_text + '.dot_line_0, .' + style.dot_text + '.dot_line_1')
                  .style('font-size', '15pt');
              }
            });
      };

      // Add data in an interval.
      interval1 = setInterval(() => {
        slices = slices.map((slice, i) => {
          slice.values.push(to_be_added_slices[i].shift());
          return slice;
        });
        updateData();
        if (to_be_added_slices[0].length === 0) {
          clearInterval(interval1);
          let i = 2;
          setTimeout(() => {
            interval2 = setInterval(() => {
              this.activateLine('line_' + i, slices[i], div);
              if (i > 2) {
                this.deactivateLine('line_' + (i - 1), slices[i], div, false);
              }
              i++;
              if (i >= slices.length ) {
                clearInterval(interval2)
                setTimeout(() => {
                  this.deactivateLine('line_' + (i - 1), slices[i], div, true, false);
                  setTimeout(() => {
                    d3.selectAll('.' + style.dot_text + '.dot_line_0, .' + style.dot_text + '.dot_line_1')
                      .style('font-size', '15pt');
                    this.createInteractiveLayer(svg, line, slices, div);
                  }, 1000); // Wait before creating the interactivity layer.
                }, 1500); // Wait before hiding the last driver
              }
            }, 1500);  // Wait between activating each line.
          }, 2000); // Wait before showing the lines.
        }
      }, 1000); // Wait between showing each race.
      
      // Add dots.
      svg.selectAll('.' + style.dot)
        .data(data_points)
        .enter().append('circle')
        .attr('class', (d) => style.dot + ' ' + d.dot_line_class)
        .attr('cx', (d) => xScale(d.x))
        .attr('cy', (d) => yScale(d.y))
        .attr('fill', (d) => d.color)
        .attr('r', (d) => (d.highlighted === true) ? 6 : 2)
        .on('mouseover', (event, d) => {
          if (d.highlighted === true) {
            d3.selectAll('.' + style.dot_text + '.dot_line_0, .' + style.dot_text + '.dot_line_1')
              .style('font-size', '15pt');
          }
        });

      // Add dot texts.
       svg.selectAll('.' + style.dot_text)
        .data(data_points)
        .enter().append('text')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'central')
        .attr('x', (d) => xScale(d.x))
        .attr('y', (d) => (d.position === 'top') ? yScale(d.y + 10) : yScale(d.y - 10))
        .style('font-weight', (d, i) => (d.position === 'top') ? 600 : 400)
        .style('font-size', (d, i) => (d.highlighted === true) ? '15pt' : 0)
        .attr('class', (d) => style.dot_text + ' ' + d.dot_line_class)
        .text((d) => (d.highlighted === true) ? d.y : d.y);

      svg.append('foreignObject')
        .attr('alignment-baseline', 'central')
        .attr('height', 200)
        .attr('text-anchor', 'middle')
        .attr('width', 450)
        .attr('x', xScale(1))
        .attr('y', yScale(max_y_axis_value - title_offset))
        .html(title_html);
    });
  }
  activateLine(line_id, d, div) {
    d3.select('.' + line_id)
      .attr('stroke', '#000')
      .attr('stroke-width', '2px');
    d3.selectAll('.' + style.dot + '.dot_' + line_id)
      .attr('r', 4)
      .attr('fill', '#000');
    d3.selectAll('.' + style.dot_text)
      .style('font-size', 0)
    d3.selectAll('.' + style.dot_text + '.dot_' + line_id)
      .style('font-size', '13pt');
    div.transition()
      .duration(0)
      .style('opacity', .9);

    let left = (event && event.pageX) ? (event.pageX + 15) + 'px' : (d3.selectAll('.' + style.dot + '.dot_' + line_id).nodes()[races.length - 4].getBoundingClientRect().x) + 'px';
    let top = (event && event.pageY) ? (event.pageY - 20) + 'px' : (d3.selectAll('.' + style.dot + '.dot_' + line_id).nodes()[races.length - 4].getBoundingClientRect().y + 20) + 'px';

    div.html(d.current_pos + ' <span class="' + style.tooltip_name + '">' + d.name + '</span>')
      .style('left', left)
      .style('top', top);
  }
  deactivateLine(line_id, d, div, deactive_tooltip = true, tooltip_delay = true) {
      d3.select('.' + line_id)
        .attr('stroke', 'rgba(0, 0, 0, 0.1)')
        .attr('stroke-width', '1px');
      d3.selectAll('.' + style.dot + '.dot_' + line_id)
        .attr('r', 2)
        .attr('fill', 'rgba(0, 0, 0, 0.1)');
      d3.selectAll('.' + style.dot_text + '.dot_' + line_id)
        .style('font-size', 0)
      if (deactive_tooltip === true) {
        if (tooltip_delay === true) {
          div.transition()
            .delay(200)
            .duration(500)
            .style('opacity', 0);
        }
        else {
          div.style('opacity', 0);
        }
      }
  }
  createInteractiveLayer(svg, line, slices, div) {
    svg.selectAll('lines_interactivity').data(slices).enter().append('g').append('path')
      .attr('class', style.line_interactivity)
      .attr('data-line-id', (d, i) => 'line_' + i)
      .attr('stroke', (d) => 'transparent')
      .attr('stroke-opacity', (d) => 1)
      .attr('stroke-width', (d) => (d.highlighted === true) ? '0': '10px')
      .attr('d', (d) => line(d.values))
      .on('mouseover', (event, d) => this.activateLine(d3.select(event.currentTarget).attr('data-line-id'), d, div))
      .on('mouseout', (event, d) => this.deactivateLine(d3.select(event.currentTarget).attr('data-line-id'), d, div));
  }
  // shouldComponentUpdate(nextProps, nextState) {}
  // static getDerivedStateFromProps(props, state) {}
  // getSnapshotBeforeUpdate(prevProps, prevState) {}
  // static getDerivedStateFromError(error) {}
  // componentDidCatch() {}
  render() {
    return (
      <div className={style.app}>
        <div className={style.chart_container}>
        </div>
      </div>
    );
  }
}
export default App;