import * as d3 from "d3";
import {
  useEffect,
  useRef,
} from "react";

export default function BusinessApplicationsChart() {
  const svgRef = useRef();

  useEffect(() => {
    d3.csv(
      "/data/BusinessApplications.csv"
    ).then((data) => {
      const parsed = data.map((d) => ({
        date: new Date(
          d.observation_date
        ),
        value:
          +d.BABATOTALSAUS / 1000,
      }));

      drawChart(parsed);
    });
  }, []);

  const drawChart = (data) => {
    d3.select(svgRef.current)
      .selectAll("*")
      .remove();

    // ======================
    // SIZE
    // ======================

    const width = 1800;
    const height = 850;

    const margin = {
      top: 80,
      right: 80,
      bottom: 70,
      left: 100,
    };

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // ======================
    // SCALE
    // ======================

    const x = d3
      .scaleTime()
      .domain(
        d3.extent(data, (d) => d.date)
      )
      .range([
        margin.left,
        width - margin.right,
      ]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.value) -
          15,
        d3.max(data, (d) => d.value) +
          15,
      ])
      .range([
        height - margin.bottom,
        margin.top,
      ]);

    // ======================
    // GRID
    // ======================

    svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},0)`
      )
      .call(
        d3
          .axisLeft(y)
          .tickSize(
            -(
              width -
              margin.left -
              margin.right
            )
          )
          .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", "#d9d9d9");

    svg
      .append("g")
      .attr(
        "transform",
        `translate(0,${
          height - margin.bottom
        })`
      )
      .call(
        d3
          .axisBottom(x)
          .tickSize(
            -(
              height -
              margin.top -
              margin.bottom
            )
          )
          .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", "#d9d9d9");

    // ======================
    // AXIS
    // ======================

    svg
      .append("g")
      .attr(
        "transform",
        `translate(0,${
          height - margin.bottom
        })`
      )
      .call(d3.axisBottom(x));

    svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},0)`
      )
      .call(d3.axisLeft(y));

    // ======================
    // TITLE
    // ======================

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 42)
      .attr("text-anchor", "middle")
      .style("font-size", "42px")
      .style("font-weight", "700")
      .text(
        "U.S. Business Applications (Total, All NAICS)"
      );

    // ======================
    // SUBTITLE
    // ======================

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 78)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("fill", "#777")
      
      .text(
        "tracks the total number of U.S. business applications filed each month"
      );

    // ======================
    // Y LABEL
    // ======================

    svg
      .append("text")
      .attr(
        "transform",
        "rotate(-90)"
      )
      .attr("x", -height / 2)
      .attr("y", 40)
      .style("font-size", "18px")
      .text(
        "Applications per month (thousands)"
      );

    // ======================
    // LEGEND
    // ======================

    svg
      .append("line")
      .attr("x1", 115)
      .attr("x2", 155)
      .attr("y1", 105)
      .attr("y2", 105)
      .attr("stroke", "#2ca02c")
      .attr("stroke-width", 4);

    svg
      .append("text")
      .attr("x", 175)
      .attr("y", 111)
      .style("font-size", "18px")
      .text("Business Applications");

    // ======================
    // AVERAGE LINE
    // ======================

    svg
      .append("line")
      .attr("x1", margin.left)
      .attr(
        "x2",
        width - margin.right
      )
      .attr("y1", y(292))
      .attr("y2", y(292))
      .attr("stroke", "#999")
      .attr("stroke-dasharray", "4 4");

    svg
      .append("text")
      .attr("x", 210)
      .attr("y", y(292) - 12)
      .style("fill", "#666")
      .style("font-size", "16px")
      .text(
        "2018-19 average (292K/month)"
      );

    // ======================
    // CHATGPT RELEASE
    // ======================

    const gptDate = new Date(2022, 10);

    svg
      .append("line")
      .attr("x1", x(gptDate))
      .attr("x2", x(gptDate))
      .attr("y1", margin.top)
      .attr(
        "y2",
        height - margin.bottom
      )
      .attr("stroke", "#888")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "6 5");

    svg
      .append("text")
      .attr("x", x(gptDate) + 18)
      .attr("y", 95)
      .style("fill", "#777")
      .style("font-size", "18px")
      .text("ChatGPT release");

    svg
      .append("text")
      .attr("x", x(gptDate) + 18)
      .attr("y", 128)
      .style("fill", "#777")
      .style("font-size", "18px")
      .text("(Nov 2022)");

    // ======================
    // SHADED AREA
    // ======================

    const shadedArea = svg
      .append("rect")
      .attr("x", x(gptDate))
      .attr("y", margin.top)
      .attr(
        "width",
        width -
          margin.right -
          x(gptDate)
      )
      .attr(
        "height",
        height -
          margin.top -
          margin.bottom
      )
      .attr("fill", "#22c55e")
      .attr("opacity", 0.03);

    // pulse animation
    function pulse() {
      shadedArea
        .transition()
        .duration(2400)
        .ease(d3.easeSinInOut)
        .attr("opacity", 0.08)
        .transition()
        .duration(2400)
        .ease(d3.easeSinInOut)
        .attr("opacity", 0.03)
        .on("end", pulse);
    }

    pulse();

    // ======================
    // LINE
    // ======================

    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    const path = svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#2ca02c")
      .attr("stroke-width", 5)
      .attr("d", line);

    // ======================
    // DRAW ANIMATION
    // ======================

    const totalLength =
      path.node().getTotalLength();

    path
      .attr(
        "stroke-dasharray",
        totalLength
      )
      .attr(
        "stroke-dashoffset",
        totalLength
      )
      .transition()
      .duration(2500)
      .ease(d3.easeElasticOut)
      .attr("stroke-dashoffset", 0);

    // ======================
    // AFTER GPT GLOW
    // ======================

    const afterGPTData = data.filter(
      (d) => d.date >= gptDate
    );

    const glowLine = svg
      .append("path")
      .datum(afterGPTData)
      .attr("fill", "none")
      .attr("stroke", "#4ade80")
      .attr("stroke-width", 7)
      .attr("opacity", 0.5)
      .attr(
        "d",
        line(afterGPTData)
      );

    // ======================
    // MOVING DOT
    // ======================

    const glowDot = svg
      .append("circle")
      .attr("r", 7)
      .attr("fill", "#4ade80")
      .attr("opacity", 0);

    const glowPathNode =
      glowLine.node();

    const glowPathLength =
      glowPathNode.getTotalLength();

    function animateDot() {
      glowDot.attr("opacity", 1);

      glowDot
        .transition()
        .duration(5000)
        .ease(d3.easeLinear)
        .attrTween(
          "transform",
          () => {
            return (t) => {
              const point =
                glowPathNode.getPointAtLength(
                  t * glowPathLength
                );

              return `translate(${point.x},${point.y})`;
            };
          }
        )
        .on("end", animateDot);
    }

    setTimeout(() => {
      animateDot();
    }, 3500);

    // ======================
    // TEXT ANNOTATION
    // ======================

    svg
      .append("text")
      .attr(
        "x",
        x(new Date(2024, 1))
      )
      .attr(
        "y",
        y(520)
      )
      .style("font-size", "24px")
      .style("font-weight", "700")
      .style("fill", "#16a34a")
      .style("opacity", 0)
      .text(
        "Entrepreneurship accelerated"
      )
      .transition()
      .delay(5600)
      .duration(1000)
      .style("opacity", 0.95);
  };

  return (
    <div
      style={{
        width: "100%",
        overflowX: "scroll",
        overflowY: "hidden",
      }}
    >
      <svg ref={svgRef}></svg>
    </div>
  );
}