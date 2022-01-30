// Function to create random data in format: [date, amount]
async function createData() {
  const authToken = localStorage.getItem('authtoken');
  if (!authToken) {
    window.location.href = "./login.html";
  }
  const response = await axios.get('http://localhost:5000/api/records', {
    headers: {
      'auth-token': authToken
    }
  });
  let data = [];
  const records = response.data.records;
  for (var i = 0; i < records.length; i++) {
    const record = records[i];
    data.push({
      date: record.date,
      amount: record.reps
    });

  }
  return data;
}

async function getStats() {
  let data = await createData();
  const margin = { top: 30, right: 20, bottom: 60, left: 65 };
  const width = 800 - (margin.left + margin.right);
  const height = 300 - (margin.top + margin.bottom);
  const labelOffset = 50;
  const axisOffset = 16;

  const x = d3.scaleBand().
    rangeRound([0, width]).
    domain(data.map(d => d.date)).
    padding(0.5);

  const y = d3.scaleLinear().
    range([height, 0]).
    domain([0, d3.max(data, d => d.amount)]);

  const xAxis = d3.axisBottom().
    scale(x).
    tickSize(0)

  const yAxis = d3.axisLeft().
    ticks(4).
    tickSize(-width).
    scale(y.nice());

  const svg = d3.select('svg').
    attr('class', 'graph').
    attr('width', width + (margin.left + margin.right)).
    attr('height', height + (margin.top + margin.bottom)).
    append('g').
    attr('class', 'group-container').
    attr('transform', `translate(${margin.left}, ${margin.top})`).
    attr('font-family', 'ibm-plex-sans');
  svg.append('g').
    attr('class', 'axis y').
    attr('stroke-dasharray', '4').
    call(yAxis).
    selectAll('text').
    attr("x", -axisOffset).
    attr('font-family', 'ibm-plex-sans');

  const yLabel = svg.select('.y').
    append('text').
    text('USAGE ($)').
    attr('class', 'label').
    attr('transform', `translate(${-labelOffset}, ${height / 2}) rotate(-90)`).
    attr('font-family', 'ibm-plex-sans');

  svg.append('g').
    attr('class', 'axis x').
    attr('transform', `translate(0, ${height})`).
    call(xAxis).
    selectAll('text').
    attr("y", axisOffset).
    attr('font-family', 'ibm-plex-sans');

  // // Add X axis label
  const xLabel = svg.select('.x').
    append('text').
    text('MONTH').
    attr('class', 'label').
    attr('transform', `translate(${width / 2}, ${labelOffset})`).
    attr('font-family', 'ibm-plex-sans');

  svg.append('g').
    attr('class', 'bar-container').
    selectAll('rect').
    data(data).
    enter().append('rect').
    attr('class', 'bar').
    attr('x', d => x(d.date)).
    attr('y', d => height).
    attr('height', 0).
    attr('width', x.bandwidth()).
    attr('fill', '#00A78F').
    transition().
    duration(500).
    delay((d, i) => i * 50).
    attr('height', d => height - y(d.amount)).
    attr('y', d => y(d.amount));

  // Select Tooltip
  const tooltip = d3.select('.tooltip');

  const bars = svg.selectAll('.bar').
    on('mouseover', function (d) {
      let color = d3.color('#00A78F').darker();
      d3.select(this).
        attr('fill', color);
      tooltip.
        style('display', 'inherit').
        text(`${d.amount}`).
        style('top', `${y(d.amount) - axisOffset}px`);

      let bandwidth = x.bandwidth();
      let tooltipWidth = tooltip.nodes()[0].getBoundingClientRect().width;
      let offset = (tooltipWidth - bandwidth) / 2;

      tooltip.
        style('left', `${x(d.date) + margin.left - offset}px`);
    }).
    on('mouseout', function (d) {
      d3.select(this).
        transition().
        duration(250).
        attr('fill', '#00A78F');
      tooltip.
        style('display', 'none');
    });
}
