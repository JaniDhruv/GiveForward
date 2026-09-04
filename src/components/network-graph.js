// GiveForward — Network Graph Visualization
// D3.js force-directed graph showing generosity chains

import * as d3 from 'd3';

export function createNetworkGraph(container, data, options = {}) {
  const {
    width: initialWidth = container.clientWidth || 900,
    height: initialHeight = container.clientHeight || 600,
    centerUserId = null,
    interactive = true,
    showLabels = true,
    animate = true,
  } = options;

  let width = initialWidth;
  let height = initialHeight;

  // Clear previous
  d3.select(container).selectAll('svg').remove();

  // Create SVG
  const svg = d3.select(container)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('overflow', 'visible');

  // Defs for gradients and filters
  const defs = svg.append('defs');

  // Glow filter
  const glowFilter = defs.append('filter')
    .attr('id', 'node-glow')
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%');

  glowFilter.append('feGaussianBlur')
    .attr('stdDeviation', '4')
    .attr('result', 'blur');

  glowFilter.append('feMerge')
    .selectAll('feMergeNode')
    .data(['blur', 'SourceGraphic'])
    .enter()
    .append('feMergeNode')
    .attr('in', d => d);

  // Arrow marker for directed edges
  defs.append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 28)
    .attr('refY', 5)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M 0 0 L 10 5 L 0 10 Z')
    .attr('fill', 'rgba(162, 155, 254, 0.4)');

  // Main group (for zoom/pan)
  const g = svg.append('g');

  // Zoom behavior
  if (interactive) {
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Initial zoom to fit
    const initialScale = Math.min(width, height) / 800;
    svg.call(zoom.transform, d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(Math.max(0.5, Math.min(1.2, initialScale)))
      .translate(-width / 2, -height / 2)
    );
  }

  // Deep copy nodes and links to avoid D3 mutation issues
  const nodes = data.nodes.map(d => ({ ...d }));
  const links = data.links.map(d => ({ ...d }));

  // Force simulation
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links)
      .id(d => d.id)
      .distance(120)
      .strength(0.5)
    )
    .force('charge', d3.forceManyBody()
      .strength(-300)
      .distanceMax(400)
    )
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(35))
    .force('x', d3.forceX(width / 2).strength(0.05))
    .force('y', d3.forceY(height / 2).strength(0.05));

  // If centering on a user, pull them to center
  if (centerUserId) {
    simulation.force('centerUser', (alpha) => {
      nodes.forEach(n => {
        if (n.id === centerUserId) {
          n.vx += (width / 2 - n.x) * alpha * 0.3;
          n.vy += (height / 2 - n.y) * alpha * 0.3;
        }
      });
    });
  }

  // Draw links
  const linkGroup = g.append('g').attr('class', 'links');

  const link = linkGroup.selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke', 'rgba(162, 155, 254, 0.2)')
    .attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '6 4')
    .attr('marker-end', 'url(#arrow)')
    .style('opacity', animate ? 0 : 1);

  // Animate links appearing
  if (animate) {
    link.transition()
      .delay((d, i) => i * 80)
      .duration(600)
      .style('opacity', 1);
  }

  // Animated dash flow
  function animateDashes() {
    link.attr('stroke-dashoffset', 0)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', -20)
      .on('end', function() {
        d3.select(this)
          .attr('stroke-dashoffset', 0);
      });

    setTimeout(animateDashes, 2100);
  }
  if (animate) {
    setTimeout(animateDashes, 1500);
  }

  // Draw nodes
  const nodeGroup = g.append('g').attr('class', 'nodes');

  const node = nodeGroup.selectAll('g')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .style('cursor', interactive ? 'grab' : 'default');

  // Node outer glow circle
  node.append('circle')
    .attr('class', 'node-glow')
    .attr('r', d => getNodeRadius(d) + 6)
    .attr('fill', d => d.color || '#6C5CE7')
    .attr('opacity', 0.12)
    .attr('filter', 'url(#node-glow)');

  // Node main circle
  node.append('circle')
    .attr('class', 'node-circle')
    .attr('r', d => getNodeRadius(d))
    .attr('fill', d => {
      // Create gradient effect
      const id = `grad-${d.id}`;
      const grad = defs.append('radialGradient')
        .attr('id', id)
        .attr('cx', '35%')
        .attr('cy', '35%');
      grad.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', lightenColor(d.color || '#6C5CE7', 30));
      grad.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d.color || '#6C5CE7');
      return `url(#${id})`;
    })
    .attr('stroke', d => d.color || '#6C5CE7')
    .attr('stroke-width', 2)
    .attr('stroke-opacity', 0.5);

  // Center user highlight
  if (centerUserId) {
    node.filter(d => d.id === centerUserId)
      .select('.node-glow')
      .attr('opacity', 0.25)
      .attr('r', d => getNodeRadius(d) + 12);
  }

  // Node initials text
  node.append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('fill', 'white')
    .attr('font-family', "'Space Grotesk', sans-serif")
    .attr('font-weight', '700')
    .attr('font-size', d => d.actCount > 3 ? '13px' : '11px')
    .text(d => d.initials)
    .style('pointer-events', 'none');

  // Name labels
  if (showLabels) {
    node.append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', d => getNodeRadius(d) + 16)
      .attr('fill', 'rgba(240, 240, 255, 0.6)')
      .attr('font-family', "'Inter', sans-serif")
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .text(d => d.name.split(' ')[0])
      .style('pointer-events', 'none')
      .style('opacity', 0.7);
  }

  // Node entrance animation
  if (animate) {
    node.style('opacity', 0)
      .attr('transform', 'scale(0)')
      .transition()
      .delay((d, i) => i * 60)
      .duration(500)
      .ease(d3.easeCubicOut)
      .style('opacity', 1)
      .attr('transform', 'scale(1)');
  }

  // Tooltip
  const tooltip = d3.select(container)
    .append('div')
    .attr('class', 'graph-tooltip')
    .style('position', 'absolute')
    .style('padding', '10px 14px')
    .style('background', 'rgba(18, 18, 42, 0.95)')
    .style('backdrop-filter', 'blur(12px)')
    .style('border', '1px solid rgba(255,255,255,0.1)')
    .style('border-radius', '10px')
    .style('color', '#f0f0ff')
    .style('font-size', '12px')
    .style('font-family', "'Inter', sans-serif")
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('z-index', 100)
    .style('box-shadow', '0 8px 32px rgba(0,0,0,0.4)');

  // Hover interactions
  if (interactive) {
    node.on('mouseenter', function(event, d) {
      d3.select(this).select('.node-circle')
        .transition()
        .duration(200)
        .attr('r', getNodeRadius(d) + 4)
        .attr('stroke-width', 3)
        .attr('stroke-opacity', 0.8);

      d3.select(this).select('.node-glow')
        .transition()
        .duration(200)
        .attr('r', getNodeRadius(d) + 14)
        .attr('opacity', 0.25);

      // Highlight connected links
      link.transition().duration(200)
        .attr('stroke', l =>
          (l.source.id === d.id || l.target.id === d.id)
            ? 'rgba(162, 155, 254, 0.6)'
            : 'rgba(162, 155, 254, 0.08)'
        )
        .attr('stroke-width', l =>
          (l.source.id === d.id || l.target.id === d.id) ? 2.5 : 1
        );

      // Show tooltip
      tooltip
        .html(`
          <div style="font-weight:600;margin-bottom:4px;">${d.name}</div>
          <div style="color:rgba(240,240,255,0.5);">${d.actCount} act${d.actCount !== 1 ? 's' : ''} of generosity</div>
        `)
        .style('left', `${event.offsetX + 16}px`)
        .style('top', `${event.offsetY - 10}px`)
        .transition()
        .duration(150)
        .style('opacity', 1);
    })
    .on('mousemove', function(event) {
      tooltip
        .style('left', `${event.offsetX + 16}px`)
        .style('top', `${event.offsetY - 10}px`);
    })
    .on('mouseleave', function(event, d) {
      d3.select(this).select('.node-circle')
        .transition()
        .duration(300)
        .attr('r', getNodeRadius(d))
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.5);

      d3.select(this).select('.node-glow')
        .transition()
        .duration(300)
        .attr('r', getNodeRadius(d) + 6)
        .attr('opacity', 0.12);

      link.transition().duration(300)
        .attr('stroke', 'rgba(162, 155, 254, 0.2)')
        .attr('stroke-width', 1.5);

      tooltip.transition().duration(200).style('opacity', 0);
    });

    // Drag behavior
    const drag = d3.drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        d3.select(event.sourceEvent.target.parentNode).style('cursor', 'grabbing');
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        d3.select(event.sourceEvent.target.parentNode).style('cursor', 'grab');
      });

    node.call(drag);
  }

  // Tick function — update positions
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node.attr('transform', d => `translate(${d.x}, ${d.y})`);
  });

  // Pulse animation for center user
  if (centerUserId && animate) {
    setInterval(() => {
      node.filter(d => d.id === centerUserId)
        .select('.node-glow')
        .transition()
        .duration(1000)
        .attr('opacity', 0.35)
        .transition()
        .duration(1000)
        .attr('opacity', 0.2);
    }, 2200);
  }

  // Return control interface
  return {
    simulation,
    destroy() {
      simulation.stop();
      tooltip.remove();
      d3.select(container).selectAll('svg').remove();
    },
    resize(newWidth, newHeight) {
      width = newWidth;
      height = newHeight;
      svg.attr('viewBox', `0 0 ${width} ${height}`);
      simulation.force('center', d3.forceCenter(width / 2, height / 2));
      simulation.force('x', d3.forceX(width / 2).strength(0.05));
      simulation.force('y', d3.forceY(height / 2).strength(0.05));
      simulation.alpha(0.3).restart();
    },
    highlightChain(chainId) {
      const chainLinks = links.filter(l => l.chainId === chainId);
      const chainNodeIds = new Set(chainLinks.flatMap(l => [
        typeof l.source === 'object' ? l.source.id : l.source,
        typeof l.target === 'object' ? l.target.id : l.target,
      ]));

      link.transition().duration(300)
        .attr('stroke', l => l.chainId === chainId ? 'rgba(255, 107, 107, 0.6)' : 'rgba(162, 155, 254, 0.06)')
        .attr('stroke-width', l => l.chainId === chainId ? 3 : 0.5);

      node.transition().duration(300)
        .style('opacity', d => chainNodeIds.has(d.id) ? 1 : 0.2);
    },
    resetHighlight() {
      link.transition().duration(300)
        .attr('stroke', 'rgba(162, 155, 254, 0.2)')
        .attr('stroke-width', 1.5);

      node.transition().duration(300)
        .style('opacity', 1);
    },
  };
}

// Helper: get node radius based on activity
function getNodeRadius(d) {
  const base = 18;
  const bonus = Math.min(d.actCount * 2, 12);
  return base + bonus;
}

// Helper: lighten a hex color
function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent));
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(2.55 * percent));
  const b = Math.min(255, (num & 0x0000FF) + Math.round(2.55 * percent));
  return `rgb(${r}, ${g}, ${b})`;
}
